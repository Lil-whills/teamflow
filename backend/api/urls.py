from django.urls import path
from . import views

urlpatterns = [
    # Projects (Stage 1)
    path('projects/', views.ListCreateProjectAPIView.as_view(), name="list_create_projects"),
    path('projects/<str:code>/', views.RetrieveUpdateDestroyProjectAPIView.as_view(), name="retrieve_update_destroy_project"),
    path('projects/<str:code>/invite/', views.InviteMemberAPIView.as_view(), name="invite_member"),
    path('projects/<str:code>/assignees/', views.ProjectAssigneesAPIView.as_view(), name="project_assignees"),
    
    # Tasks (Stage 2)
    path('projects/<str:code>/tasks/', views.ListCreateTaskAPIView.as_view(), name="list_create_tasks"),
    path('projects/<str:code>/tasks/<str:pk>/', views.RetrieveUpdateDestroyTaskAPIView.as_view(), name="retrieve_update_destroy_task"),
    path('my-tasks/', views.MyTasksAPIView.as_view(), name="my_tasks"),

    # Comments (Supports both nested under project/task AND direct task route)
    path('projects/<str:code>/tasks/<str:task_code>/comments/', views.ListCreateCommentAPIView.as_view(), name="nested_list_create_comments"),
    path('tasks/<str:task_code>/comments/', views.ListCreateCommentAPIView.as_view(), name="list_create_comments"),
    path('comments/<int:pk>/', views.RetrieveUpdateDestroyCommentAPIView.as_view(), name="retrieve_update_destroy_comment"),   
]
