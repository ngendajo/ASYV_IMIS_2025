from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

class APIExceptionWithDetail(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'A server error occurred.'
    default_code = 'error'

    def __init__(self, detail=None, code=None, status_code=None):
        if detail is not None:
            self.detail = {'message': detail, 'code': code or self.default_code}
        else:
            self.detail = {'message': self.default_detail, 'code': self.default_code}
        if status_code is not None:
            self.status_code = status_code

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:
        if isinstance(exc, APIExceptionWithDetail):
            response.data = exc.detail
        else:
            # For other DRF exceptions, you might want to format them consistently
            if isinstance(response.data, dict) and 'detail' in response.data:
                response.data = {'message': response.data['detail'], 'code': exc.default_code if hasattr(exc, 'default_code') else 'generic_error'}
            elif isinstance(response.data, list): # For validation errors
                 response.data = {'message': 'Validation Error', 'details': response.data, 'code': 'validation_error'}
            else:
                 response.data = {'message': str(exc), 'code': exc.default_code if hasattr(exc, 'default_code') else 'generic_error'}

    return response