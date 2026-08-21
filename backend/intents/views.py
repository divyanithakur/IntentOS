from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Intent
from .services.intent_engine import understand_intent


class IntentCreateView(APIView):

    def post(self, request):

        raw_text = request.data.get("text")

        if not raw_text:
            return Response(
                {
                    "error": "text is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = understand_intent(raw_text)

            intent = Intent.objects.create(
                raw_text=raw_text,
                intent_type=result["intent_type"],
                summary=result["summary"],
                entities=result["entities"],
                actions=result["actions"],
            )

            return Response(
                {
                    "id": intent.id,
                    "raw_text": intent.raw_text,
                    "intent_type": intent.intent_type,
                    "summary": intent.summary,
                    "entities": intent.entities,
                    "actions": intent.actions,
                    "created_at": intent.created_at,
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )