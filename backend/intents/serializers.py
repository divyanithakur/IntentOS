from rest_framework import serializers
from .models import Intent


class IntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Intent
        fields = [
            "id",
            "raw_text",
            "intent_type",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
        ]