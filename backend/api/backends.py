from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from django.contrib.auth import get_user_model

class MultiFieldAuthenticationBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        
        if username is None or password is None:
            return None

        try:
            # Check all possible authentication fields
            user = UserModel.objects.get(
                Q(username=username) |
                Q(email=username) |
                Q(email1=username) |
                Q(phone=username) |
                Q(phone1=username) |
                Q(reg_number=username)
            )

            if user.check_password(password) and self.user_can_authenticate(user):
                return user
            return None
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a non-existing user
            UserModel().set_password(password)
            return None

    def user_can_authenticate(self, user):
        """
        Reject users with is_active=False.
        """
        return user.is_active