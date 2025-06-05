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
        
#subject crud
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
        
#Crud for KidAcademic
class KidAcademicsSerializer(serializers.ModelSerializer):
    class Meta:
        model = KidAcademics
        fields = ['id', 'kid', 'academic_year', 'level', 'combination']
        
    def validate_academic_year(self, value):
        current_year = 2025  # You might want to use datetime.now().year
        if value < 2000 or value > current_year + 10:
            raise serializers.ValidationError(f"Academic year must be between 2000 and {current_year + 10}.")
        return value
    
    def validate(self, data):
        # Check for unique constraint
        kid = data.get('kid')
        academic_year = data.get('academic_year')
        
        if self.instance:
            # Update case - exclude current instance
            existing = KidAcademics.objects.filter(
                kid=kid, 
                academic_year=academic_year
            ).exclude(id=self.instance.id)
        else:
            # Create case
            existing = KidAcademics.objects.filter(
                kid=kid, 
                academic_year=academic_year
            )
        
        if existing.exists():
            raise serializers.ValidationError(
                "A record for this kid and academic year already exists."
            )
        
        return data

class AlumniListsSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    image_url = serializers.CharField(source='user.image_url')  # assuming image_url is on user model
    first_name = serializers.CharField(source='user.first_name')
    #last_name = serializers.CharField(source='user.last_name')
    phone1 = serializers.CharField(source='user.phone1')
    #reg_number = serializers.CharField(source='user.reg_number', allow_null=True, default='')  # if this is on user or kid?
    #alumn_id = serializers.IntegerField(source='id')  # your kid's id or alumni id? adjust accordingly
    
    grade_name = serializers.CharField(source='family.grade.grade_name', allow_null=True, default='')
    grade_id = serializers.IntegerField(source='family.grade.id', allow_null=True)
    family_name = serializers.CharField(source='family.family_name', allow_null=True, default='')
    family_id = serializers.IntegerField(source='family.id', allow_null=True)
    combination_name = serializers.CharField(source='combination.combination_name', allow_null=True, default='')
    combination_id = serializers.IntegerField(source='combination.id', allow_null=True)
    
    
    class Meta:
        model = Kid
        fields = [
            'id',
            'email',
            'image_url',
            'first_name',
            'phone1',
            'grade_name',
            'grade_id',
            'family_name',
            'family_id',
            'combination_name',
            'combination_id',
        ]

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'college_name', 'country', 'city']


class EmploymentSerializer(serializers.ModelSerializer):
    # By default, ManyToManyField uses PrimaryKeyRelatedField with many=True
    # contributing_leaps = serializers.PrimaryKeyRelatedField(
    #     queryset=Leap.objects.all(),  # validate IDs against all leaps
    #     many=True,
    #     required=False,
    #     allow_empty=True
    # )
    
    class Meta:
        model = Employment
        fields = ['title', 'description', 'industry', 'company', 'start_date', 'end_date'
        ]

class FurtherEducationSerializer(serializers.ModelSerializer): 
    college = serializers.CharField(source='college.college_name')
    location = serializers.SerializerMethodField()
    level = serializers.CharField(source='get_level_display')
    scholarship = serializers.CharField(source='get_scholarship_display')
    status = serializers.CharField(source='get_status_display')

    
    class Meta:
        model = FurtherEducation
        fields = ['level', 'degree', 'college', 'location', 'scholarship', 'status']

    def get_location(self, obj):
        return f"{obj.college.city}, {obj.college.country}"