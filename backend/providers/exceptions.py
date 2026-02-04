"""
Custom exception handler for DRF.
"""
from rest_framework import status
from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns 401 for authentication errors.

    DRF's default behavior is to return 403 for both authentication and
    permission errors. This handler ensures authentication errors return 401.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Return 401 for authentication-related errors
        if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
            response.status_code = status.HTTP_401_UNAUTHORIZED

        # Also check the response data for the specific message
        if response.status_code == 403:
            detail = response.data.get('detail', '')
            if 'credentials were not provided' in str(detail).lower():
                response.status_code = status.HTTP_401_UNAUTHORIZED

    return response
