import logging

from django.conf import settings
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone

from ..models import Execution

logger = logging.getLogger(__name__)


class ExecutionError(Exception):
    """A safe, user-facing execution failure."""


class BaseExecutor:
    def execute(self, intent):
        raise NotImplementedError


class EmailExecutor(BaseExecutor):
    def execute(self, intent):
        entities = intent.entities or {}
        recipient = entities.get("email") or entities.get("recipient_email")
        subject = entities.get("subject")
        message = entities.get("message")

        if not recipient or not subject or not message:
            raise ExecutionError("More information is required before this email can be sent.")

        try:
            validate_email(recipient)
        except ValidationError as exc:
            raise ExecutionError("A valid recipient email address is required.") from exc

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "")
        if not from_email:
            raise ExecutionError("Email delivery is not configured yet.")

        try:
            send_mail(subject, message, from_email, [recipient], fail_silently=False)
        except Exception as exc:
            logger.exception("Email delivery failed for execution %s", intent.id)
            raise ExecutionError("Email could not be sent. Please try again.") from exc

        return {"message": "Email sent successfully.", "recipient": recipient}


EXECUTORS = {
    "send_email": EmailExecutor(),
}


def execute_intent(intent, user):
    if intent.status != "approved":
        raise ExecutionError("Only approved intents can be executed.")

    if intent.executions.filter(status="running").exists():
        raise ExecutionError("This intent is already being executed.")

    if intent.executions.filter(status="completed").exists():
        raise ExecutionError("This intent has already been executed.")

    executor = EXECUTORS.get(intent.intent_type)
    if not executor:
        raise ExecutionError("No executor is configured for this intent type yet.")

    execution = Execution.objects.create(
        intent=intent,
        action=intent.intent_type,
        requested_by=user,
        status="running",
        started_at=timezone.now(),
    )
    intent.status = "executing"
    intent.save(update_fields=["status"])

    try:
        result = executor.execute(intent)
    except ExecutionError as exc:
        execution.status = "failed"
        execution.error = str(exc)
        execution.completed_at = timezone.now()
        execution.save(update_fields=["status", "error", "completed_at"])
        intent.status = "failed"
        intent.save(update_fields=["status"])
        raise
    except Exception as exc:
        logger.exception("Unexpected execution failure for intent %s", intent.id)
        execution.status = "failed"
        execution.error = "Execution failed unexpectedly."
        execution.completed_at = timezone.now()
        execution.save(update_fields=["status", "error", "completed_at"])
        intent.status = "failed"
        intent.save(update_fields=["status"])
        raise ExecutionError("Execution failed unexpectedly.") from exc

    execution.status = "completed"
    execution.result = result
    execution.completed_at = timezone.now()
    execution.save(update_fields=["status", "result", "completed_at"])
    intent.status = "completed"
    intent.save(update_fields=["status"])
    return execution
