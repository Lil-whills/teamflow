from rest_framework import permissions

class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Determine the project instance from obj (whether obj is Project, Task, or Comment)
        project = obj if hasattr(obj, 'owner') else getattr(obj, 'project', None)
        if project is None and hasattr(obj, 'task'):
            project = obj.task.project
            
        return project and project.owner == request.user


class IsProjectMember(permissions.BasePermission):
    """
    Permission check: User must be an owner OR an invited member of the project to view/collaborate.
    """
    def has_object_permission(self, request, view, obj):
        project = obj if hasattr(obj, 'owner') else getattr(obj, 'project', None)
        if project is None and hasattr(obj, 'task'):
            project = obj.task.project
            
        if not project:
            return False

        # Owner is always allowed
        if project.owner == request.user:
            return True

        # Check if user is in project memberships
        return project.memberships.filter(member=request.user).exists()


class IsAssigneeOrProjectOwner(permissions.BasePermission):
    """
    Permission check for Tasks:
    - Safe methods (GET) allowed for any project member.
    - Status updates / edits allowed for the assigned user OR the project owner.
    """
    def has_object_permission(self, request, view, obj):
        project = obj.project
        is_owner = (project.owner == request.user)
        is_assignee = (obj.assignee == request.user)

        # Read permissions allowed for all project members
        if request.method in permissions.SAFE_METHODS:
            return is_owner or is_assignee or project.memberships.filter(member=request.user).exists()

        # Write permissions (PATCH/PUT/DELETE) restricted to assignee or owner
        return is_owner or is_assignee


class IsCommentAuthorOrReadOnly(permissions.BasePermission):
    """
    Permission check for Comments:
    - Safe methods (GET) allowed for project members.
    - Delete/Edit allowed ONLY for the author of the comment.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user
