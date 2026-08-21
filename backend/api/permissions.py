from rest_framework import permissions

class IsProjectOwner(permissions.BasePermission):
    """
    Allows access ONLY to the Project Owner.
    """
    def has_object_permission(self, request, view, obj):
        project = obj if hasattr(obj, 'owner') else getattr(obj, 'project', None)
        if project is None and hasattr(obj, 'task'):
            project = obj.task.project
            
        return project and project.owner == request.user


class IsProjectMember(permissions.BasePermission):
    """
    Allows view/collaboration access to Owner OR invited Project Members.
    """
    def has_object_permission(self, request, view, obj):
        project = obj if hasattr(obj, 'owner') else getattr(obj, 'project', None)
        if project is None and hasattr(obj, 'task'):
            project = obj.task.project
            
        if not project:
            return False

        if project.owner == request.user:
            return True

        return project.memberships.filter(member=request.user).exists()


class IsAssigneeForStatus_OwnerForEdits(permissions.BasePermission):
    """
    Strict Task Permissions:
    - View (GET): Project Owner and all Project Members.
    - Status changes (TODO -> IN_PROGRESS -> DONE): ONLY the assigned user.
    - Editing / Deleting task metadata: ONLY the Project Owner.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        project = obj.project
        is_owner = (project.owner == user)
        is_assignee = (
            (obj.assignee == user) or
            (obj.assignee_email and user.email and obj.assignee_email.strip().lower() == user.email.strip().lower())
        )
        is_member = project.memberships.filter(member=user).exists()

        # 1. Read (GET): Allowed for any project member, owner, or assignee
        if request.method in permissions.SAFE_METHODS:
            return is_owner or is_member or is_assignee

        # 2. Delete: ONLY the project owner can delete tasks
        if request.method == 'DELETE':
            return is_owner

        # 3. Status updates: If updating status, ONLY the assigned member is allowed
        if 'status' in request.data:
            if not is_assignee:
                return False

        # 4. Other metadata edits (title, due date): Owner or Assignee
        return is_owner or is_assignee


class IsCommentAuthorOrReadOnly(permissions.BasePermission):
    """
    Delete/Edit comment allowed ONLY for the author of the comment.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user
