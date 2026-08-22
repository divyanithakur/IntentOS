from django.urls import path
from .views import (
    ApprovalActionView,
    IntentCreateView,
    IntentDetailView,
    IntentListView,
    LoginView,
    LogoutView,
    RegisterView,
    CurrentUserView,
    IntentExecutionView,
)


urlpatterns = [
    path("", IntentListView.as_view(), name="intent-list"),
    path("create/", IntentCreateView.as_view(), name="create-intent"),
    path("<int:pk>/", IntentDetailView.as_view(), name="intent-detail"),
    path("<int:pk>/approve/", ApprovalActionView.as_view(), {"action": "approve"}, name="intent-approve"),
    path("<int:pk>/reject/", ApprovalActionView.as_view(), {"action": "reject"}, name="intent-reject"),
    path("<int:pk>/execute/", IntentExecutionView.as_view(), name="intent-execute"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", CurrentUserView.as_view(), name="current-user"),
]