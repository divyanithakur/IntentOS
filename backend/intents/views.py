import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Intent
from .serializers import IntentCreateSerializer, IntentSerializer
from .services.intent_engine import understand_intent
from .services.planner import create_plan

logger = logging.getLogger(__name__)


def intent_response(intent):
    data = IntentSerializer(intent).data
    data["plan"] = create_plan(
        {
            "intent_type": intent.intent_type,
            "entities": intent.entities,
            "actions": intent.actions,
        }
    )
    return data


class IntentCreateView(APIView):
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
                raw_text=raw_text,
                intent_type=intent_data.get("intent_type", ""),
                summary=intent_data.get("summary", ""),
                entities=intent_data.get("entities", {}),
                actions=intent_data.get("actions", []),
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

        response_data = IntentSerializer(intent).data
        response_data["plan"] = plan
        return Response(response_data, status=status.HTTP_201_CREATED)


class IntentListView(APIView):
    def get(self, request):
        intents = Intent.objects.order_by("-created_at")
        return Response(IntentSerializer(intents, many=True).data)


class IntentDetailView(APIView):
    def get(self, request, pk):
        try:
            intent = Intent.objects.get(pk=pk)
        except Intent.DoesNotExist:
            return Response({"error": "Intent not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(intent_response(intent))
