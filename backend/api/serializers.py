from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .models import *

User = get_user_model()
        
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

class GradeInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['grade_name', 'admission_year_to_asyv', 'graduation_year_to_asyv']

class FamilySerializer(serializers.ModelSerializer):
    grade_info = GradeInfoSerializer(source='grade', read_only=True)

    class Meta:
        model = Family
        fields = ['id', 'family_name', 'family_number', 'mother', 'grade_info']

class GradeSerializer(serializers.ModelSerializer):
    families = FamilySerializer(many=True, write_only=True)

    class Meta:
        model = Grade
        fields = [
            'id',
            'grade_name',
            'admission_year_to_asyv',
            'graduation_year_to_asyv',
            'families'
        ]

    def create(self, validated_data):
        families_data = validated_data.pop('families', [])
        grade = Grade.objects.create(**validated_data)
        for family_data in families_data:
            Family.objects.create(grade=grade, **family_data)
        return grade

        
#Leap crud
class LeapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leap
        fields = '__all__'
        
#subject crud
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'
        
class CombinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Combination
        fields = '__all__'

class EmploymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employment
        fields = ['id', 'alumn', 'title', 'status', 'industry', 'company', 'start_date', 'end_date']

class KidSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Kid
        fields = '__all__'


class AlumniListSerializer(serializers.Serializer):
    family = FamilySerializer()
    combination = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    rwandan_name = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    employment = EmploymentSerializer(many=True, read_only=True)
    image_url = serializers.ImageField(source='user.image_url')
    user_id = serializers.SerializerMethodField()

    class Meta:
        model = Kid
        fields = ['id', 'first_name', 'rwandan_name', 
                  'gender', 'email', 'phone', 'image_url', 'family', 
                  'employment', 'combination']
    def get_gender(self, obj): 
        return obj.user.gender if obj.user else None
    
    def get_first_name(self, obj):
        return obj.user.first_name if obj.user else None

    def get_rwandan_name(self, obj):
        return obj.user.rwandan_name if obj.user else None
    
    def get_email(self, obj): 
        return obj.user.email if obj.user else None
    
    def get_phone(self, obj): 
        return obj.user.phone if obj.user else None
    
    def get_user_id(self, obj):
        return obj.user.id if obj.user else None
    
    def get_combination(self, obj):
        academic = KidAcademics.objects.filter(kid=obj, level='S6').first()
        if academic and academic.combination:
            return CombinationSerializer(academic.combination).data
        return None
    

#User crud serialisers
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    kid = KidSerializer(read_only=True)

    class Meta:
        model = User
        fields = [field.name for field in User._meta.fields] + ['kid' ,'password', 'password_confirm']
        # extra_kwargs = {
        #     'password': {'write_only': True},
        #     'password_confirm': {'write_only': True},
        # }

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

class AlumniDirectorySerializer(serializers.Serializer):
    alumni = KidSerializer(many=True)
    employment_count = serializers.IntegerField()
    education_count = serializers.IntegerField()

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'


class FurtherEducationSerializer(serializers.ModelSerializer): 
    college = serializers.PrimaryKeyRelatedField(queryset=College.objects.all())
    location = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = FurtherEducation
        fields = ['id', 'alumn', 'college', 'level', 'degree', 'status', 'location', 'scholarship', 'scholarship_details']

    def get_location(self, obj):
        return f"{obj.college.city}, {obj.college.country}"
    
class BasicInformationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    kid_id = serializers.IntegerField(required=False)
    first_name = serializers.CharField(required=False)
    middle_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    rwandan_name = serializers.CharField(required=False, allow_blank=True)
    # add other user fields here

class PersonalStatusSerializer(serializers.Serializer):
    marital_status = serializers.CharField(required=False, allow_blank=True)
    has_children = serializers.BooleanField(required=False)
    life_status = serializers.CharField(required=False, allow_blank=True)
    graduation_status = serializers.CharField(required=False, allow_blank=True)
    health_issue = serializers.CharField(required=False, allow_blank=True)

class CurrentAddressSerializer(serializers.Serializer):
    current_district_or_city = serializers.CharField(required=False, allow_blank=True)
    current_county = serializers.CharField(required=False, allow_blank=True)

class StudentProfileSerializer(serializers.Serializer):
    basic_information = BasicInformationSerializer(required=False)
    personal_status = PersonalStatusSerializer(required=False)
    current_address = CurrentAddressSerializer(required=False)
    # other nested fields if needed

    def update(self, instance, validated_data):
        user = instance['user']
        kid = instance['kid']

        basic_info = validated_data.get('basic_information', {})
        personal_status = validated_data.get('personal_status', {})
        current_address = validated_data.get('current_address', {})

        # Update user fields from basic_information
        for attr in ['first_name', 'middle_name', 'rwandan_name']:
            if attr in basic_info:
                setattr(user, attr, basic_info[attr])
        user.save()

        # Update kid fields from personal_status
        for attr in ['marital_status', 'has_children', 'life_status', 'graduation_status', 'health_issue']:
            if attr in personal_status:
                setattr(kid, attr, personal_status[attr])
        
        # Update kid fields from current_address
        for attr in ['current_district_or_city', 'current_county']:
            if attr in current_address:
                setattr(kid, attr, current_address[attr])

        kid.save()

        return {'user': user, 'kid': kid}

