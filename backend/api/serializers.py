from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, ProjectMembership, ProjectInvitation, Task, Comment

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class CommentSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'author_name', 'author_email', 'comment', 'created_at']
        read_only_fields = ['id', 'task', 'author', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    assignee_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'code', 'title', 'description', 'status', 'due_date',
            'assignee_email', 'assignee_name', 'project',
            'created_by', 'comments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'project', 'created_by', 'created_at', 'updated_at']

    def get_assignee_name(self, obj):
        if obj.assignee:
            return obj.assignee.username
        if obj.assignee_email:
            return obj.assignee_email.split('@')[0]
        return 'Unassigned'

    def validate(self, attrs):
        # 1. Ensure title is within 150 characters
        title = attrs.get('title')
        if title and len(title) > 150:
            raise serializers.ValidationError({"title": "Task title cannot exceed 150 characters."})

        # 2. Assignee Email project boundary check
        assignee_email = attrs.get('assignee_email')
        project = self.context.get('project') or (self.instance.project if self.instance else None)

        if assignee_email and project:
            clean_email = assignee_email.strip().lower()
            eligible_emails = project.get_all_eligible_emails()

            if clean_email not in eligible_emails:
                raise serializers.ValidationError({
                    "assignee_email": f"'{clean_email}' has not been invited to project '{project.title}'. Please invite them first."
                })

        return attrs


class ProjectInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectInvitation
        fields = ['id', 'email', 'status', 'token', 'created_at']
        read_only_fields = ['id', 'token', 'status', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    owner_email = serializers.SerializerMethodField()
    members_emails = serializers.SerializerMethodField()
    pending_invites = serializers.SerializerMethodField()
    open_tasks_count = serializers.SerializerMethodField()
    total_members_count = serializers.SerializerMethodField()

    # Stage 1: Optional list of emails to invite during project creation
    invite_emails = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Project
        fields = [
            'id', 'code', 'title', 'description', 'owner', 'owner_email',
            'status', 'members_emails', 'pending_invites',
            'open_tasks_count', 'total_members_count', 'invite_emails',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'owner', 'created_at', 'updated_at']

    def validate_status(self, value):
        # If marking as DONE, verify that all tasks under this project are completed
        if value == 'DONE' and self.instance:
            open_tasks = self.instance.tasks.exclude(status='DONE')
            if open_tasks.exists():
                count = open_tasks.count()
                raise serializers.ValidationError(
                    f"Cannot mark project as DONE while there are {count} open task(s). All tasks must be DONE first."
                )
        return value

    def get_owner_email(self, obj):
        return obj.owner.email or f"{obj.owner.username}@teamflow.app"

    def get_members_emails(self, obj):
        return [m.member.email or m.member.username for m in obj.memberships.select_related('member').all()]

    def get_pending_invites(self, obj):
        return [inv.email for inv in obj.invitations.filter(status='PENDING')]

    def get_open_tasks_count(self, obj):
        return obj.tasks.exclude(status='DONE').count()

    def get_total_members_count(self, obj):
        return obj.memberships.count() + 1

    def validate_title(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("Project title cannot exceed 100 characters.")
        return value

    def create(self, validated_data):
        invite_emails = validated_data.pop('invite_emails', [])
        user = self.context['request'].user
        
        # 1. Create project with creator as owner
        project = Project.objects.create(owner=user, **validated_data)

        # 2. Process invite emails (creates ProjectMembership or ProjectInvitation)
        for email in invite_emails:
            project.invite_by_email(email, invited_by=user)

        return project


class AssigneeOptionSerializer(serializers.Serializer):
    """
    Returns options for the Task Creation Assignee dropdown:
    Populated by emails only: Owner, Registered Members, and Pending Email Invites.
    """
    email = serializers.EmailField()
    name = serializers.CharField()
    status = serializers.CharField()  # 'OWNER', 'MEMBER', 'PENDING'