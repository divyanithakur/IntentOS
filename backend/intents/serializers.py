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
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
        ]