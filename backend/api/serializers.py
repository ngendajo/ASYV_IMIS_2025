from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .models import *

User = get_user_model()

#User crud serialisers
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'reg_number', 'first_name', 'rwandan_name',
            'middle_name', 'email', 'email1', 'phone', 'phone1',
            'image_url', 'dob', 'gender', 'password', 'password_confirm'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
        }

    def validate(self, attrs):
        # Remove password_confirm from attrs since it's not a model field
        password_confirm = attrs.pop('password_confirm', None)
        
        # Validate passwords match
        if attrs.get('password') != password_confirm:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        try:
            user = User.objects.create_user(**validated_data)
            return user
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        except Exception as e:
            raise serializers.ValidationError(f"Error creating user: {str(e)}")

    def update(self, instance, validated_data):
        try:
            # Handle password update separately
            password = validated_data.pop('password', None)
            if password:
                instance.set_password(password)

            # Update other fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        except Exception as e:
            raise serializers.ValidationError(f"Error updating user: {str(e)}")
        
class UpdateUserImageUrlSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('image_url',)
        
#end of users crud serializers

#User login serialisers

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(style={"input_type": "password"}, required=True)
    new_password = serializers.CharField(style={"input_type": "password"}, required=True)

    def validate_current_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError({'current_password': 'Does not match'})
        return value

#reset password
class EmailSerilizer(serializers.Serializer):
    email = serializers.EmailField()
    class Meta:
        fields = ('email',)

class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        fields = ("password",)

    def validate(self, data):
        password = data.get("password")
        token = self.context.get("kwargs").get("token")
        encoded_pk = self.context.get("kwargs").get("encoded_pk")
        
        if token is None or encoded_pk is None:
            serializers.ValidationError("Missing data")

        pk = urlsafe_base64_decode(encoded_pk).decode()
        user = User.objects.get(pk=pk)

        if not PasswordResetTokenGenerator().check_token(user, token):
            raise serializers.ValidationError("The token is invalid")
        
        user.set_password(password)
        user.save()
        return data
    
#End User login serialisers

#Grades and Families
class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'grade_name', 'admission_year_to_asyv', 
                 'graduation_year_to_asyv', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class FamilySerializer(serializers.ModelSerializer):
    mother_details = UserSerializer(source='mother', read_only=True)
    grade_details = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ['id', 'family_name', 'family_number', 'mother', 
                 'mother_details', 'grade', 'grade_details', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_grade_details(self, obj):
        return {
            'id': obj.grade.id,
            'grade_name': obj.grade.grade_name,
            'admission_year': obj.grade.admission_year_to_asyv,
            'graduation_year': obj.grade.graduation_year_to_asyv
        }
        
#Leap crud
class LeapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leap
        fields = ['id', 'ep', 'leap_category', 'created_at', 'updated_at']
        
#kid crud
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'subject_name', 'credits']
        
class CombinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Combination
        fields = ['id', 'combination_name', 'abbreviation']
        
class KidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kid
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')