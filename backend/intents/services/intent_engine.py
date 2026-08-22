import json
import os
import re

from openai import OpenAI


def extract_entities(raw_text, intent_type):
    """
    Extract basic entities from the user's request.
    This is a local/demo entity extractor.
    """

    text = raw_text.strip()

    person = ""
    role = ""
    date = ""
    company = ""
    other = ""
    email = ""
    subject = ""
    message = ""

    # -----------------------------
    # Employee onboarding
    # -----------------------------
    if intent_type == "employee_onboarding":

        # Example:
        # "Onboard Rahul as a Backend Engineer starting Monday"
        match = re.search(
            r"onboard\s+([A-Za-z]+)\s+as\s+a?\s*(.+?)\s+starting\s+(.+)",
            text,
            re.IGNORECASE
        )

        if match:
            person = match.group(1).strip()
            role = match.group(2).strip()
            date = match.group(3).strip()

    # -----------------------------
    # Meeting
    # -----------------------------
    elif intent_type == "schedule_meeting":

        # Example:
        # "Schedule a meeting with Rahul tomorrow"

        match = re.search(
            r"with\s+([A-Za-z]+)",
            text,
            re.IGNORECASE
        )

        if match:
            person = match.group(1).strip()

        date_match = re.search(
            r"\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
            text,
            re.IGNORECASE
        )

        if date_match:
            date = date_match.group(1).strip()

    # -----------------------------
    # Email
    # -----------------------------
    elif intent_type == "send_email":

        # Example:
        # "Send an email to Rahul about the project deadline"

        match = re.search(
            r"(?:to|for)\s+([A-Za-z]+)",
            text,
            re.IGNORECASE
        )

        if match:
            person = match.group(1).strip()

        email_match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text)
        if email_match:
            email = email_match.group(0)

    return {
        "person": person,
        "role": role,
        "date": date,
        "company": company,
        "other": other,
        "email": email,
        "subject": subject,
        "message": message,
    }


def mock_intent(raw_text):
    """
    Temporary local Intent Engine.

    Used when OpenAI API credits are unavailable.
    """

    text = raw_text.lower()

    # -----------------------------
    # Employee onboarding
    # -----------------------------
    if "onboard" in text:

        intent_type = "employee_onboarding"

        return {
            "intent_type": intent_type,
            "summary": raw_text,
            "entities": extract_entities(raw_text, intent_type),
            "actions": [
                "Identify the employee",
                "Identify the employee role",
                "Identify the joining date",
                "Create onboarding workflow"
            ]
        }

    # -----------------------------
    # Study planning
    # -----------------------------
    if any(
        keyword in text
        for keyword in ["study", "timetable", "exam preparation", "exam prep"]
    ):

        intent_type = "study_planning"

        return {
            "intent_type": intent_type,
            "summary": raw_text,
            "entities": extract_entities(raw_text, intent_type),
            "actions": [
                "Identify study goals",
                "Identify available study time",
                "Organize subjects and priorities",
                "Create study timetable",
            ]
        }

    # -----------------------------
    # Meeting
    # -----------------------------
    if "meeting" in text or "schedule" in text:

        intent_type = "schedule_meeting"

        return {
            "intent_type": intent_type,
            "summary": raw_text,
            "entities": extract_entities(raw_text, intent_type),
            "actions": [
                "Identify meeting participants",
                "Identify preferred time",
                "Create meeting",
                "Notify participants"
            ]
        }

    # -----------------------------
    # Email
    # -----------------------------
    if "email" in text or "mail" in text:

        intent_type = "send_email"

        return {
            "intent_type": intent_type,
            "summary": raw_text,
            "entities": extract_entities(raw_text, intent_type),
            "actions": [
                "Identify recipient",
                "Understand email purpose",
                "Draft email",
                "Request approval before sending"
            ]
        }

    # -----------------------------
    # Generic request
    # -----------------------------
    intent_type = "general_request"

    return {
        "intent_type": intent_type,
        "summary": raw_text,
        "entities": extract_entities(raw_text, intent_type),
        "actions": [
            "Understand user request",
            "Determine required actions",
            "Ask for missing information if necessary"
        ]
    }


def ai_intent(raw_text):
    """
    Real AI Intent Engine.

    This will be used when OpenAI API credits are available.
    """

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured.")

    client = OpenAI(api_key=api_key)

    prompt = f"""
You are the Intent Engine of IntentOS.

Convert the user's natural-language request into structured intent.

USER REQUEST:
{raw_text}

Return ONLY valid JSON.

Use exactly:

{{
    "intent_type": "",
    "summary": "",
    "entities": {{
        "person": "",
        "role": "",
        "date": "",
        "company": "",
        "other": "",
        "email": "",
        "subject": "",
        "message": ""
    }},
    "actions": []
}}

Rules:
1. Do not invent information.
2. Missing information must be empty.
3. Extract important entities.
4. actions must describe logical steps.
5. Do not execute actions.
6. Return JSON only.
"""

    response = client.responses.create(
        model="gpt-5.6",
        input=prompt
    )

    return json.loads(response.output_text)


def understand_intent(raw_text):
    """
    Main IntentOS interface.

    DEMO_MODE=True:
        Uses local mock engine.

    DEMO_MODE=False:
        Uses real AI.
    """

    demo_mode = os.getenv(
        "DEMO_MODE",
        "true"
    ).lower() == "true"

    if demo_mode:
        return mock_intent(raw_text)

    return ai_intent(raw_text)