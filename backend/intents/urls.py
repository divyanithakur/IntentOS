from django.urls import path
from .views import IntentCreateView


urlpatterns = [
    path("create/", IntentCreateView.as_view(), name="create-intent"),
]