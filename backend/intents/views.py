import logging

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Approval, Intent
from .serializers import IntentCreateSerializer, IntentSerializer
from .services.intent_engine import understand_intent
from .services.planner import create_plan

logger = logging.getLogger(__name__)


def intent_response(intent):
    data = IntentSerializer(intent).data
    plan = create_plan(
        {
            "intent_type": intent.intent_type,
            "entities": intent.entities,
            "actions": intent.actions,
        }
    )
    plan["status"] = intent.status
    data["plan"] = plan
    return data


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = request.data.get("password", "")
        if not username or not password:
            return Response(
                {"error": "username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(password) < 8:
            return Response(
                {"error": "password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(username=username).exists():
            return Response({"error": "username is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        token = Token.objects.create(user=user)
        return Response(
            {"token": token.key, "user": {"id": user.id, "username": user.username}},
            status=status.HTTP_201_CREATED,
        )


class LoginView(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": {"id": user.id, "username": user.username}})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class IntentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = IntentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            message = "; ".join(
                f"{field}: {', '.join(str(item) for item in messages)}"
                for field, messages in serializer.errors.items()
            )
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        raw_text = serializer.validated_data["text"]
        try:
            intent_data = understand_intent(raw_text)
            plan = create_plan(intent_data)
            intent = Intent.objects.create(
                owner=request.user,
                raw_text=raw_text,
                intent_type=intent_data.get("intent_type", ""),
                summary=intent_data.get("summary", ""),
                entities=intent_data.get("entities", {}),
                actions=intent_data.get("actions", []),
                status="planned",
            )
        except ValueError:
            logger.warning("Intent processing configuration is unavailable")
            return Response(
                {"error": "Intent processing is temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            logger.exception("Unexpected intent processing failure")
            return Response(
                {"error": "IntentOS could not process this request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        plan["status"] = intent.status
        response_data = IntentSerializer(intent).data
        response_data["plan"] = plan
        return Response(response_data, status=status.HTTP_201_CREATED)


class IntentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        intents = Intent.objects.filter(owner=request.user).order_by("-created_at")
        return Response(IntentSerializer(intents, many=True).data)


class IntentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        intent = get_object_or_404(Intent, pk=pk, owner=request.user)
        return Response(intent_response(intent))


class ApprovalActionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk, action):
        intent = get_object_or_404(Intent, pk=pk, owner=request.user)
        if intent.status != "planned":
            return Response(
                {"error": f"This intent cannot be {action} from its current state."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        decision = "approved" if action == "approve" else "rejected"
        now = timezone.now()
        Approval.objects.update_or_create(
            intent=intent,
            defaults={
                "approved_by": request.user,
                "status": decision,
                "intent_status_at_decision": intent.status,
                "approved_at": now if decision == "approved" else None,
                "rejected_at": now if decision == "rejected" else None,
            },
        )
        intent.status = "approved" if decision == "approved" else "cancelled"
        intent.save(update_fields=["status"])
        return Response(intent_response(intent), status=status.HTTP_200_OK)
