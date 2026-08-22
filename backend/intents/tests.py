import os
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Approval, Intent


class IntentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="divyani", password="strong-pass-123")
        self.other_user = User.objects.create_user(username="other", password="strong-pass-123")
        self.create_url = "/api/intents/create/"

    def authenticate(self, user=None):
        self.client.force_authenticate(user=user or self.user)

    def create_intent(self, text="Schedule a meeting with Rahul tomorrow"):
        self.authenticate()
        with patch.dict(os.environ, {"DEMO_MODE": "true"}):
            response = self.client.post(self.create_url, {"text": text}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return Intent.objects.get(pk=response.data["id"])

    def test_health_check_is_public_json(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_unauthenticated_user_cannot_create_or_approve(self):
        intent = self.create_intent()
        self.client.force_authenticate(user=None)

        create_response = self.client.post(self.create_url, {"text": "Another request"}, format="json")
        approve_response = self.client.post(f"/api/intents/{intent.id}/approve/")

        self.assertEqual(create_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(approve_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_intent_returns_plan_and_saves_owned_planned_record(self):
        intent = self.create_intent()
        response = self.client.get(f"/api/intents/{intent.id}/")

        self.assertEqual(response.data["intent_type"], "schedule_meeting")
        self.assertEqual(response.data["entities"]["person"], "Rahul")
        self.assertTrue(response.data["plan"]["requires_approval"])
        self.assertEqual(intent.owner, self.user)
        self.assertEqual(intent.status, "planned")

    def test_create_intent_rejects_empty_text(self):
        self.authenticate()
        response = self.client.post(self.create_url, {"text": "   "}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_intent_rejects_invalid_json(self):
        self.authenticate()
        response = self.client.post(self.create_url, data='{"text":', content_type="application/json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_list_intents_returns_only_owner_records_newest_first(self):
        first = self.create_intent("Plan a trip")
        second = self.create_intent("Schedule a meeting")
        Intent.objects.filter(pk=first.pk).update(owner=self.other_user)

        response = self.client.get("/api/intents/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [second.id])

    def test_detail_intent_rejects_other_owner(self):
        intent = self.create_intent()
        self.authenticate(self.other_user)

        response = self.client.get(f"/api/intents/{intent.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_authenticated_user_can_approve_own_planned_intent(self):
        intent = self.create_intent()

        response = self.client.post(f"/api/intents/{intent.id}/approve/")

        intent.refresh_from_db()
        approval = Approval.objects.get(intent=intent)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(intent.status, "approved")
        self.assertEqual(approval.status, "approved")
        self.assertEqual(approval.approved_by, self.user)
        self.assertIsNotNone(approval.approved_at)
        self.assertEqual(response.data["approval"]["approved_by"], self.user.username)

    def test_user_cannot_approve_another_users_intent(self):
        intent = self.create_intent()
        self.authenticate(self.other_user)

        response = self.client.post(f"/api/intents/{intent.id}/approve/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Approval.objects.filter(intent=intent).exists())

    def test_completed_failed_and_cancelled_intents_cannot_be_approved(self):
        for state in ["completed", "failed", "cancelled"]:
            intent = self.create_intent(f"Request in {state}")
            Intent.objects.filter(pk=intent.pk).update(status=state)
            response = self.client.post(f"/api/intents/{intent.id}/approve/")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_can_reject_planned_intent_and_it_cannot_be_approved(self):
        intent = self.create_intent()

        reject_response = self.client.post(f"/api/intents/{intent.id}/reject/")
        approve_response = self.client.post(f"/api/intents/{intent.id}/approve/")

        intent.refresh_from_db()
        approval = Approval.objects.get(intent=intent)
        self.assertEqual(reject_response.status_code, status.HTTP_200_OK)
        self.assertEqual(approve_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(intent.status, "cancelled")
        self.assertEqual(approval.status, "rejected")
        self.assertEqual(approval.approved_by, self.user)
        self.assertIsNotNone(approval.rejected_at)

    def test_approval_does_not_execute_external_actions(self):
        intent = self.create_intent()
        original_actions = intent.actions

        response = self.client.post(f"/api/intents/{intent.id}/approve/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(original_actions, Intent.objects.get(pk=intent.pk).actions)
        self.assertEqual(response.data["status"], "approved")
