from django.contrib import admin
from django.db.models import Q
from .models import Project, ProjectMembership, ProjectInvitation, Task, Comment

class ProjectInvitationInline(admin.TabularInline):
    model = ProjectInvitation
    extra = 1
    fields = ['email', 'status', 'token', 'created_at']
    readonly_fields = ['token', 'created_at']

class ProjectMembershipInline(admin.TabularInline):
    model = ProjectMembership
    extra = 0
    fields = ['member', 'joined_at']
    readonly_fields = ['member', 'joined_at']
    can_delete = True

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'code', 'owner', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'code', 'owner__username', 'owner__email']
    readonly_fields = ['code', 'owner', 'created_at', 'updated_at']
    ordering = ['-created_at']
    inlines = [ProjectInvitationInline, ProjectMembershipInline]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Staff users only see projects they own or are members of
        return qs.filter(Q(owner=request.user) | Q(memberships__member=request.user)).distinct()

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser or obj is None:
            return True
        # Only the project owner can edit the project
        return obj.owner == request.user

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser or obj is None:
            return True
        # Only the project owner can delete the project
        return obj.owner == request.user

    def save_model(self, request, obj, form, change):
        if not obj.owner_id:
            obj.owner = request.user
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, ProjectInvitation) and not instance.invited_by_id:
                instance.invited_by = request.user
            instance.save()
        formset.save_m2m()

@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = ['project', 'member_email', 'joined_at']
    list_filter = ['joined_at']
    search_fields = ['project__title', 'member__email', 'member__username']
    readonly_fields = ['project', 'member', 'joined_at']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(Q(project__owner=request.user) | Q(member=request.user)).distinct()

    def member_email(self, obj):
        return obj.member.email or obj.member.username
    member_email.short_description = 'Member Email'

@admin.register(ProjectInvitation)
class ProjectInvitationAdmin(admin.ModelAdmin):
    list_display = ['email', 'project', 'status', 'invited_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['email', 'project__title', 'invited_by__email', 'invited_by__username']
    readonly_fields = ['token', 'created_at']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(project__owner=request.user).distinct()

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'project', 'assignee_email', 'status', 'due_date', 'created_at']
    list_filter = ['status', 'project', 'due_date']
    search_fields = ['title', 'code', 'project__title', 'assignee_email']
    readonly_fields = ['code', 'created_by']
    ordering = ['-created_at']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Only show tasks for projects the user owns or belongs to
        return qs.filter(
            Q(project__owner=request.user) | 
            Q(project__memberships__member=request.user) |
            Q(assignee=request.user)
        ).distinct()

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser or obj is None:
            return True
        # Only the project owner or assigned user can edit the task
        return obj.project.owner == request.user or obj.assignee == request.user

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser or obj is None:
            return True
        # Only the project owner can delete tasks
        return obj.project.owner == request.user

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author_email', 'task', 'comment_snippet', 'created_at']
    search_fields = ['comment', 'author__email', 'author__username', 'task__title']
    ordering = ['-created_at']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(
            Q(task__project__owner=request.user) |
            Q(task__project__memberships__member=request.user) |
            Q(author=request.user)
        ).distinct()

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser or obj is None:
            return True
        # Only comment author can edit
        return obj.author == request.user

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser or obj is None:
            return True
        # Author or project owner can delete comments
        return obj.author == request.user or obj.task.project.owner == request.user

    def author_email(self, obj):
        return obj.author.email or obj.author.username
    author_email.short_description = 'Author Email'

    def comment_snippet(self, obj):
        return obj.comment[:40] + ('...' if len(obj.comment) > 40 else '')
    comment_snippet.short_description = 'Comment'
