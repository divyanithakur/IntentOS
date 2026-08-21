def create_plan(intent):
    """
    Convert a detected intent into a safe execution plan.

    Nothing is executed here.
    This function only creates a plan.
    """

    intent_type = intent.get("intent_type")
    entities = intent.get("entities", {})
    actions = intent.get("actions", [])

    plan = {
        "intent_type": intent_type,
        "status": "pending",
        "requires_approval": True,
        "steps": []
    }

    if intent_type == "employee_onboarding":

        plan["steps"] = [
            {
                "step": 1,
                "action": "Verify employee",
                "details": {
                    "person": entities.get("person", "")
                }
            },
            {
                "step": 2,
                "action": "Verify role",
                "details": {
                    "role": entities.get("role", "")
                }
            },
            {
                "step": 3,
                "action": "Verify joining date",
                "details": {
                    "date": entities.get("date", "")
                }
            },
            {
                "step": 4,
                "action": "Create onboarding workflow",
                "details": {}
            }
        ]

    elif intent_type == "schedule_meeting":

        plan["steps"] = [
            {
                "step": 1,
                "action": "Identify meeting participants",
                "details": {
                    "person": entities.get("person", "")
                }
            },
            {
                "step": 2,
                "action": "Confirm meeting date",
                "details": {
                    "date": entities.get("date", "")
                }
            },
            {
                "step": 3,
                "action": "Create meeting",
                "details": {}
            },
            {
                "step": 4,
                "action": "Notify participants",
                "details": {}
            }
        ]

    elif intent_type == "send_email":

        plan["steps"] = [
            {
                "step": 1,
                "action": "Identify recipient",
                "details": {
                    "person": entities.get("person", "")
                }
            },
            {
                "step": 2,
                "action": "Prepare email",
                "details": {}
            },
            {
                "step": 3,
                "action": "Request approval",
                "details": {}
            },
            {
                "step": 4,
                "action": "Send email",
                "details": {}
            }
        ]

    else:

        plan["steps"] = [
            {
                "step": 1,
                "action": "Understand user request",
                "details": {}
            },
            {
                "step": 2,
                "action": "Determine required actions",
                "details": {}
            },
            {
                "step": 3,
                "action": "Ask for missing information",
                "details": {}
            }
        ]

    return plan