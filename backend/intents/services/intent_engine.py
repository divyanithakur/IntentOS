import json
import os

from openai import OpenAI


def mock_intent(raw_text):
    """
    Temporary local Intent Engine.
    Used while OpenAI API credits are unavailable.
    """

    text = raw_text.lower()

    # Employee onboarding
    if "onboard" in text:
        return {
            "intent_type": "employee_onboarding",
            "summary": raw_text,
            "entities": {
                "person": "",
                "role": "",
                "date": "",
                "company": "",
                "other": ""
            },
            "actions": [
                "Identify the employee",
                "Identify the employee role",
                "Identify the joining date",
                "Create onboarding workflow"
            ]
        }

    # Meeting
    if "meeting" in text or "schedule" in text:
        return {
            "intent_type": "schedule_meeting",
            "summary": raw_text,
            "entities": {
                "person": "",
                "role": "",
                "date": "",
                "company": "",
                "other": ""
            },
            "actions": [
                "Identify meeting participants",
                "Identify preferred time",
                "Create meeting",
                "Notify participants"
            ]
        }

    # Email
    if "email" in text or "mail" in text:
        return {
            "intent_type": "send_email",
            "summary": raw_text,
            "entities": {
                "person": "",
                "role": "",
                "date": "",
                "company": "",
                "other": ""
            },
            "actions": [
                "Identify recipient",
                "Understand email purpose",
                "Draft email",
                "Request approval before sending"
            ]
        }

    # Generic intent
    return {
        "intent_type": "general_request",
        "summary": raw_text,
        "entities": {
            "person": "",
            "role": "",
            "date": "",
            "company": "",
            "other": ""
        },
        "actions": [
            "Understand user request",
            "Determine required actions",
            "Ask for missing information if necessary"
        ]
    }


def ai_intent(raw_text):
    """
    Real AI Intent Engine.
    This will be used when API credits are available.
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
        Uses local mock engine.

    DEMO_MODE=False:
        Uses real AI.
    """

    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"

    if demo_mode:
        return mock_intent(raw_text)

    return ai_intent(raw_text)