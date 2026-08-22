from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    detail = response.data.get("detail", response.data)
    if isinstance(detail, dict):
        message = "; ".join(
            f"{field}: {', '.join(str(item) for item in messages)}"
            for field, messages in detail.items()
        )
    elif isinstance(detail, list):
        message = "; ".join(str(item) for item in detail)
    else:
        message = str(detail)

    response.data = {"error": message}
    return response
