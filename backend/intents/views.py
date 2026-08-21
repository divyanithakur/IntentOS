from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Intent
from .serializers import IntentSerializer
from .services.intent_engine import understand_intent
from .services.planner import create_plan


class IntentCreateView(APIView):

    def post(self, request):

        # Get user's text
        raw_text = request.data.get("text")

        if not raw_text:
            return Response(
                {
                    "error": "text is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 1: Understand the user's intent
        intent_data = understand_intent(raw_text)

        # Step 2: Create an execution plan
        plan = create_plan(intent_data)

        # Step 3: Save intent in database
        intent = Intent.objects.create(
            raw_text=raw_text,
            intent_type=intent_data.get("intent_type", ""),
            summary=intent_data.get("summary", ""),
            entities=intent_data.get("entities", {}),
            actions=intent_data.get("actions", [])
        )

        # Step 4: Prepare API response
        return Response(
            {
                "id": intent.id,
                "raw_text": intent.raw_text,
                "intent_type": intent.intent_type,
                "summary": intent.summary,
                "entities": intent.entities,
                "actions": intent.actions,
                "plan": plan,
                "status": intent.status,
                "created_at": intent.created_at
            },
            status=status.HTTP_201_CREATED
        )