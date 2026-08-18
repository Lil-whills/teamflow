from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
import re
import uuid

class ProjectStatusChoices(models.TextChoices):
    TODO = "TODO", "Todo"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    DONE = "DONE", "Done"

class TaskStatusChoices(models.TextChoices):
    TODO = "TODO", "Todo"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    DONE = "DONE", "Done"

class InvitationStatusChoices(models.TextChoices):
    PENDING = "PENDING", "Pending"
    ACCEPTED = "ACCEPTED", "Accepted"
    EXPIRED = "EXPIRED", "Expired"



class Project(models.Model):
    title = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True, blank=True, null=True, editable=False)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_projects", editable=False)
    status = models.CharField(max_length=20, choices=ProjectStatusChoices.choices, default=ProjectStatusChoices.TODO)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate project code from title (e.g. "Marketing site launch" -> "MSL-01")  
        if not self.code and self.title:
            words = self.title.strip().split()
            if len(words) >= 2:
                prefix = "".join([w[0].upper() for w in words if w[0].isalnum()])[:4]
            else:
                prefix = re.sub(r'[^A-Za-z0-9]', '', self.title)[:3].upper()
            if not prefix:
                prefix = "PRJ"

            count = Project.objects.filter(code__startswith=prefix).count() + 1
            num_suffix = f"0{count}" if count < 10 else f"{count}"
            self.code = f"{prefix}-{num_suffix}"
            
        super().save(*args, **kwargs)

    def get_all_eligible_emails(self):
        """
        Returns a set of all eligible emails for this project:
        - Owner's email
        - Registered members' emails
        - All invited emails
        """
        emails = set()
        if self.owner and self.owner.email:
            emails.add(self.owner.email.strip().lower())
        
        # Add members' emails
        for m in self.memberships.select_related('member').all():
            if m.member.email:
                emails.add(m.member.email.strip().lower())
                
        # Add invited emails
        for inv in self.invitations.all():
            if inv.email:
                emails.add(inv.email.strip().lower())

        return emails

    def invite_by_email(self, email_address, invited_by=None):
        """
        Unified Email Invitation:
        - All invited people are strictly MEMBERS (Single Owner Rule).
        - If user already exists -> adds to ProjectMembership.
        - If user not registered -> creates ProjectInvitation (PENDING).
        """
        email_clean = email_address.strip().lower()
        if not email_clean:
            return None

        # Check if already the owner
        if self.owner.email and self.owner.email.lower() == email_clean:
            return {"type": "owner", "email": email_clean}

        # Check if user is registered in the platform
        existing_user = User.objects.filter(email__iexact=email_clean).first()
        if existing_user:
            membership, created = ProjectMembership.objects.get_or_create(
                project=self,
                member=existing_user
            )
            return {"type": "membership", "object": membership, "created": created}
        else:
            invitation, created = ProjectInvitation.objects.get_or_create(
                project=self,
                email=email_clean,
                defaults={
                    'status': InvitationStatusChoices.PENDING,
                    'invited_by': invited_by or self.owner
                }
            )
            return {"type": "invitation", "object": invitation, "created": created}

    def __str__(self):
        return f"{self.title} ({self.code})"


class ProjectMembership(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="memberships")
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name="project_memberships")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'member')

    def __str__(self):
        return f"{self.member.email or self.member.username} in {self.project.title}"


class ProjectInvitation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="invitations")
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=InvitationStatusChoices.choices, default=InvitationStatusChoices.PENDING)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="sent_invitations")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'email')

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        if not self.invited_by and self.project_id:
            self.invited_by = self.project.owner

        # If user already exists in database, mark invitation as ACCEPTED immediately
        existing_user = User.objects.filter(email__iexact=self.email).first()
        if existing_user:
            self.status = InvitationStatusChoices.ACCEPTED

        super().save(*args, **kwargs)

        # Automatically add existing user to ProjectMembership
        if existing_user and self.project_id:
            ProjectMembership.objects.get_or_create(
                project=self.project,
                member=existing_user
            )

            # Auto-link any tasks already assigned to this email
            Task.objects.filter(project=self.project, assignee_email__iexact=self.email).update(
                assignee=existing_user
            )

    def __str__(self):
        return f"Invite for {self.email} to {self.project.title} [{self.status}]"


class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    code = models.CharField(max_length=20, blank=True, null=True, editable=False)
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=TaskStatusChoices.choices, default=TaskStatusChoices.TODO)
    due_date = models.DateField(null=True, blank=True)
    assignee_email = models.EmailField(null=True, blank=True, help_text="Email of the assigned member or invitee")
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_tasks", editable=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_tasks", editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.project_id and self.assignee_email:
            clean_email = self.assignee_email.strip().lower()
            eligible_emails = self.project.get_all_eligible_emails()

            if clean_email not in eligible_emails:
                raise ValidationError({
                    "assignee_email": f"'{clean_email}' is not a member or invitee of project '{self.project.title}'. Please invite them first."
                })

    def save(self, *args, **kwargs):
        # 1. Auto-generate task code (e.g. TASK-01)
        if not self.code and self.project_id:
            count = Task.objects.filter(project_id=self.project_id).count() + 1
            num_suffix = f"0{count}" if count < 10 else f"{count}"
            self.code = f"TASK-{num_suffix}"
            
        # 2. Auto-link registered User if assignee_email matches an existing User
        if self.assignee_email:
            self.assignee_email = self.assignee_email.strip().lower()
            matched_user = User.objects.filter(email__iexact=self.assignee_email).first()
            if matched_user:
                self.assignee = matched_user
            else:
                self.assignee = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code}: {self.title} [{self.status}] -> {self.assignee_email or 'Unassigned'}"


class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_comments")
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author.email or self.author.username} on {self.task.code}: {self.comment[:30]}"


# ==========================================
# 3. Signals: Auto-Claim Invitations on Sign-Up
# ==========================================

@receiver(post_save, sender=User)
def claim_pending_invitations_and_tasks(sender, instance, created, **kwargs):
    """
    Whenever a new User signs up, automatically:
    1. Converts pending ProjectInvitations matching their email into active ProjectMemberships.
    2. Re-links any Tasks assigned to their email directly to their User account.
    """
    if instance.email:
        user_email = instance.email.strip().lower()
        pending_invitations = ProjectInvitation.objects.filter(email__iexact=user_email, status=InvitationStatusChoices.PENDING)

        for invite in pending_invitations:
            # 1. Add user to project membership
            ProjectMembership.objects.get_or_create(
                project=invite.project,
                member=instance
            )

            # 2. Re-link any tasks assigned to this email to the new User account
            Task.objects.filter(project=invite.project, assignee_email__iexact=user_email).update(
                assignee=instance
            )

            # 3. Mark invitation as ACCEPTED
            invite.status = InvitationStatusChoices.ACCEPTED
            invite.save()