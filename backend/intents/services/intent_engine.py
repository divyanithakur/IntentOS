import json
import os
import re

from openai import OpenAI


def empty_entities():
    return {
        "person": "",
        "role": "",
        "date": "",
        "company": "",
        "other": ""
    }


def extract_onboarding_entities(raw_text):
    """
    Extract basic entities from an employee onboarding request.
    This is our local/demo entity extraction layer.
    """

    entities = empty_entities()

    # Example:
    # "Onboard Rahul as a Backend Engineer starting Monday"

    person_match = re.search(
        r"onboard\s+([A-Za-z]+)",
        raw_text,
        re.IGNORECASE
    )

    if person_match:
        entities["person"] = person_match.group(1)

    role_match = re.search(
        r"as\s+(?:a|an)?\s*(.+?)(?:\s+starting|\s+from|$)",
        raw_text,
        re.IGNORECASE
    )

    if role_match:
        entities["role"] = role_match.group(1).strip()

    date_match = re.search(
        r"(?:starting|joining|from)\s+(.+)$",
        raw_text,
        re.IGNORECASE
    )

    if date_match:
        entities["date"] = date_match.group(1).strip()

    return entities


def extract_meeting_entities(raw_text):
    """
    Extract basic entities from meeting requests.
    """

    entities = empty_entities()

    # Example:
    # "Schedule a meeting with Rahul tomorrow"

    person_match = re.search(
        r"(?:with|for)\s+([A-Za-z]+)",
        raw_text,
        re.IGNORECASE
    )

    if person_match:
        entities["person"] = person_match.group(1)

    date_match = re.search(
        r"\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        raw_text,
        re.IGNORECASE
    )

    if date_match:
        entities["date"] = date_match.group(1)

    return entities


def extract_email_entities(raw_text):
    """
    Extract basic entities from email requests.
    """

    entities = empty_entities()

    # Example:
    # "Send an email to Rahul about the project deadline"

    person_match = re.search(
        r"(?:to|for)\s+([A-Za-z]+)",
        raw_text,
        re.IGNORECASE
    )

    if person_match:
        entities["person"] = person_match.group(1)

    return entities


def mock_intent(raw_text):
    """
    Local Intent Engine.

    Used when OpenAI API is unavailable.

    This version performs:
    1. Intent classification
    2. Basic entity extraction
    3. Action planning
    """

    text = raw_text.lower()

    # --------------------------------------------------
    # EMPLOYEE ONBOARDING
    # --------------------------------------------------

    if "onboard" in text:

        entities = extract_onboarding_entities(raw_text)

        return {
            "intent_type": "employee_onboarding",
            "summary": raw_text,
            "entities": entities,
            "actions": [
    {
        "step": 1,
        "action": "identify_employee",
        "description": f"Identify {entities['person'] or 'the employee'}",
        "requires_approval": False
    },
    {
        "step": 2,
        "action": "identify_role",
        "description": f"Identify the role: {entities['role'] or 'not specified'}",
        "requires_approval": False
    },
    {
        "step": 3,
        "action": "identify_joining_date",
        "description": f"Identify joining date: {entities['date'] or 'not specified'}",
        "requires_approval": False
    },
    {
        "step": 4,
        "action": "create_onboarding_workflow",
        "description": f"Create onboarding workflow for {entities['person'] or 'the employee'}",
        "requires_approval": True
    }
]
        }

    # --------------------------------------------------
    # MEETING
    # --------------------------------------------------

    if "meeting" in text or "schedule" in text:

        entities = extract_meeting_entities(raw_text)

        return {
            "intent_type": "schedule_meeting",
            "summary": raw_text,
            "entities": entities,
            "actions": [
                "Identify meeting participants",
                "Identify preferred time",
                "Create meeting",
                "Notify participants"
            ]
        }

    # --------------------------------------------------
    # EMAIL
    # --------------------------------------------------

    if "email" in text or "mail" in text:

        entities = extract_email_entities(raw_text)

        return {
            "intent_type": "send_email",
            "summary": raw_text,
            "entities": entities,
            "actions": [
                "Identify recipient",
                "Understand email purpose",
                "Draft email",
                "Request approval before sending"
            ]
        }

    # --------------------------------------------------
    # GENERAL REQUEST
    # --------------------------------------------------

    return {
        "intent_type": "general_request",
        "summary": raw_text,
        "entities": empty_entities(),
        "actions": [
            "Understand user request",
            "Determine required actions",
            "Ask for missing information if necessary"
        ]
    }


def ai_intent(raw_text):
    """
    Real AI Intent Engine.

    This will be used when OpenAI API access is available.
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
        "other": ""
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
        Uses local Intent Engine.

    DEMO_MODE=False:
        Uses real AI.
    """

    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"

    if demo_mode:
        return mock_intent(raw_text)

    return ai_intent(raw_text)