from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    readonly_fields = ('date_joined',)
    list_display = ('username', 'email', 'first_name', 'rwandan_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'gender')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {
            'fields': ('first_name', 'middle_name', 'rwandan_name', 'email', 'email1',
                      'phone', 'phone1', 'gender', 'dob', 'image_url')
        }),
        (_('Registration'), {'fields': ('reg_number',)}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'reg_number', 'password1', 'password2'),
        }),
    )
    search_fields = ('username', 'first_name', 'rwandan_name', 'email', 'reg_number')
    ordering = ('username',)