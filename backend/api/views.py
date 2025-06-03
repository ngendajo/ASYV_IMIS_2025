from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import *
from django.core.exceptions import ValidationError,ObjectDoesNotExist
from django.db.utils import IntegrityError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from django.contrib.auth import logout
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
from rest_framework.decorators import api_view , permission_classes
from datetime import datetime, date
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _
import pandas as pd
from django.db import transaction
from rest_framework.decorators import action

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .filters import *
import logging

logger = logging.getLogger(__name__)
from .models import *
from django.db.models import Count

User = get_user_model()

#Crud of Users

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    #permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(
                {
                    "status": "success",
                    "message": "User created successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            return Response(
                {"status": "error", "message": "A user with these details already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(
                {
                    "status": "success",
                    "message": "User updated successfully",
                    "data": serializer.data
                }
            )
        except ValidationError as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {
                    "status": "success",
                    "message": "User deleted successfully"
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {
                    "status": "success",
                    "message": "Users retrieved successfully",
                    "data": serializer.data
                }
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(
                {
                    "status": "success",
                    "message": "User retrieved successfully",
                    "data": serializer.data
                }
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_image(request, pk):
    user = User.objects.get(pk=pk)
    data = UpdateUserImageUrlSerializer(instance=user, data=request.data)

    if data.is_valid():
        data.save()
        return Response(data.data)
    else:
        print(data.errors)
        return Response(error=data.errors,status=status.HTTP_404_NOT_FOUND)
            
#Upload staff with .xlsx file
class StaffExcelUploadView(APIView):
    DEFAULT_PASSWORD = "Amahoro@1"

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['file']
        
        # Check if file is Excel
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload an Excel file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Read Excel file
            df = pd.read_excel(excel_file)
            
            # Define required and optional columns based on User model
            required_columns = ['username', 'reg_number', 'first_name', 'rwandan_name', 'gender']  # Removed password from required columns
            optional_columns = ['middle_name', 'email', 'email1', 'phone', 'phone1', 'image_url', 'dob']
            
            # Validate required columns
            if not all(column in df.columns for column in required_columns):
                return Response(
                    {'error': f'Excel file must contain these columns: {", ".join(required_columns)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process each row
            successful_records = 0
            errors = []
            phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$')
            
            for index, row in df.iterrows():
                try:
                    # Basic data validation
                    if not row['username'] or not row['first_name'] or not row['rwandan_name']:
                        raise ValueError("Required fields cannot be empty")
                    
                    if row['gender'] not in ['M', 'F', 'N']:
                        raise ValueError("Invalid gender value. Must be M, F, or N")
                    
                    # Prepare user data with default password
                    user_data = {
                        'username': row['username'],
                        'reg_number': row['reg_number'],
                        'first_name': row['first_name'],
                        'rwandan_name': row['rwandan_name'],
                        'gender': row['gender'],
                        'password': make_password(self.DEFAULT_PASSWORD),
                        'is_staff': True
                    }
                    
                    # Add optional fields if present
                    for field in optional_columns:
                        if field in df.columns and pd.notna(row[field]):
                            # Handle date field
                            if field == 'dob':
                                try:
                                    user_data[field] = pd.to_datetime(row[field]).date()
                                except:
                                    raise ValueError("Invalid date format for date of birth")
                            # Handle phone validation
                            elif field in ['phone', 'phone1']:
                                try:
                                    phone_regex(row[field])
                                    user_data[field] = row[field]
                                except:
                                    raise ValueError(f"Invalid phone number format for {field}")
                            else:
                                user_data[field] = row[field]
                    
                    # Check for duplicate values across fields
                    unique_values = []
                    for field in ['email', 'email1', 'phone', 'phone1', 'username', 'reg_number']:
                        if field in user_data and user_data[field]:
                            if user_data[field] in unique_values:
                                raise ValueError(f"Duplicate value found for {field}")
                            unique_values.append(user_data[field])
                    
                    # Create user
                    User.objects.create(**user_data)
                    successful_records += 1
                    
                except Exception as e:
                    errors.append(f"Row {index + 2}: {str(e)}")
            
            response_data = {
                'message': f'Successfully processed {successful_records} records. Default password set to "{self.DEFAULT_PASSWORD}"',
                'errors': errors if errors else None
            }
            
            return Response(response_data, status=status.HTTP_200_OK if not errors else status.HTTP_207_MULTI_STATUS)
            
        except Exception as e:
            return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            
#End of crud users
#login logout and change and reset password portal
@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/'
    ]
    return Response(routes)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # First validate the user credentials
        data = super().validate(attrs)
        
        # Check if user is active
        if not self.user.is_active:
            raise AuthenticationFailed(
                _('Your account is disabled. Please contact the administrator.'),
                'account_disabled'
            )

        # Helper function to serialize datetime/date objects
        def serialize_date(date_obj):
            if isinstance(date_obj, (datetime, date)):
                return date_obj.isoformat()
            return None

        # Get the token for the validated and active user
        token = self.get_token(self.user)

        # Add custom claims
        token['first_name'] = self.user.first_name
        token['rwandan_name'] = self.user.rwandan_name
        token['email'] = self.user.email
        token['email1'] = self.user.email1
        token['phone1'] = self.user.phone1
        token['phone'] = self.user.phone
        token['is_superuser'] = self.user.is_superuser
        token['is_alumni'] = self.user.is_alumni
        token['is_mama'] = self.user.is_mama
        token['is_librarian'] = self.user.is_librarian
        token['is_student'] = self.user.is_student
        token['is_teacher'] = self.user.is_teacher
        token['username'] = self.user.username
        token['reg_number'] = self.user.reg_number
        token['middle_name'] = self.user.middle_name
        token['dob'] = serialize_date(self.user.dob)
        token['gender'] = self.user.gender 
        token['is_staff'] = self.user.is_staff
        token['date_joined'] = serialize_date(self.user.date_joined)
        token['last_login'] = serialize_date(self.user.last_login)
        token['id'] = self.user.id
        token['is_active'] = self.user.is_active

        # Update the response data with the updated token
        data["token"] = str(token)
        
        # Add user details to response
        """ data.update({
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "email": self.user.email,
                "is_active": self.user.is_active,
                "is_staff": self.user.is_staff,
                "is_superuser": self.user.is_superuser
            }
        }) """

        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except AuthenticationFailed as e:
            # Handle authentication failure for inactive users
            return Response(
                {
                    "status": "error",
                    "message": str(e),
                    "code": getattr(e, "code", "authentication_failed")
                },
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            # Handle other exceptions
            return Response(
                {
                    "status": "error",
                    "message": "Authentication failed",
                    "detail": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'msg': 'Successfully Logged out'}, status=status.HTTP_200_OK)



class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, ]

    def post(self, request):
        serializer = PasswordChangeSerializer(context={'request': request}, data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class PasswordReset(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, ]
    serializer_class = EmailSerilizer

    def post(self, request):

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.data["email"]
        user = User.objects.filter(email=email).first()
        if user:
            encoded_pk = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)

            reset_url = reverse(
                "reset-password",
                kwargs={"encoded_pk":encoded_pk, "token":token}
            )


            return Response(
                {
                    "message":reset_url
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"message":"User doesn't exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
class ResetPassword(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, ]
    serializer_class = ResetPasswordSerializer

    def patch(self, request, *args, **kwargs):

        serializer = self.serializer_class(
            data=request.data, context={"kwargs":kwargs}
        )
        serializer.is_valid(raise_exception=True)

        return Response(
            {"message":"Password reset complete"},
            status=status.HTTP_200_OK,
        )
    
    # End login logout and change password portal
    
    #Grades and Families
    
class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {"error": "A grade with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Failed to create grade. Please check your input."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {"error": "A grade with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Failed to update grade. Please check your input."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": "Failed to delete grade."},
                status=status.HTTP_400_BAD_REQUEST
            )

class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {"error": "A family with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Failed to create family. Please check your input."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {"error": "A family with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Failed to update family. Please check your input."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": "Failed to delete family."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
# Upload grades using .xlsx file
class GradeExcelUploadView(APIView):
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['file']
        
        # Check if file is Excel
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload an Excel file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Read Excel file
            df = pd.read_excel(excel_file)
            
            # Validate required columns
            required_columns = ['grade_name', 'admission_year_to_asyv', 'graduation_year_to_asyv']
            if not all(column in df.columns for column in required_columns):
                return Response(
                    {'error': f'Excel file must contain these columns: {", ".join(required_columns)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process each row
            successful_records = 0
            errors = []
            
            for index, row in df.iterrows():
                try:
                    grade_data = {
                        'grade_name': row['grade_name'],
                        'admission_year_to_asyv': row['admission_year_to_asyv'],
                        'graduation_year_to_asyv': row['graduation_year_to_asyv']
                    }
                    
                    serializer = GradeSerializer(data=grade_data)
                    if serializer.is_valid():
                        serializer.save()
                        successful_records += 1
                    else:
                        errors.append(f"Row {index + 2}: {serializer.errors}")
                        
                except Exception as e:
                    errors.append(f"Row {index + 2}: {str(e)}")
            
            response_data = {
                'message': f'Successfully processed {successful_records} records',
                'errors': errors if errors else None
            }
            
            return Response(response_data, status=status.HTTP_200_OK if not errors else status.HTTP_207_MULTI_STATUS)
            
        except Exception as e:
            return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
#Upload Families using .xlsx file
class FamilyExcelUploadView(APIView):
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['file']
        
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload an Excel file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(excel_file)
            
            required_columns = ['family_name', 'family_number', 'mother_username', 'grade_name']
            
            if not all(column in df.columns for column in required_columns):
                return Response(
                    {'error': f'Excel file must contain these columns: {", ".join(required_columns)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_families = []
            errors = []
            
            # Bulk fetch mothers
            mother_usernames = df['mother_username'].unique()
            existing_mothers = {
                user.username: user 
                for user in User.objects.filter(
                    username__in=mother_usernames,
                    is_staff=True
                )
            }
            
            # Bulk fetch grades
            grade_names = df['grade_name'].unique()
            existing_grades = {
                grade.grade_name: grade 
                for grade in Grade.objects.filter(grade_name__in=grade_names)
            }
            
            # Get non-staff users for better error messages
            non_staff_users = set(User.objects.filter(
                username__in=mother_usernames,
                is_staff=False
            ).values_list('username', flat=True))
            
            for index, row in df.iterrows():
                try:
                    # Basic data validation
                    if not row['family_name'] or not row['family_number'] or \
                       not row['mother_username'] or not row['grade_name']:
                        raise ValueError("Required fields cannot be empty")
                    
                    mother_username = row['mother_username']
                    grade_name = row['grade_name']
                    
                    # Validate mother
                    if mother_username not in existing_mothers:
                        if mother_username in non_staff_users:
                            raise ValueError(f"User '{mother_username}' exists but is not a staff member")
                        else:
                            raise ValueError(f"User with username '{mother_username}' does not exist")
                    
                    # Validate grade
                    if grade_name not in existing_grades:
                        raise ValueError(f"Grade '{grade_name}' does not exist")
                    
                    # Prepare family data
                    family_data = {
                        'family_name': row['family_name'].strip(),
                        'family_number': str(row['family_number']).strip(),
                        'mother': existing_mothers[mother_username],
                        'grade': existing_grades[grade_name]
                    }
                    
                    valid_families.append(family_data)
                    
                except Exception as e:
                    errors.append(f"Row {index + 2}: {str(e)}")
            
            if errors:
                return Response({
                    'message': 'Validation failed. No records were created.',
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                with transaction.atomic():
                    for family_data in valid_families:
                        Family.objects.create(**family_data)
                    
                return Response({
                    'message': f'Successfully created {len(valid_families)} family records',
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': f'Error creating family records: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'error': f'Error processing file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
#Leap Crud
class LeapViewSet(viewsets.ModelViewSet):
    queryset = Leap.objects.all()
    serializer_class = LeapSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to create leap', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Leap not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to retrieve leap', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Leap not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to update leap', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Leap not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to delete leap', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class LeapExcelUploadView(APIView):
    def post(self, request):
        try:
            # Check if file exists in request
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'No file uploaded'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            file = request.FILES['file']
            
            # Validate file extension
            if not file.name.endswith('.xlsx'):
                return Response(
                    {'error': 'Only .xlsx files are allowed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Read Excel file
            df = pd.read_excel(file)
            
            # Validate required columns
            required_columns = ['ep', 'leap_category']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f"Missing required columns: {', '.join(missing_columns)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Clean data
            df['ep'] = df['ep'].astype(str).str.strip()
            df['leap_category'] = df['leap_category'].astype(str).str.strip().str.lower()

            # Validate categories
            valid_categories = dict(Leap.CATEGORY_CHOICES).keys()
            invalid_categories = df[~df['leap_category'].isin(valid_categories)]['leap_category'].unique()
            if len(invalid_categories) > 0:
                return Response(
                    {'error': f"Invalid leap categories found: {', '.join(invalid_categories)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create Leap objects within a transaction
            created_leaps = []
            with transaction.atomic():
                for _, row in df.iterrows():
                    leap = Leap.objects.create(
                        ep=row['ep'],
                        leap_category=row['leap_category']
                    )
                    created_leaps.append(leap)

            return Response({
                'status': 'success',
                'message': f'Successfully created {len(created_leaps)} leaps',
                'created_count': len(created_leaps)
            }, status=status.HTTP_201_CREATED)

        except pd.errors.EmptyDataError:
            return Response(
                {'error': 'The uploaded file is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except pd.errors.ParserError:
            return Response(
                {'error': 'Unable to parse the Excel file. Please ensure it\'s a valid .xlsx file'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error processing file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#Subjects crud
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': f'Failed to create subject: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Subject.DoesNotExist:
            return Response(
                {'error': 'Subject not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to update subject: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Subject.DoesNotExist:
            return Response(
                {'error': 'Subject not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to delete subject: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        try:
            subjects = self.get_queryset()
            serializer = self.get_serializer(subjects, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch subjects: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Subject.DoesNotExist:
            return Response(
                {'error': 'Subject not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch subject: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
#Combination CRUD          
class CombinationViewSet(viewsets.ModelViewSet):
    queryset = Combination.objects.all()
    serializer_class = CombinationSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': f'Failed to create combination: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Combination.DoesNotExist:
            return Response(
                {'error': 'Combination not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to retrieve combination: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Combination.DoesNotExist:
            return Response(
                {'error': 'Combination not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to update combination: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def partial_update(self, request, *args, **kwargs):
        try:
            return super().partial_update(request, *args, **kwargs)
        except Combination.DoesNotExist:
            return Response(
                {'error': 'Combination not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to partially update combination: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Combination.DoesNotExist:
            return Response(
                {'error': 'Combination not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to delete combination: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
#Kid CRUD       
class KidViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Kid instances.
    Provides CRUD operations with comprehensive error handling.
    """
    queryset = Kid.objects.all()
    serializer_class = KidSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = KidFilter
    search_fields = ['user__first_name', 'user__last_name', 'family__family_name', 
                    'origin_district', 'current_district_or_city']
    ordering_fields = ['created_at', 'updated_at', 'points_in_national_exam']
    
    def create(self, request, *args, **kwargs):
        """Create a new Kid instance with error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to create kid record', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a Kid instance with error handling"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Kid not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to retrieve kid record', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Update a Kid instance (full update) with error handling"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Kid not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to update kid record', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def partial_update(self, request, *args, **kwargs):
        """Partially update a Kid instance with error handling"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(
                instance, 
                data=request.data, 
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Kid not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to partially update kid record', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete a Kid instance with error handling"""
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {'message': 'Kid record deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Kid not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to delete kid record', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def list(self, request, *args, **kwargs):
        """List all Kid instances with error handling"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': 'Failed to list kid records', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
#add kids at one time
class DataUploadViewSet(viewsets.ViewSet):
    DEFAULT_PASSWORD = "Amahoro@1"
    
    def validate_phone(self, phone):
        if not phone or pd.isna(phone):
            return None
        phone = ''.join(c for c in str(phone) if c.isdigit() or c == '+')
        if not phone.startswith('+'):
            phone = '+' + phone
        return phone

    def validate_email(self, email):
        if pd.isna(email) or not email:
            return None
        return str(email).strip().lower()

    def validate_date(self, date_str):
        if pd.isna(date_str) or not date_str:
            return None
        try:
            if isinstance(date_str, str):
                return datetime.strptime(date_str, '%Y-%m-%d').date()
            return date_str.date()
        except:
            return None

    def safe_convert_to_float(self, value):
        """Safely convert value to float or return None"""
        if pd.isna(value) or value is None or value == '':
            return None
        try:
            return float(value)
        except:
            return None
            
    def safe_convert_to_bool(self, value):
        """Safely convert value to boolean"""
        if pd.isna(value) or value is None:
            return None
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            if value.lower() in ('true', 'yes', 'y', '1'):
                return True
            if value.lower() in ('false', 'no', 'n', '0'):
                return False
        if isinstance(value, (int, float)):
            return bool(value)
        return None

    def get_leap_columns(self, df):
        """Identify leap columns (those starting with 'leap_')"""
        return [col for col in df.columns if col.startswith('leap_')]

    def validate_leap_values(self, row, leap_columns):
        """Validate that leap values exist in the database"""
        errors = []
        leap_eps = []
        
        for col in leap_columns:
            ep = row.get(col)
            if not pd.isna(ep) and ep:
                ep = str(ep).strip()
                if ep:
                    # Check if leap exists in database
                    if not Leap.objects.filter(ep=ep).exists():
                        errors.append(f"Leap with EP '{ep}' does not exist")
                    leap_eps.append(ep)
        # Remove duplicates from leap_eps
        leap_eps = list(set(leap_eps))
        return errors, leap_eps

    def validate_family(self, family_name):
        """Validate that family exists in the database"""
        if not pd.isna(family_name) and family_name:
            if not Family.objects.filter(family_name=family_name).exists():
                return [f"Family '{family_name}' does not exist"]
        return []

    def validate_user_data(self, row):
        errors = []
        required_fields = ['username', 'reg_number', 'first_name', 'rwandan_name', 'gender']
        
        for field in required_fields:
            if pd.isna(row.get(field)) or not row.get(field):
                errors.append(f"{field} is required")

        if row.get('gender') and row['gender'].upper() not in ['M', 'F', 'N']:
            errors.append("Invalid gender value")

        # Check if username already exists
        if row.get('username') and User.objects.filter(username=row.get('username')).exists():
            errors.append(f"Username '{row.get('username')}' already exists")
            
        # Check if reg_number already exists
        if row.get('reg_number') and User.objects.filter(reg_number=row.get('reg_number')).exists():
            errors.append(f"Registration number '{row.get('reg_number')}' already exists")

        # Validate phones
        phone = self.validate_phone(row.get('phone'))
        phone1 = self.validate_phone(row.get('phone1'))
        if phone and phone1 and phone == phone1:
            errors.append("Phone and Phone1 cannot be the same")

        # Validate emails
        email = self.validate_email(row.get('email'))
        email1 = self.validate_email(row.get('email1'))
        if email and email1 and email == email1:
            errors.append("Email and Email1 cannot be the same")
            
        # Check if email already exists
        if email and User.objects.filter(email=email).exists():
            errors.append(f"Email '{email}' already exists")

        return errors

    def validate_kid_data(self, row, leap_columns):
        errors = []
        # Remove 'has_children' from required fields and validate separately
        required_fields = ['origin_district', 'origin_sector', 'current_district_or_city', 
                          'current_county', 'marital_status', 'life_status']
        
        for field in required_fields:
            if pd.isna(row.get(field)) or not row.get(field):
                errors.append(f"{field} is required")
        
        # Special validation for has_children as boolean
        has_children = self.safe_convert_to_bool(row.get('has_children'))
        if has_children is None:
            errors.append("has_children is required and must be a boolean value (True/False)")

        if row.get('graduation_status') and row['graduation_status'] not in dict(Kid.GRADUATION_STATUS_CHOICES):
            errors.append("Invalid graduation status")

        # Validate family
        family_errors = self.validate_family(row.get('family_name'))
        errors.extend(family_errors)

        # Validate leaps
        leap_errors, _ = self.validate_leap_values(row, leap_columns)
        errors.extend(leap_errors)

        # Validate numerical fields
        if not pd.isna(row.get('points_in_national_exam')) and row.get('points_in_national_exam') is not None:
            try:
                float(row['points_in_national_exam'])
            except:
                errors.append("Invalid points in national exam")

        return errors

    def prepare_row_data(self, row):
        """Prepare and transform row data for database insertion"""
        # Get family instance
        family = None
        if row.get('family_name'):
            family = Family.objects.get(family_name=row['family_name'])

        # Safely convert numeric fields
        points_in_exam = self.safe_convert_to_float(row.get('points_in_national_exam'))
        max_points = self.safe_convert_to_float(row.get('maximum_points_in_national_exam'))
        
        # Convert has_children to boolean
        has_children = self.safe_convert_to_bool(row.get('has_children'))
        
        # Handle health_issue separately - if None, save as 'None' string
        health_issue = row.get('health_issue')
        if health_issue is None or pd.isna(health_issue):
            health_issue = 'None'
            
        # Get leap EPs
        leap_columns = [col for col in row.keys() if col.startswith('leap_')]
        _, leap_eps = self.validate_leap_values(row, leap_columns)

        return {
            'user': {
                'username': row['username'],
                'reg_number': row['reg_number'],
                'first_name': row['first_name'],
                'rwandan_name': row['rwandan_name'],
                'middle_name': row.get('middle_name'),
                'email': self.validate_email(row.get('email')),
                'email1': self.validate_email(row.get('email1')),
                'phone': self.validate_phone(row.get('phone')),
                'phone1': self.validate_phone(row.get('phone1')),
                'image_url': row.get('image_url'),
                'dob': self.validate_date(row.get('dob')),
                'gender': row['gender'].upper() if row.get('gender') else None,
                'password': make_password(self.DEFAULT_PASSWORD),  # Set a temporary password
            },
            'kid': {
                'family': family,
                'graduation_status': row.get('graduation_status', 'studying'),
                'origin_district': row['origin_district'],
                'origin_sector': row['origin_sector'],
                'current_district_or_city': row['current_district_or_city'],
                'current_county': row['current_county'],
                'health_issue': health_issue,
                'marital_status': row['marital_status'],
                'life_status': row['life_status'],
                'has_children': has_children,
                'points_in_national_exam': points_in_exam,
                'maximum_points_in_national_exam': max_points,
                'mention': row.get('mention')
            },
            'leap_eps': leap_eps
        }

    @action(detail=False, methods=['POST'])
    def upload_xlsx(self, request):
        """
        Upload and process Excel file containing user and kid data
        """
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read Excel file
            df = pd.read_excel(request.FILES['file'])
            
            # Clean the dataframe: Replace NaN, empty strings, and 'nan' strings with None
            for col in df.columns:
                df[col] = df[col].apply(lambda x: None if pd.isna(x) or x == '' or (isinstance(x, str) and x.lower() == 'nan') else x)
            
            leap_columns = self.get_leap_columns(df)
            
            # First pass: validate all rows and collect errors
            errors = []
            valid_rows = []
            
            for index, row_data in df.iterrows():
                # Convert row to dictionary with None instead of NaN
                row = row_data.to_dict()
                
                # Additional cleaning to ensure no 'nan' strings
                for key in row:
                    if isinstance(row[key], str) and row[key].lower() == 'nan':
                        row[key] = None
                
                # Validate the row
                row_errors = self.validate_user_data(row)
                row_errors.extend(self.validate_kid_data(row, leap_columns))

                if row_errors:
                    errors.append({
                        'row': index + 2,  # Excel rows start at 1, and we skip header
                        'errors': row_errors
                    })
                else:
                    # If no errors, prepare data for insertion and add to valid rows
                    try:
                        prepared_data = self.prepare_row_data(row)
                        valid_rows.append((index, prepared_data))
                    except Exception as e:
                        errors.append({
                            'row': index + 2,
                            'errors': [f"Error preparing data: {str(e)}"]
                        })
            
            # If there are any errors, return without inserting data
            if errors:
                return Response({
                    'success_count': 0,
                    'error_count': len(errors),
                    'errors': errors,
                    'message': 'Validation failed. No data was inserted.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Second pass: insert all valid rows
            success_count = 0
            insertion_errors = []
            
            try:
                with transaction.atomic():
                    for index, data in valid_rows:
                        try:
                            # Create User
                            user = User.objects.create(**data['user'])
                            
                            # Create Kid with user reference
                            kid_data = data['kid']
                            kid_data['user'] = user
                            kid = Kid.objects.create(**kid_data)
                            
                            # Add leaps
                            if data['leap_eps']:
                                kid.leaps.set(Leap.objects.filter(ep__in=data['leap_eps']))
                            
                            success_count += 1
                        except Exception as e:
                            insertion_errors.append({
                                'row': index + 2,
                                'errors': [f"Error during insertion: {str(e)}"]
                            })
                    
                    # If any insertion errors occurred, raise exception to trigger rollback
                    if insertion_errors:
                        raise Exception("Errors occurred during data insertion")
                
                # Return success response
                return Response({
                    'success_count': success_count,
                    'error_count': 0,
                    'message': f'Successfully inserted {success_count} records'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                # Return detailed error response
                return Response({
                    'success_count': 0,
                    'error_count': len(insertion_errors),
                    'errors': insertion_errors,
                    'message': f'Error during data insertion: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            # Handle any unexpected errors during file processing
            return Response({
                'error': str(e),
                'message': 'An error occurred during processing'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#KidAcademics CRUD  
class KidAcademicsViewSet(viewsets.ModelViewSet):
    queryset = KidAcademics.objects.select_related('kid', 'combination').all()
    serializer_class = KidAcademicsSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                
                return Response(
                    {
                        'success': True,
                        'message': 'Kid academics record created successfully',
                        'data': serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
        except serializers.ValidationError as e:
            logger.error(f"Validation error creating kid academics: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'Validation error',
                    'errors': e.detail
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'Database error occurred',
                    'errors': ['A record for this kid and academic year already exists']
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error creating kid academics: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'An unexpected error occurred',
                    'errors': ['Please try again later']
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response({
                    'success': True,
                    'data': serializer.data
                })
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {
                    'success': True,
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error retrieving kid academics: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'Error retrieving kid academics records',
                    'errors': ['Please try again later']
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(
                {
                    'success': True,
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error retrieving kid academics record: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'Kid academics record not found',
                    'errors': ['The requested record does not exist']
                },
                status=status.HTTP_404_NOT_FOUND
            )
    
    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                partial = kwargs.pop('partial', False)
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                
                return Response(
                    {
                        'success': True,
                        'message': 'Kid academics record updated successfully',
                        'data': serializer.data
                    },
                    status=status.HTTP_200_OK
                )
        except serializers.ValidationError as e:
            logger.error(f"Validation error updating kid academics: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'Validation error',
                    'errors': e.detail
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'Database error occurred',
                    'errors': ['A record for this kid and academic year already exists']
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error updating kid academics: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'An unexpected error occurred',
                    'errors': ['Please try again later']
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()
                self.perform_destroy(instance)
                return Response(
                    {
                        'success': True,
                        'message': 'Kid academics record deleted successfully'
                    },
                    status=status.HTTP_204_NO_CONTENT
                )
        except Exception as e:
            logger.error(f"Error deleting kid academics record: {e}")
            return Response(
                {
                    'success': False,
                    'message': 'Error deleting kid academics record',
                    'errors': ['Please try again later']
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
#import kids combination
class KidAcademicsImporter:
    """
    Class to handle importing KidAcademics data from Excel files
    """
    
    def __init__(self):
        self.errors = []
        self.success_count = 0
        self.skip_count = 0
        
    def validate_row_data(self, row, row_index):
        """
        Validate individual row data before processing
        """
        errors = []
        
        # Check required fields
        required_fields = ['reg_number', 'academic_year', 'level', 'abbreviation']
        for field in required_fields:
            if pd.isna(row.get(field)) or str(row.get(field)).strip() == '':
                errors.append(f"Row {row_index}: {field} is required")
        
        # Validate academic year
        try:
            academic_year = int(row.get('academic_year', 0))
            if academic_year < 2000 or academic_year > 2100:
                errors.append(f"Row {row_index}: Invalid academic year {academic_year}")
        except (ValueError, TypeError):
            errors.append(f"Row {row_index}: Academic year must be a valid integer")
        
        # Validate level
        valid_levels = ['EY', 'S4', 'S5', 'S6', 'S456', 'SECONDARY']
        level = str(row.get('level', '')).strip().upper()
        if level not in valid_levels:
            errors.append(f"Row {row_index}: Level must be one of {valid_levels}")
        
        return errors
    
    def get_or_validate_objects(self, row, row_index):
        """
        Get or validate related objects (User, Kid, Combination)
        """
        errors = []
        objects = {}
        
        # Get User by reg_number
        reg_number = str(row.get('reg_number', '')).strip()
        try:
            user = User.objects.get(reg_number=reg_number)
            objects['user'] = user
        except User.DoesNotExist:
            errors.append(f"Row {row_index}: User with reg_number '{reg_number}' not found")
            return None, errors
        
        # Get Kid for this user
        try:
            kid = Kid.objects.get(user=user)
            objects['kid'] = kid
        except Kid.DoesNotExist:
            errors.append(f"Row {row_index}: Kid record not found for user '{reg_number}'")
            return None, errors
        except Kid.MultipleObjectsReturned:
            errors.append(f"Row {row_index}: Multiple Kid records found for user '{reg_number}'")
            return None, errors
        
        # Get Combination
        abbreviation = str(row.get('abbreviation', '')).strip()
        try:
            combination = Combination.objects.get(abbreviation__iexact=abbreviation)
            objects['combination'] = combination
        except Combination.DoesNotExist:
            errors.append(f"Row {row_index}: Combination with abbreviation '{abbreviation}' not found")
            return None, errors
        except Combination.MultipleObjectsReturned:
            # Handle multiple combinations - try to get the most appropriate one
            combinations = Combination.objects.filter(abbreviation__iexact=abbreviation)
            
            # Show detailed information about duplicate combinations
            combination_details = []
            for combo in combinations:
                # Include ID, name (if available), and any other relevant fields
                detail = f"ID: {combo.id}"
                if hasattr(combo, 'name') and combo.name:
                    detail += f", Name: '{combo.name}'"
                if hasattr(combo, 'is_active'):
                    detail += f", Active: {combo.is_active}"
                if hasattr(combo, 'created_at'):
                    detail += f", Created: {combo.created_at.strftime('%Y-%m-%d')}"
                combination_details.append(detail)
            
            combination_list = "; ".join(combination_details)
            
            # Option 1: Use first active combination if available
            active_combination = combinations.filter(is_active=True).first() if hasattr(combinations.first(), 'is_active') else None
            if active_combination:
                objects['combination'] = active_combination
                # Log warning about multiple combinations
                logger.warning(f"Row {row_index}: Multiple combinations found for abbreviation '{abbreviation}' - [{combination_list}]. Using active combination ID: {active_combination.id}")
            else:
                # Option 2: Use most recent combination
                latest_combination = combinations.order_by('-created_at').first() if hasattr(combinations.first(), 'created_at') else combinations.first()
                if latest_combination:
                    objects['combination'] = latest_combination
                    logger.warning(f"Row {row_index}: Multiple combinations found for abbreviation '{abbreviation}' - [{combination_list}]. Using combination ID: {latest_combination.id}")
                else:
                    # Fallback: list all available combinations
                    errors.append(f"Row {row_index}: Multiple Combinations found with abbreviation '{abbreviation}'. Details: [{combination_list}]")
                    return None, errors
        
        return objects, errors
    
    def create_academics_for_levels(self, kid, base_academic_year, combination, levels_with_years, row_index):
        """
        Create KidAcademics records for specified levels with corresponding academic years
        levels_with_years: list of tuples [(level, academic_year), ...]
        """
        created_records = []
        
        for level, academic_year in levels_with_years:
            try:
                kid_academics, created = KidAcademics.objects.update_or_create(
                    kid=kid,
                    academic_year=academic_year,
                    level=level,
                    defaults={
                        'combination': combination
                    }
                )
                
                action = "Created" if created else "Updated"
                logger.info(f"{action} KidAcademics for {kid} - {academic_year} - {level}")
                created_records.append((kid_academics, created))
                
            except IntegrityError as e:
                error_msg = f"Row {row_index}: Database integrity error for level {level} (year {academic_year}) - {str(e)}"
                self.errors.append(error_msg)
                return []
                
            except Exception as e:
                error_msg = f"Row {row_index}: Unexpected error for level {level} (year {academic_year}) - {str(e)}"
                self.errors.append(error_msg)
                return []
        
        return created_records

    def get_levels_with_years(self, level_input, base_academic_year):
        """
        Determine which levels to create and their corresponding academic years
        Returns list of tuples: [(level, academic_year), ...]
        """
        if level_input == 'EY':
            return [('EY', base_academic_year)]
        elif level_input == 'S4':
            return [
                ('S4', base_academic_year),
                ('S5', base_academic_year + 1),
                ('S6', base_academic_year + 2)
            ]
        elif level_input == 'S5':
            return [
                ('S4', base_academic_year - 1),
                ('S5', base_academic_year),
                ('S6', base_academic_year + 1)
            ]
        elif level_input == 'S6':
            return [
                ('S4', base_academic_year - 2),
                ('S5', base_academic_year - 1),
                ('S6', base_academic_year)
            ]
        elif level_input in ['S456', 'SECONDARY']:
            # For S456/SECONDARY, assume the year provided is for S4
            return [
                ('S4', base_academic_year),
                ('S5', base_academic_year + 1),
                ('S6', base_academic_year + 2)
            ]
        else:
            # For any other level, just use the base year
            return [(level_input, base_academic_year)]

    def process_excel_file(self, file_input, sheet_name=None, dry_run=False):
        """
        Main method to process Excel file and import KidAcademics data
        file_input can be either a file path (string) or a file-like object
        """
        try:
            # Read Excel file - handle both file path and file object
            if sheet_name:
                df = pd.read_excel(file_input, sheet_name=sheet_name)
            else:
                df = pd.read_excel(file_input)
            
            # Clean column names
            df.columns = df.columns.str.strip().str.lower()
            
            # Check if required columns exist
            required_columns = ['reg_number', 'academic_year', 'level', 'abbreviation']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            logger.info(f"Processing {len(df)} rows from Excel file")
            
            # Process each row
            if not dry_run:
                with transaction.atomic():
                    self._process_rows(df)
            else:
                self._process_rows(df, dry_run=True)
            
            return self.get_import_summary()
            
        except Exception as e:
            logger.error(f"Error processing Excel file: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'processed': 0,
                'success_count': 0,
                'skip_count': 0,
                'errors': []
            }
    
    def _process_rows(self, df, dry_run=False):
        """Process DataFrame rows"""
        for index, row in df.iterrows():
            row_index = index + 2  # Excel row number (1-indexed + header)
            
            # Validate row data
            validation_errors = self.validate_row_data(row, row_index)
            if validation_errors:
                self.errors.extend(validation_errors)
                self.skip_count += 1
                continue
            
            # Get related objects
            objects, object_errors = self.get_or_validate_objects(row, row_index)
            if object_errors:
                self.errors.extend(object_errors)
                self.skip_count += 1
                continue
            
            if dry_run:
                self.success_count += 1
                continue
            
            # Process based on level specification
            try:
                academic_year = int(row['academic_year'])
                level_input = str(row['level']).strip().upper()
                
                # Get levels with their corresponding academic years
                levels_with_years = self.get_levels_with_years(level_input, academic_year)
                
                # Create records for determined levels and years
                created_records = self.create_academics_for_levels(
                    objects['kid'], 
                    academic_year, 
                    objects['combination'], 
                    levels_with_years,
                    row_index
                )
                
                if created_records:
                    self.success_count += len(created_records)
                else:
                    self.skip_count += 1
                
            except ValueError as e:
                error_msg = f"Row {row_index}: Invalid academic year - {str(e)}"
                self.errors.append(error_msg)
                self.skip_count += 1
                
            except Exception as e:
                error_msg = f"Row {row_index}: Unexpected error - {str(e)}"
                self.errors.append(error_msg)
                self.skip_count += 1
    
    def get_import_summary(self):
        """
        Return summary of import process
        """
        return {
            'success': len(self.errors) == 0 or self.success_count > 0,
            'total_processed': self.success_count + self.skip_count,
            'success_count': self.success_count,
            'skip_count': self.skip_count,
            'errors': self.errors
        }


class KidAcademicsImportView(APIView):
    """
    API View for importing KidAcademics data from Excel files
    """
    parser_classes = [MultiPartParser, FormParser]
    #permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """
        Handle Excel file upload and processing
        
        Expected form data:
        - file: Excel file
        - sheet_name (optional): Excel sheet name
        - dry_run (optional): Boolean for validation only
        """
        try:
            # Validate file upload
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'No file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_file = request.FILES['file']
            
            # Validate file type
            if not uploaded_file.name.endswith(('.xlsx', '.xls')):
                return Response(
                    {'error': 'Only Excel files (.xlsx, .xls) are allowed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get optional parameters
            sheet_name = request.data.get('sheet_name', None)
            dry_run = request.data.get('dry_run', 'false').lower() == 'true'
            
            # Process the file directly from memory
            importer = KidAcademicsImporter()
            result = importer.process_excel_file(
                uploaded_file, 
                sheet_name=sheet_name,
                dry_run=dry_run
            )
            
            # Determine response status
            if result['success']:
                response_status = status.HTTP_200_OK
                if dry_run:
                    result['message'] = 'Validation completed successfully'
                else:
                    result['message'] = 'Import completed successfully'
            else:
                response_status = status.HTTP_400_BAD_REQUEST
                result['message'] = 'Import failed'
            
            return Response(result, status=response_status)
            
        except Exception as e:
            logger.error(f"Unexpected error in KidAcademicsImportView: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': f'Unexpected error: {str(e)}',
                    'message': 'Import failed due to server error'
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
    
    def get(self, request, *args, **kwargs):
        """
        Return information about the import endpoint
        """
        return Response({
            'message': 'KidAcademics Import Endpoint',
            'description': 'Upload Excel file to import KidAcademics data',
            'accepted_methods': ['POST'],
            'required_fields': {
                'file': 'Excel file (.xlsx or .xls)'
            },
            'optional_fields': {
                'sheet_name': 'Excel sheet name (string)',
                'dry_run': 'Validation only - true/false (boolean)'
            },
            'expected_columns': [
                'reg_number',
                'academic_year', 
                'level',
                'abbreviation'
            ],
            'valid_levels': ['EY', 'S4', 'S5', 'S6', 'S456', 'SECONDARY'],
            'level_logic': {
                'EY': 'Creates 1 record for EY level with specified year',
                'S4': 'Creates 3 records: S4 (specified year), S5 (year+1), S6 (year+2)',
                'S5': 'Creates 3 records: S4 (year-1), S5 (specified year), S6 (year+1)',
                'S6': 'Creates 3 records: S4 (year-2), S5 (year-1), S6 (specified year)',
                'S456/SECONDARY': 'Creates 3 records: S4 (specified year), S5 (year+1), S6 (year+2)'
            },
            'examples': {
                'S4_2024': 'Creates S4(2024), S5(2025), S6(2026)',
                'S5_2025': 'Creates S4(2024), S5(2025), S6(2026)',
                'S6_2026': 'Creates S4(2024), S5(2025), S6(2026)'
            }
        })
        
#view alumni list
class AlumniListView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Kid.objects.filter(graduation_status="graduated").select_related(
            'user', 'family'
        )

        serializer = AlumniListsSerializer(queryset, many=True)
        return Response(serializer.data)

#alumni gender distribution
@api_view(['GET'])
def gender_distribution(request):
    # Filter only graduated kids
    graduated_kids = Kid.objects.filter(graduation_status='graduated')
    # Follow FK to user and count gender
    male_count = graduated_kids.filter(user__gender='M').count()
    female_count = graduated_kids.filter(user__gender='F').count()

    return Response({
        'males': male_count,
        'females': female_count
    })

#Alumni combination distribution 
#based on senior 6 
@api_view(['GET'])
def combination_counts(request):
    queryset = KidAcademics.objects.filter(
        kid__graduation_status='graduated', 
        level='S6'
    ).values(
        'combination__abbreviation'
    ).annotate(
        alumni_count=Count('kid', distinct=True)
    ).order_by('combination__abbreviation')

    # Format data as list of dicts for JSON
    data = list(queryset)
    return Response(data)

        
#Upload Employment using .xlsx file
class EmploymentExcelUploadView(APIView):
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['file']
        
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload an Excel file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(excel_file)
            
            required_columns = ['title', 'alumn_reg', 'status', 'industry', 
                'description', 'company', 'on_going', 'crc_support',
                'recorded_by', 'is_approved', 'approved_at', 'contributing_leaps',
                'start_date', 'end_date'] # registration number passed in as identifier for user
                #Do we need recorded_by, is_approved, approved_at just for passing in excel?
            
            if not all(column in df.columns for column in required_columns):
                return Response(
                    {'error': f'Excel file must contain these columns: {", ".join(required_columns)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_employments = []
            employment_leaps_map = {} # key: Employment instance, value: list of Leap instances
            errors = []
            
            # Bulk fetch alumn by username
            alumn_reg_numbers = df['alumn_reg'].dropna().unique()
            # Bulk fetch recorders by username 
            recorder_reg_numbers = df['recorded_by'].dropna().unique()
            #creates dictionary for reg_number : user object 
            all_reg_numbers = set(alumn_reg_numbers) | set(recorder_reg_numbers)
            users_by_reg_number = {
                user.reg_number: user
                for user in User.objects.filter(reg_number__in=all_reg_numbers)
            }
            #get list of valid status options 
            valid_statuses = {choice[0] for choice in Employment.EMPLOYMENT_CHOICES}
           
            #clean any boolean values into True/False 
            def parse_bool(val):
                if pd.isna(val):
                    return False
                if isinstance(val, bool):
                    return val
                if isinstance(val, (int, float)):
                    return val == 1
                if isinstance(val, str):
                    return val.strip().lower() in ['true', '1', 'yes']
                return False
            
            #check inputted data 
            for index, row in df.iterrows():
                try:
                    #check alumn is a user 
                    alumn_reg = row['alumn_reg']
                    if alumn_reg not in users_by_reg_number:
                        raise ValueError(f"User (alumn) with username '{alumn_reg}' does not exist")
                    alumn_user = users_by_reg_number[alumn_reg] #get alumn user object with reg number key

                    # Get Kid linked to User
                    try:
                        alumn_kid = Kid.objects.get(user=alumn_user)
                    except Kid.DoesNotExist:
                        raise ValueError(f"No Kid record found for user '{alumn_reg}'")

                    # Validate graduation status
                    if alumn_kid.graduation_status.lower() != 'graduated':
                        raise ValueError(f"User '{alumn_reg}' is not graduated and cannot be an alumn")
                    
                    # Validate Leap names (contributing_leaps column expected as comma-separated ep names)
                    # Validate with KidLeaps that the kid has taken those leaps 
                    ep_raw = str(row.get('contributing_leaps', '')).strip()
                    leap_names = [x.strip() for x in ep_raw.split(',') if x.strip()] #leap names provided in data
                    existing_leaps_qs = Leap.objects.filter(ep__in=leap_names) #queryset of all leap objects that matches from data inputted
                    existing_leaps = set(existing_leaps_qs.values_list('ep', flat=True)) #set of existing eps 
                    missing_leaps = set(leap_names) - existing_leaps #eps not in leap model 
                    if missing_leaps:
                        return Response(
                            {'error': f'These ep names do not exist: {missing_leaps}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    kid_leaps = KidLeap.objects.filter(kid=alumn_kid, leap__ep__in=leap_names)
                    valid_eps_for_kid = set(kid_leaps.values_list('leap_id', flat=True)) #list of leaps for kid

                    invalid_leaps = [leap.ep for leap in existing_leaps if leap.id not in valid_eps_for_kid]
                    if invalid_leaps:
                        raise ValueError(f" Kid {alumn_reg} has not participated in these LEAPs: {', '.join(invalid_leaps)}")
                    
                    # Validate employment status
                    status_val = row['status']
                    if status_val not in valid_statuses:
                        raise ValueError(f"Status '{status_val}' is invalid. Valid choices: {valid_statuses}")
                    
                    recorded_by_user = None
                    if pd.notna(row['recorded_by']):
                        rec_reg= row['recorded_by']
                        if rec_reg not in users_by_reg_number:
                            raise ValueError(f"User (recorded_by) with username '{rec_reg}' does not exist")
                        recorded_by_user = users_by_reg_number[rec_reg]

                    on_going = parse_bool(row['on_going'])
                    crc_support = parse_bool(row['crc_support'])
                    is_approved = parse_bool(row['is_approved'])

                    approved_at = None
                    if pd.notna(row['approved_at']):
                        approved_at = pd.to_datetime(row['approved_at'])
                    
                    # Prepare employement data
                    employment_data = Employment(
                        title=row['title'].strip(),
                        alumn=alumn_kid, #kid object 
                        status=status_val,
                        industry=row.get('industry', '').strip() if pd.notna(row.get('industry')) else '',
                        description=row.get('description', '').strip() if pd.notna(row.get('description')) else '',
                        company=row['company'].strip(),
                        on_going=on_going,
                        crc_support=crc_support,
                        recorded_by=recorded_by_user,
                        is_approved=is_approved,
                        approved_at=approved_at,
                        start_date=row.get('start_date', '').strip() if pd.notna(row.get('start_date')) else '',
                        end_date=row.get('end_date', '').strip() if pd.notna(row.get('end_date')) else '',
                    )
                    
                    valid_employments.append(employment_data)
                    valid_leap_objs = existing_leaps_qs.filter(ep__in=valid_eps_for_kid)
                    employment_leaps_map[employment_data] = list(valid_leap_objs)
                    
                except Exception as e:
                    errors.append(f"Row {index + 2}: {str(e)}")
            
            if errors:
                return Response({
                    'message': 'Validation failed. No records were created.',
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                with transaction.atomic():
                    Employment.objects.bulk_create(valid_employments)
                    for employment, leaps in employment_leaps_map.items():
                        employment.contributing_leaps.set(leaps) #mapping leaps to employment

                return Response({
                    'message': f'Successfully created {len(valid_employments)} employment records',
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': f'Error creating employment records: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'error': f'Error processing file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
class CollegeExcelUploadView(APIView): 
    def post(self, request): 
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['file']
        
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload an Excel file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(excel_file)
            required_columns = ['college_name', 'country', 'city']

            if not all(column in df.columns for column in required_columns):
                return Response(
                    {'error': f'Excel file must contain these columns: {", ".join(required_columns)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_colleges = []
            for _, row in df.iterrows():
                college = College(
                    college_name=row['college_name'],
                    country=row['country'],
                    city=row['city']
                )
                valid_colleges.append(college)

            College.objects.bulk_create(valid_colleges)

            return Response({'message': f'Successfully uploaded {len(valid_colleges)} colleges.'})

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

class FurtherEducationExcelUploadView(APIView): 
    def post(self, request): 
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['file']
        
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload an Excel file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(excel_file)
            required_columns = ['alumn_reg', 'level', 'degree', 'college', 
                'application_result', 'waitlisted', 'enrolled', 'scholarship',
                'scholarship_details', 'status', 'crc_support']
            
            if not all(column in df.columns for column in required_columns):
                return Response(
                    {'error': f'Excel file must contain these columns: {", ".join(required_columns)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_further_education = []
            errors = []

            # Bulk fetch alumn by username
            alumn_reg = df['alumn_reg'].dropna().unique()
            #creates dictionary for username : user object 
            users_by_reg_number = {
                user.reg_number: user
                for user in User.objects.filter(reg_number__in=alumn_reg)
            }

            #get list of valid choices 
            valid_level = {choice[0] for choice in FurtherEducation.LEVEL_CHOICES}
            valid_application_result = {choice[0] for choice in FurtherEducation.APPLICATION_RESULT_CHOICES}
            valid_scholarship = {choice[0] for choice in FurtherEducation.SCHOLARSHIP_CHOICES} 
            valid_status = {choice[0] for choice in FurtherEducation.STATUS_CHOICES}

            #Clean boolean values into True/False
            def parse_bool(val):
                if pd.isna(val):
                    return False
                if isinstance(val, bool):
                    return val
                if isinstance(val, (int, float)):
                    return val == 1
                if isinstance(val, str):
                    return val.strip().lower() in ['true', '1', 'yes']
                return False
            
              #check inputted data 
            for index, row in df.iterrows():
                try:
                    #check alumn is a user 
                    alumn_reg = row['alumn']
                    if alumn_reg not in users_by_reg_number:
                        raise ValueError(f"User (alumn) with reg number '{alumn_reg}' does not exist")
                    alumn_user = users_by_reg_number[alumn_reg]

                    # Get Kid linked to User
                    try:
                        alumn_kid = Kid.objects.get(user=alumn_user)
                    except Kid.DoesNotExist:
                        raise ValueError(f"No Kid record found for user '{alumn_reg}'")
                    
                    # Validate graduation status
                    if alumn_kid.graduation_status.lower() != 'graduated':
                        raise ValueError(f"User '{alumn_reg}' is not graduated and cannot be an alumn")
                    
                    #check if college exists 
                    college_name = row['college_name']
                    try: 
                        college_obj = College.objects.get(college_name=college_name)
                    except College.DoesNotExist: 
                        raise ValueError(f"No College record found for college ' {college_name}'")

                    #validate level 
                    level_val = row['level'] 
                    if level_val not in valid_level: 
                        raise ValueError(f"Level ' {level_val}' is invalid, Valid choices: {valid_level}") 
                    
                    #validate application result 
                    application_result_val = row['application_result'] 
                    if application_result_val not in valid_application_result: 
                        raise ValueError(f"Application Result ' {application_result_val}' is invalid, Valid choices: {valid_application_result}") 
                    
                    #validate scholarship 
                    scholarship_val = row['scholarship'] 
                    if scholarship_val not in valid_scholarship: 
                        raise ValueError(f"Scholarship ' {scholarship_val}' is invalid, Valid choices: {valid_scholarship}") 
                    
                    #validate status
                    status_val = row['status']
                    if status_val not in valid_status: 
                        raise ValueError(f"Status ' {status_val}' is invalid, Valid choices: {valid_status}") 
                    
                    #validate boolean fields
                    crc_support = parse_bool(row['crc_support'])
                    waitlisted = parse_bool(row['waitlisted']) 
                    enrolled = parse_bool(row['enrolled']) 

                    #prepare further education data
                    further_education_data = FurtherEducation(
                        alumn=alumn_kid, #Kid object 
                        level=level_val,
                        degree=row.get('degree', '').strip() if pd.notna(row.get('degree')) else '',
                        college=college_obj,
                        application_result=application_result_val, 
                        waitlisted=waitlisted, 
                        enrolled=enrolled, 
                        scholarship=scholarship_val, 
                        scholarship_details=row.get('scholarship_details', '').strip() if pd.notna(row.get('scholarship_details')) else '', 
                        status=status_val,
                        crc_support=crc_support
                    )

                    valid_further_education.append(further_education_data)

                except Exception as e:
                    errors.append(f"Row {index + 2}: {str(e)}")
            
            if errors:
                return Response({
                    'message': 'Validation failed. No records were created.',
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try: #creates the objects
                with transaction.atomic():
                    for further_education_data in valid_further_education:
                        FurtherEducation.objects.bulk_create(valid_further_education)

                return Response({
                    'message': f'Successfully created {len(valid_further_education)} further education records',
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': f'Error creating further education records: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'error': f'Error processing file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

#CRUD for employment      
class EmploymentViewSet(viewsets.ModelViewSet):
    queryset = Employment.objects.select_related('alumn', 'recorded_by').prefetch_related('contributing_leaps').all()
    serializer_class = EmploymentSerializer

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                return Response(
                    {
                        'success': True,
                        'message': 'Employment record created successfully',
                        'data': serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
        except serializers.ValidationError as e:
            logger.error(f"Validation error creating employment: {e}")
            return Response(
                {'success': False, 'message': 'Validation error', 'errors': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            return Response(
                {'success': False, 'message': 'Database error occurred', 'errors': ['Integrity error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error creating employment: {e}")
            return Response(
                {'success': False, 'message': 'An unexpected error occurred', 'errors': ['Please try again later']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response({'success': True, 'data': serializer.data})
            serializer = self.get_serializer(queryset, many=True)
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving employment records: {e}")
            return Response(
                {'success': False, 'message': 'Error retrieving employment records', 'errors': ['Please try again later']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving employment record: {e}")
            return Response(
                {'success': False, 'message': 'Employment record not found', 'errors': ['The requested record does not exist']},
                status=status.HTTP_404_NOT_FOUND
            )
    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                partial = kwargs.pop('partial', False)
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(
                    {'success': True, 'message': 'Employment record updated successfully', 'data': serializer.data},
                    status=status.HTTP_200_OK
                )
        except serializers.ValidationError as e:
            logger.error(f"Validation error updating employment: {e}")
            return Response(
                {'success': False, 'message': 'Validation error', 'errors': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            return Response(
                {'success': False, 'message': 'Database error occurred', 'errors': ['Integrity error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error updating employment: {e}")
            return Response(
                {'success': False, 'message': 'An unexpected error occurred', 'errors': ['Please try again later']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def destroy(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()
                self.perform_destroy(instance)
                return Response(
                    {'success': True, 'message': 'Employment record deleted successfully'},
                    status=status.HTTP_204_NO_CONTENT
                )
        except Exception as e:
            logger.error(f"Error deleting employment record: {e}")
            return Response(
                {'success': False, 'message': 'Error deleting employment record', 'errors': ['Please try again later']},
                status=status.HTTP_400_BAD_REQUEST
            )
#CRUD for Further Education
class FurtherEducationViewSet(viewsets.ModelViewSet):
    queryset = FurtherEducation.objects.select_related('alumn').all()
    serializer_class = FurtherEducationSerializer

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                return Response(
                    {
                        'success': True,
                        'message': 'Further education record created successfully',
                        'data': serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
        except serializers.ValidationError as e:
            logger.error(f"Validation error creating further education: {e}")
            return Response(
                {'success': False, 'message': 'Validation error', 'errors': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            return Response(
                {'success': False, 'message': 'Database error occurred', 'errors': ['Integrity error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error creating further education: {e}")
            return Response(
                {'success': False, 'message': 'An unexpected error occurred', 'errors': ['Please try again later']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response({'success': True, 'data': serializer.data})
            serializer = self.get_serializer(queryset, many=True)
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving further education records: {e}")
            return Response(
                {'success': False, 'message': 'Error retrieving further education records', 'errors': ['Please try again later']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving further education record: {e}")
            return Response(
                {'success': False, 'message': 'Further education record not found', 'errors': ['The requested record does not exist']},
                status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                partial = kwargs.pop('partial', False)
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(
                    {'success': True, 'message': 'Further education record updated successfully', 'data': serializer.data},
                    status=status.HTTP_200_OK
                )
        except serializers.ValidationError as e:
            logger.error(f"Validation error updating further education: {e}")
            return Response(
                {'success': False, 'message': 'Validation error', 'errors': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            return Response(
                {'success': False, 'message': 'Database error occurred', 'errors': ['Integrity error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error updating further education: {e}")
            return Response(
                {'success': False, 'message': 'An unexpected error occurred', 'errors': ['Please try again later']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()
                self.perform_destroy(instance)
                return Response(
                    {'success': True, 'message': 'Further education record deleted successfully'},
                    status=status.HTTP_204_NO_CONTENT
                )
        except Exception as e:
            logger.error(f"Error deleting further education record: {e}")
            return Response(
                {'success': False, 'message': 'Error deleting further education record', 'errors': ['Please try again later']},
                status=status.HTTP_400_BAD_REQUEST
            )

#CRUD for College 
class CollegeViewSet(viewsets.ModelViewSet): 
    queryset = College.objects.all()
    serializer_class = CollegeSerializer

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                return Response({'success': True, 'message': 'College created', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating college: {e}")
            return Response({'success': False, 'message': 'Error creating college'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response({'success': True, 'data': serializer.data})
            serializer = self.get_serializer(queryset, many=True)
            return Response({'success': True, 'data': serializer.data})
        except Exception as e:
            logger.error(f"Error listing colleges: {e}")
            return Response({'success': False, 'message': 'Error retrieving college list'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({'success': True, 'data': serializer.data})
        except Exception as e:
            logger.error(f"Error retrieving college: {e}")
            return Response({'success': False, 'message': 'College not found'}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                partial = kwargs.pop('partial', False)
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response({'success': True, 'message': 'College updated', 'data': serializer.data})
        except Exception as e:
            logger.error(f"Error updating college: {e}")
            return Response({'success': False, 'message': 'Error updating college'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({'success': True, 'message': 'College deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting college: {e}")
            return Response({'success': False, 'message': 'Error deleting college'}, status=status.HTTP_400_BAD_REQUEST)
