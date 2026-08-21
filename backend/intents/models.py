from django.db import models


class Intent(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("planned", "Planned"),
        ("approved", "Approved"),
        ("executing", "Executing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    raw_text = models.TextField()

    intent_type = models.CharField(
        max_length=100,
        blank=True
    )

    summary = models.TextField(
        blank=True
    )

    entities = models.JSONField(
        default=dict,
        blank=True
    )

    actions = models.JSONField(
        default=list,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.raw_text