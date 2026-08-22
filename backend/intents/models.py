from django.db import models


class Intent(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("planned", "Planned"),
        ("approved", "Approved"),
        ("executing", "Executing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    owner = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="intents",
        null=True,
        blank=True,
    )

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


class Approval(models.Model):
    STATUS_CHOICES = [
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    intent = models.OneToOneField(Intent, on_delete=models.CASCADE, related_name="approval")
    approved_by = models.ForeignKey("auth.User", on_delete=models.PROTECT, related_name="intent_approvals")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    intent_status_at_decision = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.intent_id}: {self.status}"


class Execution(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    intent = models.ForeignKey(Intent, on_delete=models.CASCADE, related_name="executions")
    action = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    requested_by = models.ForeignKey("auth.User", on_delete=models.PROTECT, related_name="intent_executions")
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    result = models.JSONField(default=dict, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.intent_id}: {self.action} ({self.status})"