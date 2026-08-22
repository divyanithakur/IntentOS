import os
from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APIClient

from django.test import TestCase

from .models import Intent


class IntentApiTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.create_url = "/api/intents/create/"

	@patch.dict(os.environ, {"DEMO_MODE": "true"})
	def test_create_intent_returns_plan_and_saves_record(self):
		response = self.client.post(
			self.create_url,
			{"text": "Schedule a meeting with Rahul tomorrow"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data["intent_type"], "schedule_meeting")
		self.assertEqual(response.data["entities"]["person"], "Rahul")
		self.assertTrue(response.data["plan"]["requires_approval"])
		self.assertEqual(Intent.objects.count(), 1)

	def test_create_intent_rejects_empty_text(self):
		response = self.client.post(self.create_url, {"text": "   "}, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("error", response.data)
		self.assertEqual(Intent.objects.count(), 0)

	def test_create_intent_rejects_invalid_json(self):
		response = self.client.post(
			self.create_url,
			data='{"text":',
			content_type="application/json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("error", response.data)

	@patch.dict(os.environ, {"DEMO_MODE": "true"})
	def test_list_intents_returns_newest_first(self):
		for text in ["Plan a trip", "Schedule a meeting"]:
			self.client.post(self.create_url, {"text": text}, format="json")

		response = self.client.get("/api/intents/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 2)
		self.assertEqual(response.data[0]["raw_text"], "Schedule a meeting")

	@patch.dict(os.environ, {"DEMO_MODE": "true"})
	def test_detail_intent_returns_full_record(self):
		create_response = self.client.post(
			self.create_url,
			{"text": "Send an email to Rahul"},
			format="json",
		)

		response = self.client.get(f"/api/intents/{create_response.data['id']}/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["raw_text"], "Send an email to Rahul")
		self.assertIn("actions", response.data)
		self.assertIn("plan", response.data)

	@patch("intents.views.understand_intent", side_effect=ValueError)
	def test_processing_configuration_error_is_safe(self, _understand_intent):
		response = self.client.post(
			self.create_url,
			{"text": "Process this request"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
		self.assertEqual(response.data["error"], "Intent processing is temporarily unavailable.")
