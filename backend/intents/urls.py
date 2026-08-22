from django.urls import path
from .views import IntentCreateView, IntentDetailView, IntentListView


urlpatterns = [
    path("", IntentListView.as_view(), name="intent-list"),
    path("create/", IntentCreateView.as_view(), name="create-intent"),
    path("<int:pk>/", IntentDetailView.as_view(), name="intent-detail"),
]