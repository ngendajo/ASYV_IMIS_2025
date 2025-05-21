from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_rwandan_name(value):
    """Validate that the Rwandan name follows specific rules."""
    if len(value) < 2:
        raise ValidationError(
            _('Rwandan name must be at least 2 characters long.')
        )
    # Add more specific validation rules as needed