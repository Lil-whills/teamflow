from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, ProjectMembership, ProjectInvitation, Task, Comment
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    CommentSerializer,
    ProjectInvitationSerializer,
    AssigneeOptionSerializer
)
from .permissions import (
    IsProjectOwner,
    IsProjectMember,
    IsAssigneeOrProjectOwner,
    IsCommentAuthorOrReadOnly
)

# ==========================================
# 1. Projects API Views (Stage 1: Project Creation)
# ==========================================

class ListCreateProjectAPIView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Multi-tenancy: Return ONLY projects where user is Owner OR an invited Member
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(memberships__member=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        # ProjectSerializer.create sets owner=request.user and handles invite_emails
        serializer.save()


class RetrieveUpdateDestroyProjectAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    lookup_field = 'code'

    def get_queryset(self):
        # Scoped strictly to projects the user owns or belongs to
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(memberships__member=user)
        ).distinct()

    def get_permissions(self):
        # Only the Project Owner can edit or delete the project
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsProjectOwner()]
        # Members can view (GET)
        return [permissions.IsAuthenticated(), IsProjectMember()]


# ==========================================
# 2. Stage 2: Scoped Assignees & Tasks API Views
# ==========================================

class ProjectAssigneesAPIView(APIView):
    """
    Endpoint: GET /api/projects/<str:code>/assignees/
    Returns the exact list of eligible email assignees for this project:
    - 1. Project Owner Email
    - 2. Registered Project Members' Emails
    - 3. Pending Email Invitees
    No external users in the database are ever exposed.
    """
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get(self, request, code):
        project = get_object_or_404(Project, code=code)
        self.check_object_permissions(request, project)

        assignee_options = []

        # 1. Project Owner
        owner_email = project.owner.email or f"{project.owner.username}@teamflow.app"
        assignee_options.append({
            'email': owner_email,
            'name': f"{project.owner.username} (Owner)",
            'status': 'OWNER'
        })

        # 2. Registered Project Members
        for m in project.memberships.select_related('member').all():
            if m.member_id != project.owner_id:
                member_email = m.member.email or f"{m.member.username}@teamflow.app"
                assignee_options.append({
                    'email': member_email,
                    'name': m.member.username,
                    'status': 'MEMBER'
                })

        # 3. Pending Email Invitations
        for inv in project.invitations.filter(status='PENDING'):
            assignee_options.append({
                'email': inv.email,
                'name': inv.email.split('@')[0],
                'status': 'PENDING'
            })

        serializer = AssigneeOptionSerializer(assignee_options, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListCreateTaskAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_project(self):
        project_code = self.kwargs['code']
        project = get_object_or_404(Project, code=project_code)
        user = self.request.user
        if project.owner != user and not project.memberships.filter(member=user).exists():
            self.permission_denied(self.request, message="You are not a member of this project.")
        return project

    def get_queryset(self):
        project = self.get_project()
        return Task.objects.filter(project=project).order_by('created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['project'] = self.get_project()
        return context

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project, created_by=self.request.user)


class RetrieveUpdateDestroyTaskAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsAssigneeOrProjectOwner]
    lookup_field = 'code'
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        user = self.request.user
        project_code = self.kwargs['code']
        # Task must belong to that project AND the user must be a member or owner
        return Task.objects.filter(
            Q(project__code=project_code) &
            (Q(project__owner=user) | Q(project__memberships__member=user))
        ).distinct()


class MyTasksAPIView(generics.ListAPIView):
    """
    Returns all tasks assigned to the authenticated user across all projects.
    Matches either user foreign key OR user's email address.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(assignee=user) | Q(assignee_email__iexact=user.email)
        ).distinct().order_by('-created_at')


# ==========================================
# 3. Comments API Views
# ==========================================

class ListCreateCommentAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_task(self):
        task_code = self.kwargs['task_code']
        project_code = self.kwargs.get('code')
        if project_code:
            task = get_object_or_404(Task, code=task_code, project__code=project_code)
        else:
            task = get_object_or_404(Task, code=task_code)

        user = self.request.user
        project = task.project
        if project.owner != user and not project.memberships.filter(member=user).exists():
            self.permission_denied(self.request, message="You must be a member of this project to comment.")
        return task

    def get_queryset(self):
        task = self.get_task()
        return Comment.objects.filter(task=task).order_by('created_at')

    def perform_create(self, serializer):
        task = self.get_task()
        serializer.save(task=task, author=self.request.user)


class RetrieveUpdateDestroyCommentAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCommentAuthorOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        task_code = self.kwargs.get('task_code')
        # Only return comments for tasks/projects the user belongs to
        qs = Comment.objects.filter(
            Q(task__project__owner=user) | Q(task__project__memberships__member=user)
        ).distinct()
        if task_code:
            qs = qs.filter(task__code=task_code)
        return qs


# ==========================================
# 4. Project Invitation API View
# ==========================================

class InviteMemberAPIView(APIView):
    """
    Endpoint: POST /api/projects/<str:code>/invite/
    Allows Project Owner to invite a member by email.
    """
    permission_classes = [permissions.IsAuthenticated, IsProjectOwner]

    def post(self, request, code):
        project = get_object_or_404(Project, code=code)
        self.check_object_permissions(request, project)

        email = request.data.get('email')
        if not email:
            return Response({"email": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        result = project.invite_by_email(email, invited_by=request.user)
        if not result:
            return Response({"error": "Invalid email address."}, status=status.HTTP_400_BAD_REQUEST)

        if result['type'] == 'membership':
            return Response({
                "message": f"User is already registered and was added as a member.",
                "type": "membership",
                "email": result['object'].member.email
            }, status=status.HTTP_201_CREATED if result['created'] else status.HTTP_200_OK)
        else:
            serializer = ProjectInvitationSerializer(result['object'])
            return Response({
                "message": f"Invitation sent to {email}.",
                "type": "invitation",
                "invitation": serializer.data
            }, status=status.HTTP_201_CREATED if result['created'] else status.HTTP_200_OK)
