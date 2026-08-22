from rest_framework import serializers
from .models import Intent


class IntentCreateSerializer(serializers.Serializer):
    text = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        max_length=10000,
    )


class IntentSerializer(serializers.ModelSerializer):
    approval = serializers.SerializerMethodField()

    def get_approval(self, intent):
        approval = getattr(intent, "approval", None)
        if not approval:
            return None
        return {
            "status": approval.status,
            "approved_by": approval.approved_by.username,
            "intent_status_at_decision": approval.intent_status_at_decision,
            "created_at": approval.created_at,
            "approved_at": approval.approved_at,
            "rejected_at": approval.rejected_at,
        }

    class Meta:
        model = Intent
        fields = [
            "id",
            "raw_text",
            "intent_type",
            "summary",
            "entities",
            "actions",
            "status",
            "created_at",
            "approval",
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
        ]