class CurrentInfoSerializer(serializers.Serializer):
    marital_status = serializers.CharField(required=False, allow_blank=True)
    has_children = serializers.BooleanField(required=False)
    current_district_or_city = serializers.CharField(required=False, allow_blank=True)
    current_county = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        # instance here should be the Kid model instance (or whatever model holds these fields)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class FurtherEducationChoicesSerializer(serializers.Serializer):
    levels = serializers.SerializerMethodField()
    application_results = serializers.SerializerMethodField()
    scholarships = serializers.SerializerMethodField()
    statuses = serializers.SerializerMethodField()

    def get_levels(self, obj):
        return [{'value': choice[0], 'label': choice[1]} for choice in FurtherEducation.LEVEL_CHOICES]

    def get_application_results(self, obj):
        return [{'value': choice[0], 'label': choice[1]} for choice in FurtherEducation.APPLICATION_RESULT_CHOICES]

    def get_scholarships(self, obj):
        return [{'value': choice[0], 'label': choice[1]} for choice in FurtherEducation.SCHOLARSHIP_CHOICES]

    def get_statuses(self, obj):
        return [{'value': choice[0], 'label': choice[1]} for choice in FurtherEducation.STATUS_CHOICES]
    
    
#Library management System
    
#author data serializer
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'author_name']  # Or whatever fields you use
        read_only_fields = ['id']  # <- Prevent client from setting the id

#end author serilizer

#category data serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

#end category serilizer

#book data serializer
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'
        
class DisplayBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'
        depth=3
        
class BookListDisplaySerializer(serializers.Serializer):
    book_name = serializers.CharField()
    isbnumber = serializers.CharField()
    category_name = serializers.CharField()
    author_name = serializers.CharField()
    number_of_books = serializers.CharField()
    id = serializers.IntegerField()

#end book serilizer

#Issue_Book data serializer
#Issue_Book data serializer
class Issue_BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue_Book
        fields = '__all__'


#end Issue_Book serilizer

#Reports
class IssuedBookDisplaySerializer(serializers.Serializer):
    grade_name = serializers.CharField()
    studentid = serializers.CharField()
    family_name = serializers.CharField()
    combination_name = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.CharField()
    book_name = serializers.CharField()
    isbnumber = serializers.CharField()
    category_name = serializers.CharField()
    author_name = serializers.CharField()
    library_number = serializers.CharField()
    issuedate = serializers.CharField()
    returndate = serializers.CharField()
    id = serializers.IntegerField()
    
class StudentListDisplaySerializer(serializers.Serializer):
    grade_name = serializers.CharField()
    studentid = serializers.CharField()
    family_name = serializers.CharField()
    combination_name = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.CharField()
    id = serializers.IntegerField()
    grade_id = serializers.IntegerField()
    combination_id = serializers.IntegerField()
    eay = serializers.IntegerField()
    gender = serializers.CharField()
class GeneralReportDisplaySerializer(serializers.Serializer):
    nbook_types = serializers.IntegerField()
    nbooks = serializers.IntegerField()
    nstudents = serializers.IntegerField()
    nissued_books = serializers.IntegerField()
    noverdue_books = serializers.IntegerField()
    
class MostBorrowerDisplaySerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    grade_name = serializers.CharField()
    family_name = serializers.CharField()
    combination_name = serializers.CharField()
    issue_count = serializers.IntegerField()
    
class BorrowerByGradeDisplaySerializer(serializers.Serializer):
    grade_name = serializers.CharField()
    family_name = serializers.CharField()
    combination_name = serializers.CharField()
    borrowers = serializers.IntegerField()
    students = serializers.IntegerField()
    
class AllBorrowersDisplaySerializer(serializers.Serializer):
    first_name=serializers.CharField()
    last_name=serializers.CharField()
    phone1=serializers.CharField()
    email=serializers.CharField()
    grade_name=serializers.CharField()
    family_name=serializers.CharField()
    combination_name=serializers.CharField()
    book_name=serializers.CharField()
    isbnumber=serializers.CharField()
    category_name=serializers.CharField()
    author_name=serializers.CharField()
    issuedate = serializers.CharField()
    returndate = serializers.CharField()
    student_id= serializers.IntegerField()
    user_id= serializers.IntegerField()
    is_student=serializers.BooleanField()
    is_alumni=serializers.BooleanField()
    is_staff=serializers.BooleanField()
