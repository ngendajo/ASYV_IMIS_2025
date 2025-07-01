from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from django.http import JsonResponse,HttpResponse,Http404
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import *
from django.db.models import OuterRef, Subquery, IntegerField,Count, Case, When, IntegerField,Q,Prefetch, F
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
from datetime import datetime, date, timedelta
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _
import pandas as pd
from django.db import transaction
from rest_framework.decorators import action
from django.utils import timezone
from django.db import connection,DatabaseError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .filters import *
from .utils import *
import logging
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import traceback
from django.core.paginator import Paginator

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
        token['is_crc'] = self.user.is_crc
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
    
#Upload Marks -> Updates KidAcademics Table 
class MarksExcelUpload(APIView): 
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['file']
        
        if not excel_file.name.endswith('.xlsx'):
            return Response({'error': 'Please upload an Excel file'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(excel_file)
            required_columns = ['reg_number', 'S6', 'S5', 'S4', 'EY'] 
            # Normalize: remove spaces and lowercase for comparison
            normalized_required = {col.strip().lower().replace(" ", "") for col in required_columns}
            normalized_uploaded = {col.strip().lower().replace(" ", "") for col in df.columns}

            if not normalized_required.issubset(normalized_uploaded):
                missing = normalized_required - normalized_uploaded
                return Response(
                    {'error': f'Excel file is missing required columns: {", ".join(missing)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            success_count = 0
            not_found = []
            with transaction.atomic():
                for _, row in df.iterrows():
                    reg_number = str(row['reg_number']).strip()

                    try:
                        kid = Kid.objects.get(user__reg_number=reg_number)
                    except Kid.DoesNotExist:
                        not_found.append(f"Kid with Reg_number '{reg_number}' not found.")
                        continue
                
                    for level in ['S6', 'S5', 'S4', 'EY']:
                        marks = row.get(level)
                        if pd.isna(marks):
                            continue  # Skip if no marks

                        # Try to find an existing KidAcademics record
                        try:
                            academic = KidAcademics.objects.get(kid=kid, level=level)
                            academic.marks = marks
                            academic.save()
                            success_count += 1
                        except KidAcademics.DoesNotExist:
                           not_found.append(f"KidAcademics not found for {reg_number} - {level}")
        
        except Exception as e:
            return Response({
                'error': f'Error processing file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({   
            'message': f'Update complete. Updated: {success_count}, Missing: {len(not_found)}',
            'not_found': not_found
        })
        
#view alumni list
class AlumniListView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Kid.objects.filter(graduation_status="graduated").select_related(
            'user', 'family'
        )

        serializer = AlumniListSerializer(queryset, many=True)
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
            
            # Normalize: remove spaces and lowercase for comparison
            normalized_required = {col.strip().lower().replace(" ", "") for col in required_columns}
            normalized_uploaded = {col.strip().lower().replace(" ", "") for col in df.columns}

            if not normalized_required.issubset(normalized_uploaded):
                missing = normalized_required - normalized_uploaded
                return Response(
                    {'error': f'Excel file is missing required columns: {", ".join(missing)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_employments = []
            employment_leaps_data = []  # list of tuples (index, list_of_leap_objs)
            errors = []
            
            # Bulk fetch alumn by username
            alumn_reg_numbers = df['alumn_reg'].dropna().unique()
            # Bulk fetch recorders by username 
            recorder_reg_numbers = df['recorded_by'].dropna().unique()
            #creates dictionary for reg_number : user object 
            all_reg_numbers = set(alumn_reg_numbers) | set(recorder_reg_numbers)
            users_by_reg_number = {
                user.reg_number.strip(): user
                for user in User.objects.filter(reg_number__in=all_reg_numbers)
            }
            #print("dictionary of reg_number to users", users_by_reg_number)
            #get list of valid status options 
            valid_statuses = {choice[0] for choice in Employment.EMPLOYMENT_CHOICES}
            print("valid status = ", valid_statuses)
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
                #print("Row", row.get("status"))
                try:
                    #check alumn is a user 
                    alumn_reg = str(row['alumn_reg']).strip()
                    #print('alumn_reg is', alumn_reg)
                    if alumn_reg not in users_by_reg_number:
                        raise ValueError(f"User (alumn) with reg_number '{alumn_reg}' does not exist")
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
                    ep_raw = row.get('contributing_leaps', '')
                    if pd.isna(ep_raw):
                        leap_names = []
                    else:
                        leap_names = [x.strip() for x in ep_raw.split(',') if x.strip()] #leap names provided in data
                    existing_leaps_qs = Leap.objects.filter(ep__in=leap_names) #queryset of all leap objects that matches from data inputted
                    existing_leaps = set(existing_leaps_qs.values_list('ep', flat=True)) #set of existing eps 
                    missing_leaps = set(leap_names) - existing_leaps #eps not in leap model 
                    if missing_leaps:
                        return Response(
                            {'error': f'These ep names do not exist: {missing_leaps}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    #kid_leaps = KidLeap.objects.filter(kid=alumn_kid, leap__ep__in=leap_names)
                    if len(leap_names) > 0:
                        #print("entered leaps for ", alumn_reg , leap_names)
                        kid_leaps = KidLeap.objects.filter(kid=alumn_kid) 
                    
                        # for kl in kid_leaps: 
                        #     print("for kid", alumn_kid, alumn_reg, "leap is", kl.leap.ep)
                        #print("kidleap objects", kid_leaps)
                        valid_eps_for_kid = set(kid_leaps.values_list('leap_id', flat=True)) #list of leaps for kid
                        #print("valid leaps for kid", alumn_kid, ", ", valid_eps_for_kid)
                        invalid_leaps = [leap.ep for leap in existing_leaps_qs if leap.id not in valid_eps_for_kid]
                        if invalid_leaps:
                            raise ValueError(f" Kid {alumn_reg} has not participated in these LEAPs: {', '.join(invalid_leaps)}")
                        valid_leap_objs = existing_leaps_qs.filter(ep__in=valid_eps_for_kid)
                        
                    else:
                        valid_leap_objs = []
                    # Validate employment status
                    #print(row.get('status'))
                    status_val = str(row.get('status')).strip()
                    #print("status", status_val)
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
                    
                    employment_leaps_data.append((len(valid_employments) - 1, list(valid_leap_objs)))  # save index and leap objs
                    
                except Exception as e:
                    errors.append(f"Row {index + 2}: {str(e)}")
            
            if errors:
                return Response({
                    'message': 'Validation failed. No records were created.',
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                with transaction.atomic():
                    created_employments = Employment.objects.bulk_create(valid_employments)
                    for idx, leaps in employment_leaps_data:
                        created_employments[idx].contributing_leaps.set(leaps)
                
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

            # Normalize: remove spaces and lowercase for comparison
            normalized_required = {col.strip().lower().replace(" ", "") for col in required_columns}
            normalized_uploaded = {col.strip().lower().replace(" ", "") for col in df.columns}

            if not normalized_required.issubset(normalized_uploaded):
                missing = normalized_required - normalized_uploaded
                return Response(
                    {'error': f'Excel file is missing required columns: {", ".join(missing)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_colleges = []
            for _, row in df.iterrows():
                college = College(

                    college_name= str(row['college_name']).strip(),

                    country=str(row['country']).strip(),
                    city=str(row['city']).strip()
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
            
            # Normalize: remove spaces and lowercase for comparison
            normalized_required = {col.strip().lower().replace(" ", "") for col in required_columns}
            normalized_uploaded = {col.strip().lower().replace(" ", "") for col in df.columns}

            if not normalized_required.issubset(normalized_uploaded):
                missing = normalized_required - normalized_uploaded
                return Response(
                    {'error': f'Excel file is missing required columns: {", ".join(missing)}'},
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
                    alumn_reg = str(row['alumn_reg']).strip()
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

                    college_name = str(row['college_name']).strip()

                    try: 
                        college_obj = College.objects.get(college_name=college_name)
                    except College.DoesNotExist: 
                        raise ValueError(f"No College record found for college ' {college_name}'")

                    #validate level 

                    level_val = str(row['level']).strip() 

                    if level_val not in valid_level: 
                        raise ValueError(f"Level ' {level_val}' is invalid, Valid choices: {valid_level}") 
                    
                    #validate application result 
                    application_result_val = str(row['application_result']).strip()
                    if application_result_val not in valid_application_result: 
                        raise ValueError(f"Application Result ' {application_result_val}' is invalid, Valid choices: {valid_application_result}") 
                    
                    #validate scholarship 

                    scholarship_val = str(row['scholarship']).strip()

                    if scholarship_val not in valid_scholarship: 
                        raise ValueError(f"Scholarship ' {scholarship_val}' is invalid, Valid choices: {valid_scholarship}") 
                    
                    #validate status
                    status_val = str(row['status']).strip()
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

#Alumni outcomes view 
@api_view(['GET'])
def alumni_outcome_percentages(request):
    gender = request.query_params.get('gender')
    combination_abbreviation = request.query_params.get('combination') 
    graduation_year = request.query_params.get('year')

    alumni = Kid.objects.filter(graduation_status='graduated')
    if gender:
        alumni = alumni.filter(user__gender=gender)
    if combination_abbreviation:
        alumni = alumni.filter(
            kidacademics__combination__abbreviation=combination_abbreviation,
            kidacademics__level='S6'  # also filter level if needed
        ).distinct()
    if graduation_year: 
        alumni = alumni.filter(family__grade__graduation_year_to_asyv=graduation_year)

    # IDs of alumni in employment and further education
    employed_ids = set(
        Employment.objects.filter(alumn__in=alumni).values_list('alumn_id', flat=True)
    )
    furthered_ids = set(
        FurtherEducation.objects.filter(alumn__in=alumni).values_list('alumn_id', flat=True)
    )
    
    total_alumni = alumni.count()

    # Calculate categories
    employed_no_further = len([a for a in employed_ids if a not in furthered_ids])
    further_no_employ = len([a for a in furthered_ids if a not in employed_ids])
    both_employ_further = len(employed_ids.intersection(furthered_ids))
    neither = total_alumni - (employed_no_further + further_no_employ + both_employ_further)

    def percent(n):
        return round(n / total_alumni * 100, 2) if total_alumni > 0 else 0

    data = {
        'total_alumni': total_alumni,
        'employed_without_further_education_pct': percent(employed_no_further),
        'further_education_without_employment_pct': percent(further_no_employ),
        'both_employed_and_further_education_pct': percent(both_employ_further),
        'neither_employed_nor_further_education_pct': percent(neither),
    }

    return Response({'success': True, 'data': data})

#get_student_information

@api_view(['GET', 'PUT'])
def get_student_information(request, user_id):
    """
    GET: Extract comprehensive student information by user_id
    PUT: Update basic student profile info by user_id

    """
    try:
        with transaction.atomic():
            # Get the user
            try:
                user=User.objects.get(
                        Q(id=user_id) & (Q(is_student=True) | Q(is_alumni=True))
                    )
            except User.DoesNotExist:
                return Response(
                    {'error': f'Student with user_id {user_id} not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            


            try:
                kid = Kid.objects.select_related(
                    'family__grade', 'family__mother'
                ).get(user=user)
            except Kid.DoesNotExist:
                return Response(
                    {'error': f'Kid profile not found for user_id {user_id}'}, 
                    status=status.HTTP_404_NOT_FOUND

                    )
             # Get the kid profile
            if request.method == 'GET':
                # Basic Information
                basic_info = {
                    'user_id': user.id,
                    'kid_id': user.kid.id,
                    'first_name': user.first_name,
                    'rwandan_name': user.rwandan_name,
                    'middle_name': user.middle_name,
                    'gender': 'Female' if user.gender == 'F' else 'Male' if user.gender == 'M' else 'Not Specified',
                    'date_of_birth': user.dob,
                }
                
                # Place of Birth
                place_of_birth = {
                    'origin_district': kid.origin_district,
                    'origin_sector': kid.origin_sector,
                }
                
                # Current Address
                current_address = {
                    'current_district_or_city': kid.current_district_or_city,
                    'current_county': kid.current_county,
                }
                
                # Affiliation (Grade and Family)
                affiliation = {}
                try:
                    if kid.family:
                        affiliation = {
                            'family_name': kid.family.family_name,
                            'family_number': kid.family.family_number,
                            'mother_name': kid.family.mother.get_full_name() if kid.family.mother else None,
                            'grade_info': {
                                'grade_name': kid.family.grade.grade_name if kid.family.grade else None,
                                'admission_year': kid.family.grade.admission_year_to_asyv if kid.family.grade else None,
                                'graduation_year': kid.family.grade.graduation_year_to_asyv if kid.family.grade else None,
                            } if kid.family.grade else {}
                        }
                    else:
                        affiliation = {'message': 'No family affiliation found'}
                except Exception as e:
                    logger.error(f"Error retrieving affiliation for user_id {user_id}: {str(e)}")
                    affiliation = {'error': 'Error retrieving affiliation information'}
                
                # Academic Combinations
                combinations = []
                try:
                    kid_academics = KidAcademics.objects.select_related('combination').filter(kid=kid)
                    for academic in kid_academics:
                        combinations.append({
                            'academic_year': academic.academic_year,
                            'level': academic.level,
                            'combination_name': academic.combination.combination_name,
                            'combination_abbreviation': academic.combination.abbreviation,
                            'marks': academic.marks,
                        })
                except Exception as e:
                    logger.error(f"Error retrieving combinations for user_id {user_id}: {str(e)}")
                    combinations = [{'error': 'Error retrieving academic combinations'}]
                
                # LEAP Activities
                leap_activities = []
                try:
                    kid_leaps = KidLeap.objects.select_related('leap').filter(kid=kid)
                    for kid_leap in kid_leaps:
                        leap_activities.append({
                            'leap_name': kid_leap.leap.ep,
                            'category': kid_leap.leap.leap_category,
                            'is_approved': kid_leap.is_approved,
                            'approved_at': kid_leap.approved_at.isoformat() if kid_leap.approved_at else None,
                            'recorded_by': kid_leap.recorded_by.get_full_name() if kid_leap.recorded_by else None,
                            'created_at': kid_leap.created_at.isoformat(),
                        })
                except Exception as e:
                    logger.error(f"Error retrieving LEAP activities for user_id {user_id}: {str(e)}")
                    leap_activities = [{'error': 'Error retrieving LEAP activities'}]
                
                # National Exam Results
                national_exam = {}
                try:
                    national_exam = {
                        'points_achieved': float(kid.points_in_national_exam) if kid.points_in_national_exam else None,
                        'maximum_points': float(kid.maximum_points_in_national_exam) if kid.maximum_points_in_national_exam else None,
                        'percentage': round((float(kid.points_in_national_exam) / float(kid.maximum_points_in_national_exam)) * 100, 2) if (kid.points_in_national_exam and kid.maximum_points_in_national_exam) else None,
                        'mention': kid.mention,
                    }
                except Exception as e:
                    logger.error(f"Error processing national exam results for user_id {user_id}: {str(e)}")
                    national_exam = {'error': 'Error retrieving national exam information'}
                
                # Personal Status
                personal_status = {
                    'marital_status': kid.marital_status,
                    'has_children': kid.has_children,
                    'life_status': kid.life_status,
                    'graduation_status': kid.graduation_status,
                    'health_issue': kid.health_issue,
                }
                
                # Compile all information
                student_info = {
                    'basic_information': basic_info,
                    'place_of_birth': place_of_birth,
                    'current_address': current_address,
                    'affiliation': affiliation,
                    'academic_combinations': combinations,
                    'leap_activities': leap_activities,
                    'national_exam_results': national_exam,
                    'personal_status': personal_status,
                    'retrieved_at': timezone.now().isoformat(),
                }
                
                return Response(student_info, status=status.HTTP_200_OK)
            
            elif request.method == 'PUT':
                serializer = StudentProfileSerializer(data=request.data)
                if serializer.is_valid():
                    print("serializer is valid")
                    try:
                        serializer.update({'user': user, 'kid': kid}, serializer.validated_data)
                        return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)
                    except Exception as e:
                        print("Serializer errors:", serializer.errors)
                        logger.error(f"Error updating student profile for user_id {user_id}: {str(e)}")
                        return Response({'error': 'Error updating profile', 'details': str(e)},
                                        status=status.HTTP_400_BAD_REQUEST)
                print("serializaer not valid")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            
    except Exception as e:
        logger.error(f"Unexpected error retrieving student information for user_id {user_id}: {str(e)}")
        return Response(
            {
                'error': 'An unexpected error occurred while retrieving student information',
                'details': str(e)
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR

        )
    
class CurrentInfoUpdateView(APIView):
    #permission_classes = [permissions.IsAuthenticated]

    def put(self, request, kid_id):
        # Retrieve the Kid instance
        try:
            kid = Kid.objects.get(id=kid_id)
        except Kid.DoesNotExist:
            return Response({"detail": "Kid not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CurrentInfoSerializer(kid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Map Visualization Alumni Outcomes Further Education 
class AlumniCountryMap(APIView): 
    def get(self, request):
        in_further_education = FurtherEducation.objects.filter(enrolled=True) 
        country_counts = in_further_education.values('college__country').annotate(count=Count('id'))

        result = []
        for row in country_counts:
            country = row['college__country']
            coords = COUNTRY_COORDS.get(country)
            if coords:
                result.append({
                    "country": country,
                    "count": row["count"],
                    "lat": coords["lat"],
                    "lon": coords["lon"],
                })
        return Response(result)

#alumni-employment in profile 
class AlumniEmploymentView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('id')
        if not user_id:
            return Response({'error': 'Missing user ID'}, status=400)

        try:
            # Get the graduated Kid linked to this User
            print(user_id)
            kid = Kid.objects.get(user__id=user_id, graduation_status = "graduated")
        except Kid.DoesNotExist:
            return Response({'error': 'Graduated Kid not found for this user'}, status=404)

        employments = Employment.objects.filter(alumn=kid)
        serializer = EmploymentSerializer(employments, many=True)
        return Response(serializer.data)
    
    #UPDATE employment info on profile
    def put(self, request):
        user_id = request.query_params.get('id')
        if not user_id:
            return Response({'error': 'Missing user ID'}, status=400)

        try:
            kid = Kid.objects.get(user__id=user_id, graduation_status="graduated")
        except Kid.DoesNotExist:
            return Response({'error': 'Graduated Kid not found for this user'}, status=404)

        updated_employments = request.data.get('employment', [])
        existing_employments = {e.id: e for e in Employment.objects.filter(alumn=kid)}

        updated_ids = []

        for emp_data in updated_employments:
            emp_id = emp_data.get('id')

            if emp_id and emp_id in existing_employments:
                # Update existing
                emp = existing_employments[emp_id]
                emp_data['alumn'] = kid.id
                #print("alumn:", emp.alumn, "id?", emp_data['alumn'])
                serializer = EmploymentSerializer(emp, data=emp_data)
                if serializer.is_valid():
                    serializer.save()
                    updated_ids.append(emp_id)
    
                else:
                    print("Serializer errors:", serializer.errors)
                    return Response(serializer.errors, status=400)
            else:
                # Create new
                emp_data['alumn'] = kid.id  # link it to the Kid
                serializer = EmploymentSerializer(data=emp_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=400)
        
        return Response({'message': 'Employment record created/updated', 'updated_ids': updated_ids}, status=200)
    
class AlumniAcademicView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('id')
        if not user_id:
            return Response({'error': 'Missing user ID'}, status=400)

        try:
            # Get the graduated Kid linked to this User
            print(user_id)
            kid = Kid.objects.get(user__id=user_id, graduation_status = "graduated")
        except Kid.DoesNotExist:
            return Response({'error': 'No graduated kid found for this user'}, status=404)

        academics = FurtherEducation.objects.filter(alumn=kid, status__in = ['O', 'G'])
        serializer = FurtherEducationSerializer(academics, many=True)
        return Response(serializer.data)
    
    #UPDATE academic info on profile
    def put(self, request):
        user_id = request.query_params.get('id')
        if not user_id:
            return Response({'error': 'Missing user ID'}, status=400)

        try:
            kid = Kid.objects.get(user__id=user_id, graduation_status="graduated")
        except Kid.DoesNotExist:
            return Response({'error': 'Graduated Kid not found for this user'}, status=404)

        updated_academics = request.data.get('academic', [])
        existing_academics = {a.id: a for a in FurtherEducation.objects.filter(alumn=kid)}

        updated_ids = []

        for aca_data in updated_academics:
            aca_id = aca_data.get('id')

            if aca_id and aca_id in existing_academics:
                # Update existing
                aca = existing_academics[aca_id]
                aca_data['alumn'] = kid.id
                #print("alumn:", emp.alumn, "id?", emp_data['alumn'])
                serializer = FurtherEducationSerializer(aca, data=aca_data)
                if serializer.is_valid():
                    serializer.save()
                    updated_ids.append(aca_id)
    
                else:
                    print("Serializer errors:", serializer.errors)
                    return Response(serializer.errors, status=400)
            else:
                # Create new
                aca_data['alumn'] = kid.id  # link it to the Kid
                serializer = FurtherEducationSerializer(data=aca_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=400)
        
        return Response({'message': 'FurtherEducation record created/updated', 'updated_ids': updated_ids}, status=200)

#alumni directory api
class AlumniDirectoryView(APIView):
    def get_all_filter_options(self):
        genders_available = User.objects.values_list('gender', flat=True).distinct()
        graduation_years_available = Grade.objects.values(
            'graduation_year_to_asyv', 'grade_name'
        ).distinct().order_by('-graduation_year_to_asyv')
        families_available = Family.objects.values(
            'id', 'family_name'
        ).distinct().order_by('family_name')
        combinations_available = KidAcademics.objects.filter(
            level='S6'
        ).values(
            'combination_id', 'combination__abbreviation', 'combination__combination_name'
        ).distinct()
        industries_available = Employment.objects.values_list('industry', flat=True).distinct().order_by('industry')
        colleges_available = FurtherEducation.objects.values(
            'college__college_name'
        ).distinct().order_by('college__college_name')

        return {
            'gender': list(genders_available),
            'graduation_year': list(graduation_years_available),
            'family': list(families_available),
            'combination': list(combinations_available),
            'industry': list(industries_available),
            'college': list(colleges_available),
        }
    
    def get(self, request):
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))

        gender = request.GET.get('gender')
        family = request.GET.get('family')
        combination = request.GET.get('combination')
        industry = request.GET.get('industry')
        graduation_year = request.GET.get('year')
        search_term = self.request.query_params.get('search')
        college = request.GET.get('college') 

        alumni = Kid.objects.filter(graduation_status='graduated'
                                    ).select_related('user', 'family__grade'
                                                     ).prefetch_related('employment', 'furthereducation')

        if gender:
            alumni = alumni.filter(user__gender=gender) #M or F
        if family:
            alumni = alumni.filter(family__id=family) #by family Id
        if combination:
            alumni = alumni.filter(
                academics__combination__id=combination,
                academics__level='S6'
            ) #by combination id
        if industry:
            alumni = alumni.filter(employment__industry=industry) #by string industry
        if graduation_year: #by year 
            print("graduation_year param:", graduation_year)
            alumni = alumni.filter(family__grade__graduation_year_to_asyv=graduation_year)
        if search_term:
            alumni = alumni.filter(
                Q(user__first_name__icontains=search_term) |
                Q(user__rwandan_name__icontains=search_term)
            ).distinct()
        if college: 
            alumni = alumni.filter(furthereducation__college__college_name=college,
                                   furthereducation__status__in=['G', 'O'])

        alumni = alumni.distinct()
        print("Filtered alumni count:", alumni.count())

        #employment_count = alumni.filter(employ__isnull=False).distinct().count()
        #education_count = alumni.filter(alumn__isnull=False).distinct().count()

        employed_ids = set(
            Employment.objects.filter(alumn__in=alumni).values_list('alumn_id', flat=True)
        )
        furthered_ids = set(
            FurtherEducation.objects.filter(alumn__in=alumni).values_list('alumn_id', flat=True)
        )

        total_alumni = alumni.count()
        employed_no_further = len([a for a in employed_ids if a not in furthered_ids])
        further_no_employ = len([a for a in furthered_ids if a not in employed_ids])
        both_employ_further = len(employed_ids.intersection(furthered_ids))
        neither = total_alumni - (employed_no_further + further_no_employ + both_employ_further)

        def percent(n):
            return round(n / total_alumni * 100, 2) if total_alumni > 0 else 0

        outcome_data = {
            'total_alumni': total_alumni,
            'employed_without_further_education_pct': percent(employed_no_further),
            'further_education_without_employment_pct': percent(further_no_employ),
            'both_employed_and_further_education_pct': percent(both_employ_further),
            'neither_employed_nor_further_education_pct': percent(neither),
        }

          # Return filter options
        filters = self.get_all_filter_options()
      
        paginator = Paginator(alumni, page_size)
        page_obj = paginator.get_page(page)
        alumni_page = page_obj.object_list

        # Serialize alumni list
        serialized_alumni = AlumniListSerializer(alumni_page, many=True).data

        return Response({
        "success": True,
        "filters": filters,
        "data": serialized_alumni,
        "outcome_summary": outcome_data,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total": paginator.count,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        }
    })

class EmploymentBulkCreateUpdateView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            serializer = EmploymentSerializer(data=request.data, many=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, *args, **kwargs):
        try:
            employment_list = request.data
            for employment_data in employment_list:
                employment_instance = Employment.objects.get(id=employment_data['id'])
                serializer = EmploymentSerializer(employment_instance, data=employment_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": "Bulk update successful"}, status=status.HTTP_200_OK)
        except Employment.DoesNotExist as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
from django.db.models import Count

class AlumniYearsView(APIView):
    def get(self, request):
        years = Grade.objects.order_by('graduation_year_to_asyv').values_list('graduation_year_to_asyv', flat=True).distinct()
        return Response({'years': list(years)})

class AlumniOutcomeTrends(APIView):
    def get(self, request):
        year = request.query_params.getlist('year')
        gender = request.query_params.get('gender')

        alumni_qs = Kid.objects.filter(graduation_status='graduated').select_related('family__grade')

        if year:
            alumni_qs = alumni_qs.filter(family__grade__graduation_year_to_asyv__in=year)
        if gender:
            alumni_qs = alumni_qs.filter(user__gender=gender)

        filtered_alumni_ids = set(alumni_qs.values_list('id', flat=True))

        employments_qs = Employment.objects.filter(
            alumn_id__in=filtered_alumni_ids
        ).select_related('alumn__family__grade')

        further_edu_ids = set(
            FurtherEducation.objects.filter(
                status__in=['O', 'G'],
                alumn_id__in=filtered_alumni_ids
            ).values_list('alumn_id', flat=True)
        )

        employed_ids = set(employments_qs.values_list('alumn_id', flat=True))

        college_attendance_qs = (
            FurtherEducation.objects
            .filter(status__in=['O', 'G'], alumn_id__in=filtered_alumni_ids)
            .values(
                'college__college_name',
                'college__country',
                'alumn__family__grade__graduation_year_to_asyv'  # graduation year
            )
            .annotate(attendance_count=Count('college'))
            .order_by('alumn__family__grade__graduation_year_to_asyv', '-attendance_count')
        )

        # Map colleges per year
        colleges_by_year = {}
        
        for item in college_attendance_qs:
            yr = item['alumn__family__grade__graduation_year_to_asyv']
            country = item['college__country'] or 'Unknown'

            if yr not in colleges_by_year:
                colleges_by_year[yr] = {}

            if country not in colleges_by_year[yr]:
                colleges_by_year[yr][country] = []

            colleges_by_year[yr][country].append({
                'college': item['college__college_name'],
                'attendance_count': item['attendance_count'],
            })
            
        status_keys = [key for key, _ in Employment.EMPLOYMENT_CHOICES]
        status_map = dict(Employment.EMPLOYMENT_CHOICES)
        industry_map = dict(Employment.INDUSTRY_CHOICES)

        grad_years = alumni_qs.values_list('family__grade__graduation_year_to_asyv', flat=True).distinct()

        results = {}
        for yr in grad_years:
            results[yr] = {
                'total': 0,
                'employment_only': 0,
                'further_edu_only': 0,
                'both': 0,
                'neither': 0,
                'employment_status_counts': {key: 0 for key in status_keys},
                'industry_counts': {key: 0 for key in industry_map.keys()},
                'most_attended_colleges': colleges_by_year.get(yr, {})
            }

        for emp in employments_qs:
            grad_year = emp.alumn.family.grade.graduation_year_to_asyv
            results[grad_year]['employment_status_counts'][emp.status] += 1
            results[grad_year]['industry_counts'][emp.industry] += 1

        for alumn in alumni_qs:
            grad_year = alumn.family.grade.graduation_year_to_asyv
            results[grad_year]['total'] += 1

            has_employment = alumn.id in employed_ids
            has_further_edu = alumn.id in further_edu_ids

            if has_employment and has_further_edu:
                results[grad_year]['both'] += 1
            elif has_employment:
                results[grad_year]['employment_only'] += 1
            elif has_further_edu:
                results[grad_year]['further_edu_only'] += 1
            else:
                results[grad_year]['neither'] += 1

        data = []
        selected_years = list(map(int, year)) if year else sorted(results.keys())


        for yr in selected_years:
            year_data = results[yr]
            total = year_data['total']
            if total == 0:
                continue

            employment_status_readable = {}
            for key, count in year_data['employment_status_counts'].items():
                label = status_map.get(key, key)
                pct = round(count / total * 100, 2) if total > 0 else 0
                employment_status_readable[label] = {'count': count, 'percent': pct}

            industry_readable = {}
            for key, count in year_data['industry_counts'].items():
                label = industry_map.get(key, key)
                pct = round(count / total * 100, 2) if total > 0 else 0
                industry_readable[label] = {'count': count, 'percent': pct}

            data.append({
                'graduation_year': yr,
                'total_alumni': total,
                'employment_only': year_data['employment_only'],
                'employment_only_percent': round(year_data['employment_only'] / total * 100, 2),
                'further_edu_only': year_data['further_edu_only'],
                'further_edu_only_percent': round(year_data['further_edu_only'] / total * 100, 2),
                'both': year_data['both'],
                'both_percent': round(year_data['both'] / total * 100, 2),
                'neither': year_data['neither'],
                'neither_percent': round(year_data['neither'] / total * 100, 2),
                'employment_status_distribution': employment_status_readable,
                'industry_distribution': industry_readable,
                'most_attended_colleges': year_data['most_attended_colleges'],
            })

            # === OVERALL STATS (filtered by selected year if provided) ===
            filtered_results = {yr: results[yr] for yr in selected_years}

            overall_total = sum(year['total'] for year in filtered_results.values())
            overall_employment = sum(
                year['employment_only'] + year['both'] for year in filtered_results.values()
            )
            overall_further_edu = sum(
                year['further_edu_only'] + year['both'] for year in filtered_results.values()
            )

            overall_summary = {
                'total_alumni': overall_total,
                'employment_total': overall_employment,
                'employment_percent': round(overall_employment / overall_total * 100, 2) if overall_total else 0,
                'further_education_total': overall_further_edu,
                'further_education_percent': round(overall_further_edu / overall_total * 100, 2) if overall_total else 0,
            }

        # Return per-year data + overall most attended colleges
        return Response({
            'yearly_outcomes': data,
            'overall_summary': overall_summary,
        })


class DropdownOptionsAPIView(APIView):
    #permission_classes = [IsAuthenticated]  # Optional: remove if public

    def get(self, request):
        industry_list = [
            "Agriculture, Forestry, and Fishing",
            "Art, Design, and Performance",
            "Beauty and Personal Care",
            "Business and Management",
            "Construction and Engineering",
            "Dining and Hospitality Services",
            "Education and Training",
            "Energy and Utilities",
            "Finance and Banking",
            "Government and Public Service",
            "Healthcare and Medical Services",
            "Information Technology and Software Development",
            "Legal Services",
            "Logistics and Transportation",
            "Manufacturing and Production",
            "Marketing, Sales, and Customer Service",
            "Media and Communication",
            "Real Estate and Property Management",
            "Research and Development",
            "Security and Law Enforcement",
            "Social Work and Community Services",
            "Sports and Recreation",
            "Telecommunications",
            "Trade and Skilled Labor",
            "Others / Not Specified"
        ]
        colleges = College.objects.all().order_by('college_name')
        data = {
            "marital_statuses": [
                {"value": "single", "label": "Single"},
                {"value": "married", "label": "Married"},
                {"value": "divorced", "label": "Divorced"},
                {"value": "widowed", "label": "Widowed"},
            ],
            "children_options": [
                {"value": True, "label": "Yes"},
                {"value": False, "label": "No"},
            ],
            "levels": [
                {"value": "C", "label": "Certificate"},
                {"value": "A1", "label": "Advanced Diploma"},
                {"value": "A0", "label": "Bachelor"},
                {"value": "M", "label": "Master"},
                {"value": "PHD", "label": "Ph.D."},
            ],
            "colleges": [{"value": c.id, "label": c.college_name, "location": c.locationString()} for c in colleges],
            "industries": [{"value": name, "label": name} for name in industry_list],
            "status": [
                {"value" : "D", "label": "Dropped_Out"},
                {"value" : "S", "label": "Suspended"},
                {"value" : "O", "label": "On_going"}, 
                {"value" : "G", "label": "Graduated"},
                {"value" : "N", "label": "NA"},
            ], 
            "employment_status" : [
                {"value": "F", "label": "Full-time"}, 
                {"value": "P", "label": "Part-time"}, 
                {"value": "S", "label": "Self-employed"}, 
                {"value": "I", "label": "Intern"}, 
            ], 
            "scholarship" : [
                {"value": "F", "label": "Full"}, 
                {"value": "P", "label": "Partial"}, 
                {"value": "S", "label": "Self-sponsor"}, 
            ]
        }
        return Response(data)


@api_view(['GET'])
def get_mamas(request):
       
    # Basic Information
    mamas = User.objects.filter(is_mama=True, is_active=True)
    mama_info =UserSerializer(mamas, many=True)

    return Response(mama_info.data, status=status.HTTP_200_OK)

        


#Library Management System

# Author data view

class AuthorRegistrationView(APIView):
    permission_classes = [IsAuthenticated, ]

    def post(self, request):
        data = request.data.copy()
        data.pop('id', None)  # Remove 'id' if it's present

        # Check for duplicates by fields you consider unique (e.g., 'name')
        if Author.objects.filter(author_name=data.get('author_name')).exists():
            raise serializers.ValidationError('This author already exists')

        serializer = AuthorSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        try:
            # checking for the parameters from the URL
            if request.query_params:
                autho = Author.objects.filter(**request.query_params.dict())
            else:
                autho = Author.objects.all()

            # if there is something in items else raise error
            if autho:
                serializer = AuthorSerializer(autho, many=True)
                return Response(serializer.data)
            else:
                return Response([])
            
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_Author(request, pk):
    autho = Author.objects.get(pk=pk)
    data = AuthorSerializer(instance=autho, data=request.data)

    if data.is_valid():
        data.save()
        return Response(data.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_author(request, pk):
    autho = get_object_or_404(Author, pk=pk)
    autho.delete()
    return Response(status=status.HTTP_202_ACCEPTED)


# end

# Category data view

class CategoryRegistrationView(APIView):
    #permission_classes = [IsAuthenticated, ]

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        # validating for already existing data
        if Category.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        try:
            # checking for the parameters from the URL
            if request.query_params:
                cat = Category.objects.filter(**request.query_params.dict())
            else:
                cat = Category.objects.all()

            # if there is something in items else raise error
            if cat:
                serializer = CategorySerializer(cat, many=True)
                return Response(serializer.data)
            else:
                return Response([])
            
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def update_Category(request, pk):
    cat = Category.objects.get(pk=pk)
    data = CategorySerializer(instance=cat, data=request.data)

    if data.is_valid():
        data.save()
        return Response(data.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
#@permission_classes([IsAuthenticated])
def delete_category(request, pk):
    cat = get_object_or_404(Category, pk=pk)
    cat.delete()
    return Response(status=status.HTTP_202_ACCEPTED)


# end

# Book data view

class BookRegistrationView(APIView):
    permission_classes = [IsAuthenticated, ]

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        # validating for already existing data
        if Book.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        try:
            # checking for the parameters from the URL
            if request.query_params:
                book = Book.objects.filter(**request.query_params.dict())
            else:
                book = Book.objects.all()

            # if there is something in items else raise error
            if book:
                serializer = DisplayBookSerializer(book, many=True)
                return Response(serializer.data)
            else:
                return Response([])
            
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_Book(request, pk):
    book = Book.objects.get(pk=pk)
    data = BookSerializer(instance=book, data=request.data)

    if data.is_valid():
        data.save()
        return Response(data.data)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_book(request, pk):
    book = get_object_or_404(Book, pk=pk)
    book.delete()
    return Response(status=status.HTTP_202_ACCEPTED)


# end

# Issue_Book data view
class Issue_BookRegistrationView(APIView):
    #permission_classes = [IsAuthenticated, ]
    #pagination_class = CustomPagination  # Use custom pagination class

    def post(self, request):
        serializer = Issue_BookSerializer(data=request.data)
        # validating for already existing data
        if Issue_Book.objects.filter(**request.data).exists():
            raise serializers.ValidationError('This data already exists')

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_Issue_Book(request, pk):
    try:
        issue = Issue_Book.objects.get(pk=pk)
    except Issue_Book.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    data = {'returndate': request.data.get('returndate')}
    serializer = Issue_BookSerializer(instance=issue, data=data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_Issue_Book(request, pk):
    issue = get_object_or_404(Issue_Book, pk=pk)
    issue.delete()
    return Response(status=status.HTTP_202_ACCEPTED)

# end

#report data from library database 
class IssuedBookDisplayAPIView(APIView):
    permission_classes = [IsAuthenticated, ]  # You can add authentication if needed

    def get(self, request, *args, **kwargs):
        try:
            # Get data
            sql_query1 = """
                SELECT 
                    g.grade_name, 
                    u.reg_number AS studentid, 
                    f.family_name, 
                    c.combination_name, 
                    u.first_name, 
                    u.rwandan_name AS last_name, 
                    u.email, 
                    b.book_name, 
                    b.isbnumber, 
                    cat.category_name, 
                    a.author_name, 
                    ib.library_number, 
                    ib.issuedate, 
                    ib.returndate, 
                    ib.id AS id
                FROM 
                    api_user u
                INNER JOIN 
                    api_kid k ON u.id = k.user_id
                INNER JOIN 
                    api_family f ON k.family_id = f.id
                INNER JOIN 
                    api_grade g ON f.grade_id = g.id
                INNER JOIN 
                    api_kidacademics ka ON k.id = ka.kid_id
                INNER JOIN 
                    api_combination c ON ka.combination_id = c.id
                INNER JOIN 
                    api_issue_book ib ON ib.borrower_id = u.id
                INNER JOIN 
                    api_book b ON ib.book_id = b.id
                INNER JOIN 
                    api_category cat ON b.category_id = cat.id
                INNER JOIN 
                    api_author a ON b.author_id = a.id
                WHERE 
                    ib.returndate = 'Not yet Returned' 
                    AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
                ORDER BY 
                    ib.issuedate DESC;

            """

            # Execute the SQL query
            with connection.cursor() as cursor:
                cursor.execute(sql_query1)
                data1 = cursor.fetchall()

            data = []
            if data1 is not None:
                for i in data1:
                    data.append({
                        'grade_name': i[0],
                        'studentid': i[1],
                        'family_name': i[2],
                        'combination_name': i[3],
                        'first_name': i[4],
                        'last_name': i[5],
                        'email': i[6],
                        'book_name': i[7],
                        'isbnumber': i[8],
                        'category_name': i[9],
                        'author_name': i[10],
                        'library_number': i[11],
                        'issuedate': i[12],
                        'returndate': i[13],
                        'id': i[14]
                    })

            serializer = IssuedBookDisplaySerializer(data=data, many=True)
            serializer.is_valid()  # Validate serializer data
            return Response(serializer.data)

        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
        
class StudentListDisplayAPIView(APIView):
    permission_classes = [IsAuthenticated, ]  # You can add authentication if needed

    def get(self, request, *args, **kwargs):
        try:
            # Get data
            sql_query1 = """
                SELECT 
                    g.grade_name,
                    u.reg_number AS studentid,
                    f.family_name,
                    c.combination_name,
                    u.first_name,
                    u.rwandan_name AS last_name,
                    u.email,
                    k.id AS id,
                    g.id AS grade_id,
                    c.id AS combination_id,
                    g.graduation_year_to_asyv AS eay,
                    u.gender
                FROM 
                    api_user u
                INNER JOIN 
                    api_kid k ON u.id = k.user_id
                INNER JOIN 
                    api_family f ON k.family_id = f.id
                INNER JOIN 
                    api_grade g ON f.grade_id = g.id
                INNER JOIN 
                    api_kidacademics ka ON k.id = ka.kid_id
                INNER JOIN 
                    api_combination c ON ka.combination_id = c.id
                WHERE 
                    u.is_student = TRUE
                    AND u.is_alumni = FALSE
                    AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE);

            """

            # Execute the SQL query
            with connection.cursor() as cursor:
                cursor.execute(sql_query1)
                data1 = cursor.fetchall()

            data = []
            if data1 is not None:
                for i in data1:
                    data.append({
                        'grade_name': i[0],
                        'studentid': i[1],
                        'family_name': i[2],
                        'combination_name': i[3],
                        'first_name': i[4],
                        'last_name': i[5],
                        'email': i[6],
                        'id': i[7],
                        'grade_id': i[8],
                        'combination_id': i[9],
                        'eay': i[10],
                        'gender': i[11]
                    })

            serializer = StudentListDisplaySerializer(data=data, many=True)
            serializer.is_valid()  # Validate serializer data
            return Response(serializer.data)

        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
class BookListDisplayAPIView(APIView):
    permission_classes = [IsAuthenticated, ]  # You can add authentication if needed

    def get(self, request, *args, **kwargs):
        try:
            # Get data
            sql_query1 = """
                SELECT book_name, isbnumber, category_name, author_name, number_of_books, 
                       api_book.id AS id  FROM  api_book 
                INNER JOIN api_category ON api_book.category_id = api_category.id 
                INNER JOIN api_author ON api_book.author_id = api_author.id  
                order by book_name asc;
            """

            # Execute the SQL query
            with connection.cursor() as cursor:
                cursor.execute(sql_query1)
                data1 = cursor.fetchall()

            data = []
            if data1 is not None:
                for i in data1:
                    data.append({
                        'book_name': i[0],
                        'isbnumber': i[1],
                        'category_name': i[2],
                        'author_name': i[3],
                        'number_of_books': i[4],
                        'id': i[5]
                    })

            serializer = BookListDisplaySerializer(data=data, many=True)
            serializer.is_valid()  # Validate serializer data
            return Response(serializer.data)

        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
        


        
#Library report
class BookReportExportAPIView(APIView):
    permission_classes = [IsAuthenticated, ]
    def get_data_from_database(self):
        sql_query = """
            select
                ROW_NUMBER() OVER (ORDER BY category_name ASC) AS "Number",
                api_book.book_name,
                api_book.isbnumber,
                api_category.category_name,
                api_author.author_name,
                api_book.number_of_books::int, 
                COUNT(api_issue_book.id) AS issued_books,
                (api_book.number_of_books::int - COUNT(api_issue_book.id)) AS current_books
            FROM
                api_book
            INNER JOIN
                api_category ON api_book.category_id = api_category.id
            INNER JOIN
                api_author ON api_book.author_id = api_author.id
            LEFT JOIN
                api_issue_book ON api_issue_book.book_id = api_book.id AND api_issue_book.returndate = 'Not yet Returned'
            GROUP BY
                api_book.book_name,
                api_book.isbnumber,
                api_category.category_name,
                api_author.author_name,
                api_book.number_of_books::int -- Casting to integer
            ORDER BY
                category_name ASC;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            data = cursor.fetchall()

        # Calculate totals
        total_books = sum(row[5] for row in data)
        total_issued = sum(row[6] for row in data)
        total_current = sum(row[7] for row in data)

        # Append totals as a new row
        total_row = ["", "Total", "", "", "", total_books, total_issued, total_current]
        data.append(total_row)

        return data

    def generate_pdf(self, data):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="list_of_books.pdf"'
        doc = SimpleDocTemplate(response, pagesize=landscape(letter))
        elements = []

        # Add title
        styles = getSampleStyleSheet()
        title_style = styles['Title']
        title_paragraph = Paragraph("LFHS@ASYV Library List of Books", title_style)
        elements.append(title_paragraph)

        # Add data table
        table_style = TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                                ('GRID', (0, 0), (-1, -1), 1, colors.black)])
        
        table_data = [['#','Book Name', 'ISBN Number', 'Category', 'Author', 'Number of Books', 'Issued Books','current_books']]
        table_data.extend(data)

        # Calculate maximum column widths based on available page width
        available_width = doc.width
        num_cols = len(table_data[0])
        max_col_width = available_width / num_cols

        # Add table content with wrapped paragraphs
        wrapped_table_data = []
        for row in table_data:
            wrapped_row = []
            for cell in row:
                cell_style = ParagraphStyle(name='WrapStyle', wordWrap='LTR')
                wrapped_cell = Paragraph(str(cell), cell_style)
                wrapped_row.append(wrapped_cell)
            wrapped_table_data.append(wrapped_row)

        table = Table(wrapped_table_data)
        table.setStyle(table_style)

        elements.append(table)
        doc.build(elements)
        return response

    def get(self, request, *args, **kwargs):
        try:
            data = self.get_data_from_database()
            if data:
                return self.generate_pdf(data)
            else:
                return Response({'error': 'No data found.'}, status=404)
        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)

class Issued_BookReportExportAPIView(APIView):
    permission_classes = [IsAuthenticated, ]
    def get_data_from_database(self):
        sql_query = """
            SELECT 
                g.grade_name,
                f.family_name,
                c.combination_name,
                u.reg_number AS studentid,
                u.rwandan_name AS last_name,
                u.first_name,
                b.book_name,
                b.isbnumber,
                cat.category_name,
                a.author_name,
                ib.issuedate,
                ib.returndate 
            FROM 
                api_grade g
            INNER JOIN 
                api_family f ON g.id = f.grade_id 
            INNER JOIN 
                api_kid k ON f.id = k.family_id 
            INNER JOIN 
                api_user u ON k.user_id = u.id 
            INNER JOIN 
                api_kidacademics ka ON k.id = ka.kid_id
            INNER JOIN 
                api_combination c ON ka.combination_id = c.id 
            INNER JOIN 
                api_issue_book ib ON ib.borrower_id = u.id 
            INNER JOIN 
                api_book b ON ib.book_id = b.id 
            INNER JOIN 
                api_category cat ON b.category_id = cat.id 
            INNER JOIN 
                api_author a ON b.author_id = a.id 
            WHERE 
                ib.returndate = 'Not yet Returned'
                AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
            ORDER BY 
                g.grade_name ASC, 
                f.family_name ASC;

        """
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            data = cursor.fetchall()

        return data

    def generate_pdf(self, data):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="list_of_Issued_books.pdf"'
        doc = SimpleDocTemplate(response, pagesize=landscape(letter))
        elements = []

        # Define a base style for titles
        base_title_style = getSampleStyleSheet()['Title']

        # Define different title styles with different font sizes
        title_style_small = ParagraphStyle(
            'TitleSmall',
            parent=base_title_style,
            fontSize=12  # Set the font size to 12
        )

        title_style_medium = ParagraphStyle(
            'TitleMedium',
            parent=base_title_style,
            fontSize=14  # Set the font size to 18
        )
        title_paragraph = Paragraph("LFHS@ASYV Library List of Issued Books", base_title_style)
        elements.append(title_paragraph)
        table_style = TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                                  ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                  ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                                  ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                  ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                                  ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                                  ('GRID', (0, 0), (-1, -1), 1, colors.black)])

        # Group data by grade_name
        grouped_data = {}
        for row in data:
            grade_name = row[0]  # Assuming grade_name is in the first position of each tuple
            family_name = row[1]  # Assuming family_name is in the second position of each tuple
            if grade_name not in grouped_data:
                grouped_data[grade_name] = {}
            if family_name not in grouped_data[grade_name]:
                grouped_data[grade_name][family_name] = []
            # Exclude grade_name and family_name when extending the list
            grouped_data[grade_name][family_name].append(tuple(row[2:]))  # Start from the third element
            
        # Log grouped_data
        
        available_width = doc.width
        # Create tables for each grade_name
        for grade_name, families in grouped_data.items():
            # Add grade_name as title
            grade_title = Paragraph(grade_name+" Grade", title_style_medium)
            elements.append(grade_title)

            # Create tables for each family_name
            for family_name, family_data in families.items():
                # Add family_name as title
                family_title = Paragraph("Books Issued in "+family_name+" Family from "+grade_name+" Grade", title_style_small)
                elements.append(family_title)

                # Prepare data for table
                table_data = [['#','Student ID', 'Name','Book Name', 'ISBN Number', 'Category', 'Author',
                               'Issue Date', 'Return Date']]
                for idx, item in enumerate(family_data, start=1):
                    #logging.debug("Item tuple: %s", item)  # Log the contents of item
                    table_data.append([
                        idx,
                        item[1],
                        item[2]+" "+item[3]+" ("+item[0]+")",
                        item[4],
                        item[5],
                        item[6],
                        item[7],
                        item[8],
                        item[9]
                    ])
                
                # Calculate maximum column widths based on available page width
                
                num_cols = len(table_data[0])
                max_col_width = available_width / num_cols

                # Add table content with wrapped paragraphs
                wrapped_table_data = []
                for row in table_data:
                    wrapped_row = []
                    for cell in row:
                        cell_style = ParagraphStyle(name='WrapStyle', wordWrap='LTR')
                        wrapped_cell = Paragraph(str(cell), cell_style)
                        wrapped_row.append(wrapped_cell)
                    wrapped_table_data.append(wrapped_row)

                table = Table(wrapped_table_data)
                table.setStyle(table_style)

                elements.append(table)
                

        # Build the PDF document
        doc.build(elements)

        return response

    def get(self, request, *args, **kwargs):
        try:
            data = self.get_data_from_database()
            if data:
                return self.generate_pdf(data)
            else:
                return Response({'error': 'No data found.'}, status=404)
        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
        
class Overdue_BookReportExportAPIView(APIView):
    permission_classes = [IsAuthenticated, ]
    def get_data_from_database(self):
        sql_query = """
           SELECT 
                g.grade_name,
                f.family_name,
                c.combination_name,
                u.reg_number AS studentid,
                u.rwandan_name AS last_name,
                u.first_name,
                b.book_name,
                b.isbnumber,
                cat.category_name,
                a.author_name,
                ib.issuedate,
                ib.returndate,
                (NOW()::date - ib.issuedate::date) AS days_overdue
            FROM 
                api_grade g
            INNER JOIN 
                api_family f ON g.id = f.grade_id
            INNER JOIN 
                api_kid k ON f.id = k.family_id
            INNER JOIN 
                api_user u ON k.user_id = u.id
            INNER JOIN 
                api_kidacademics ka ON k.id = ka.kid_id
            INNER JOIN 
                api_combination c ON ka.combination_id = c.id
            INNER JOIN  
                api_issue_book ib ON ib.borrower_id = u.id
            INNER JOIN  
                api_book b ON ib.book_id = b.id
            INNER JOIN 
                api_category cat ON b.category_id = cat.id
            INNER JOIN  
                api_author a ON b.author_id = a.id
            WHERE  
                ib.returndate = 'Not yet Returned' 
                AND (NOW()::date - ib.issuedate::date) > 29
                AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
            ORDER BY   
                g.grade_name ASC,  
                f.family_name ASC;

        """
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            data = cursor.fetchall()

        return data

    def generate_pdf(self, data):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="list_of_Issued_books.pdf"'
        doc = SimpleDocTemplate(response, pagesize=landscape(letter))
        elements = []

        # Define a base style for titles
        base_title_style = getSampleStyleSheet()['Title']

        # Define different title styles with different font sizes
        title_style_small = ParagraphStyle(
            'TitleSmall',
            parent=base_title_style,
            fontSize=12  # Set the font size to 12
        )

        title_style_medium = ParagraphStyle(
            'TitleMedium',
            parent=base_title_style,
            fontSize=14  # Set the font size to 18
        )
        title_paragraph = Paragraph("LFHS@ASYV Library List of Issued Books", base_title_style)
        elements.append(title_paragraph)
        table_style = TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                                  ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                  ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                                  ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                  ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                                  ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                                  ('GRID', (0, 0), (-1, -1), 1, colors.black)])

        # Group data by grade_name
        grouped_data = {}
        for row in data:
            grade_name = row[0]  # Assuming grade_name is in the first position of each tuple
            family_name = row[1]  # Assuming family_name is in the second position of each tuple
            if grade_name not in grouped_data:
                grouped_data[grade_name] = {}
            if family_name not in grouped_data[grade_name]:
                grouped_data[grade_name][family_name] = []
            # Exclude grade_name and family_name when extending the list
            grouped_data[grade_name][family_name].append(tuple(row[2:]))  # Start from the third element
            
        # Log grouped_data
        
        available_width = doc.width
        # Create tables for each grade_name
        for grade_name, families in grouped_data.items():
            # Add grade_name as title
            grade_title = Paragraph(grade_name+" Grade", title_style_medium)
            elements.append(grade_title)

            # Create tables for each family_name
            for family_name, family_data in families.items():
                # Add family_name as title
                family_title = Paragraph("Books Issued in "+family_name+" Family from "+grade_name+" Grade", title_style_small)
                elements.append(family_title)

                # Prepare data for table
                table_data = [['#','Student ID', 'Name','Book Name', 'ISBN Number', 'Category', 'Author',
                               'Issue Date', 'days_overdue']]
                for idx, item in enumerate(family_data, start=1):
                    #logging.debug("Item tuple: %s", item)  # Log the contents of item
                    table_data.append([
                        idx,
                        item[1],
                        item[2]+" "+item[3]+" ("+item[0]+")",
                        item[4],
                        item[5],
                        item[6],
                        item[7],
                        item[8],
                        item[10]
                    ])
                
                # Calculate maximum column widths based on available page width
                
                num_cols = len(table_data[0])
                max_col_width = available_width / num_cols

                # Add table content with wrapped paragraphs
                wrapped_table_data = []
                for row in table_data:
                    wrapped_row = []
                    for cell in row:
                        cell_style = ParagraphStyle(name='WrapStyle', wordWrap='LTR')
                        wrapped_cell = Paragraph(str(cell), cell_style)
                        wrapped_row.append(wrapped_cell)
                    wrapped_table_data.append(wrapped_row)

                table = Table(wrapped_table_data)
                table.setStyle(table_style)

                elements.append(table)
                

        # Build the PDF document
        doc.build(elements)

        return response

    def get(self, request, *args, **kwargs):
        try:
            data = self.get_data_from_database()
            if data:
                return self.generate_pdf(data)
            else:
                return Response({'error': 'No data found.'}, status=404)
        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
        
class GeneralReportDisplayAPIView(APIView):
    permission_classes = [IsAuthenticated, ]  # You can add authentication if needed

    def get(self, request, *args, **kwargs):
        try:
            # Combined SQL Query
            sql_query = """
                with book_data as (
                    select 
                        count(api_book.id) as nbook_types, 
                        sum(cast(api_book.number_of_books as integer)) as nbooks 
                    from 
                        api_book
                ),
                student_data as (
                    select 
                        count(api_user.id) as nstudents 
                    from 
                        api_user 
                    where 
                        api_user.is_student and not is_alumni
                ),
                issue_data as (
                    select 
                        count(api_issue_book.id) as nissued_books,
                        sum(case when (now()::date - issuedate::date) > 29 then 1 else 0 end) as noverdue_books 
                    from 
                        api_issue_book 
                    where 
                        returndate = 'Not yet Returned'
                )
                select 
                    bd.nbook_types,
                    bd.nbooks,
                    sd.nstudents,
                    id.nissued_books,
                    id.noverdue_books
                from 
                    book_data bd,
                    student_data sd,
                    issue_data id;
            """

            # Execute the SQL query
            with connection.cursor() as cursor:
                cursor.execute(sql_query)
                data1 = cursor.fetchall()

            data = []
            if data1:
                data.append({
                    "nbook_types": data1[0][0],
                    "nbooks": data1[0][1],
                    "nstudents": data1[0][2],
                    "nissued_books": data1[0][3],
                    "noverdue_books": data1[0][4]
                })

            serializer = GeneralReportDisplaySerializer(data=data, many=True)
            serializer.is_valid()  # Validate serializer data
            return Response(serializer.data)

        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
        
class StudentsReportExportAPIView(APIView):
    permission_classes = [IsAuthenticated, ]
    def get_data_from_database(self):
        sql_query = """
           SELECT 
                ROW_NUMBER() OVER (ORDER BY g.grade_name, c.combination_name) AS number,
                u.email,
                u.rwandan_name AS last_name,
                u.first_name,
                u.reg_number AS studentid,
                g.grade_name,
                f.family_name,
                c.combination_name
            FROM 
                api_user u
            INNER JOIN 
                api_kid k ON u.id = k.user_id
            INNER JOIN 
                api_family f ON f.id = k.family_id
            INNER JOIN 
                api_kidacademics ka ON k.id = ka.kid_id
            INNER JOIN 
                api_combination c ON ka.combination_id = c.id
            INNER JOIN 
                api_grade g ON g.id = f.grade_id
            WHERE 
                u.is_student = TRUE
                AND u.is_alumni = FALSE
                AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
            ORDER BY 
                g.grade_name, 
                c.combination_name;


        """
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            data = cursor.fetchall()

        return data

    def generate_excel(self, data):
        # Create a new Workbook
        wb = Workbook()

        # Get the active worksheet
        ws = wb.active
        ws.append(["No","Email", "Last Name", "First Name", "Reg.No", "Grade", "Family", "Class"])
        # Add rows
        students_data_name = 'students_data'
        ws.title = students_data_name
        #logging.debug(data)
        
        for row_data in data:
            ws.append(row_data)

        # Save the workbook
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=LFHS_students_data.xlsx'
        wb.save(response)
        return response

    def get(self, request, *args, **kwargs):
        try:
            data = self.get_data_from_database()
            if data:
                return self.generate_excel(data)
            else:
                return Response({'error': 'No data found.'}, status=404)
        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)

#example of url: api/mostborrower/ or api/mostborrower/?start_date=2023-09-25T00:00:00&end_date=2024-05-31T23:59:59
class MostBorrowerDisplayAPIView(APIView):
    # permission_classes = [IsAuthenticated, ]  # You can add authentication if needed

    def get(self, request, *args, **kwargs):
        try:
            # Get query parameters for start_date and end_date
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            if start_date and end_date:
                # Ensure start_date and end_date are in the correct format
                try:
                    start_date = datetime.strptime(start_date, '%Y-%m-%dT%H:%M:%S')
                    end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S')
                except ValueError:
                    return Response({'error': 'Invalid date-time format. Use YYYY-MM-DDTHH:MM:SS.'}, status=400)
                
                # SQL query for the specified date range
                sql_query = f"""
                    SELECT 
                        u.rwandan_name AS last_name,
                        u.first_name,
                        g.grade_name,
                        f.family_name,
                        c.combination_name,
                        COUNT(ib.id) AS issue_count
                        FROM 
                        api_user u
                        INNER JOIN 
                        api_issue_book ib ON u.id = ib.borrower_id
                        INNER JOIN 
                        api_kid k ON u.id = k.user_id
                        INNER JOIN 
                        api_family f ON f.id = k.family_id
                        INNER JOIN 
                        api_grade g ON f.grade_id = g.id
                        INNER JOIN 
                        api_kidacademics ka ON k.id = ka.kid_id
                        INNER JOIN 
                        api_combination c ON ka.combination_id = c.id
                        WHERE 
                        u.is_student = TRUE
                        AND u.is_alumni = FALSE
                        AND ib.issuedate >= '{start_date}'
                        AND ib.issuedate <= '{end_date}'
                        AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
                        GROUP BY 
                        u.rwandan_name,
                        u.first_name,
                        g.grade_name,
                        f.family_name,
                        c.combination_name
                        ORDER BY 
                        issue_count DESC
                        LIMIT 5;

                """
            else:
                # SQL query for the current month
                sql_query = """
                    SELECT 
                        u.rwandan_name AS last_name, 
                        u.first_name, 
                        g.grade_name, 
                        f.family_name, 
                        c.combination_name, 
                        COUNT(ib.id) AS issue_count
                    FROM 
                        api_user u
                    INNER JOIN 
                        api_kid k ON u.id = k.user_id
                    INNER JOIN 
                        api_family f ON k.family_id = f.id
                    INNER JOIN 
                        api_grade g ON f.grade_id = g.id
                    INNER JOIN 
                        api_kidacademics ka ON k.id = ka.kid_id
                    INNER JOIN 
                        api_combination c ON ka.combination_id = c.id
                    INNER JOIN 
                        api_issue_book ib ON u.id = ib.borrower_id
                    WHERE 
                        u.is_student = TRUE
                        AND u.is_alumni = FALSE
                        AND DATE_TRUNC('month', CAST(ib.issuedate AS DATE)) = DATE_TRUNC('month', CURRENT_DATE)
                        AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
                    GROUP BY 
                        u.rwandan_name, 
                        u.first_name, 
                        g.grade_name, 
                        f.family_name, 
                        c.combination_name
                    ORDER BY 
                        issue_count DESC
                    LIMIT 5;


                """

            # Execute the SQL query
            with connection.cursor() as cursor:
                cursor.execute(sql_query)
                data1 = cursor.fetchall()

            data = []
            if data1 is not None:
                for i in data1:
                    data.append({
                        'last_name': i[0],
                        'first_name': i[1],
                        'grade_name': i[2],
                        'family_name': i[3],
                        'combination_name': i[4],
                        'issue_count': i[5]
                    })

            serializer = MostBorrowerDisplaySerializer(data=data, many=True)
            serializer.is_valid()  # Validate serializer data
            return Response(serializer.data)

        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)

class BorrowerByGradeDisplayAPIView(APIView):
    # permission_classes = [IsAuthenticated, ]  # You can add authentication if needed

    def get(self, request, *args, **kwargs):
        try:
            # Get query parameters for start_date and end_date
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            if start_date and end_date:
                # Ensure start_date and end_date are in the correct format
                try:
                    start_date = datetime.strptime(start_date, '%Y-%m-%dT%H:%M:%S')
                    end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S')
                except ValueError:
                    return Response({'error': 'Invalid date-time format. Use YYYY-MM-DDTHH:MM:SS.'}, status=400)
                
                # SQL query for the specified date range
                sql_query = f"""
                    SELECT 
                        g.grade_name,
                        f.family_name,
                        c.combination_name,
                        COUNT(DISTINCT ib.borrower_id) AS borrows,
                        COUNT(DISTINCT u.id) AS students
                    FROM 
                        api_user u
                    INNER JOIN 
                        api_kid k ON u.id = k.user_id
                    INNER JOIN 
                        api_family f ON k.family_id = f.id
                    INNER JOIN  
                        api_grade g ON f.grade_id = g.id
                    INNER JOIN 
                        api_kidacademics ka ON k.id = ka.kid_id
                    INNER JOIN 
                        api_combination c ON ka.combination_id = c.id
                    LEFT JOIN 
                        api_issue_book ib ON u.id = ib.borrower_id 
                        AND ib.issuedate >= '{start_date}'
                        AND ib.issuedate <= '{end_date}'
                    WHERE 
                        u.is_student = TRUE
                        AND u.is_alumni = FALSE
                        AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
                    GROUP BY 
                        g.grade_name,
                        f.family_name,
                        c.combination_name
                    ORDER BY 
                        g.grade_name ASC,
                        f.family_name ASC,
                        c.combination_name ASC,  
                        borrows DESC;

                """
            else:
                # SQL query for the current month
                sql_query = """
                    SELECT 
                        g.grade_name,
                        f.family_name,
                        c.combination_name,
                        COUNT(DISTINCT ib.borrower_id) AS borrows,
                        COUNT(DISTINCT u.id) AS students
                    FROM 
                        api_user u
                    INNER JOIN 
                        api_kid k ON u.id = k.user_id
                    INNER JOIN 
                        api_family f ON k.family_id = f.id
                    INNER JOIN  
                        api_grade g ON f.grade_id = g.id
                    INNER JOIN 
                        api_kidacademics ka ON k.id = ka.kid_id
                    INNER JOIN 
                        api_combination c ON ka.combination_id = c.id
                    LEFT JOIN 
                        api_issue_book ib ON u.id = ib.borrower_id 
                        AND DATE_TRUNC('month', CAST(ib.issuedate AS DATE)) = DATE_TRUNC('month', CURRENT_DATE)
                    WHERE 
                        u.is_student = TRUE
                        AND u.is_alumni = FALSE
                        AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
                    GROUP BY 
                        g.grade_name,
                        f.family_name,
                        c.combination_name
                    ORDER BY 
                        g.grade_name ASC,
                        f.family_name ASC,
                        c.combination_name ASC,  
                        borrows DESC;


                """

            # Execute the SQL query
            with connection.cursor() as cursor:
                cursor.execute(sql_query)
                data1 = cursor.fetchall()

            data = []
            if data1 is not None:
                for i in data1:
                    data.append({
                        'grade_name': i[0],
                        'family_name': i[1],
                        'combination_name': i[2],
                        'borrowers': i[3],
                        'students': i[4]
                    })

            serializer = BorrowerByGradeDisplaySerializer(data=data, many=True)
            serializer.is_valid()  # Validate serializer data
            return Response(serializer.data)

        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
class AllBorrowersDisplayAPIView(APIView):
    permission_classes = [IsAuthenticated, ]  # You can add authentication if needed

    def get(self, request, *args, **kwargs):
        try:   
            # SQL query for the specified date range
            sql_query = f"""
                SELECT
                    u.first_name,
                    u.rwandan_name AS last_name,
                    u.phone,
                    u.email,
                    g.grade_name,
                    f.family_name,
                    c.combination_name,
                    b.book_name,
                    b.isbnumber,
                    cat.category_name,
                    a.author_name,
                    ib.issuedate,
                    u.is_student,
                    u.is_alumni,
                    u.is_staff,
                    ib.returndate,
                    k.id AS kid_id,
                    u.id AS user_id
                FROM
                    api_user u
                INNER JOIN
                    api_issue_book ib ON ib.borrower_id = u.id
                INNER JOIN
                    api_book b ON ib.book_id = b.id
                INNER JOIN
                    api_category cat ON b.category_id = cat.id
                INNER JOIN
                    api_author a ON a.id = b.author_id
                LEFT JOIN
                    api_kid k ON u.id = k.user_id
                LEFT JOIN
                    api_family f ON k.family_id = f.id
                LEFT JOIN
                    api_grade g ON f.grade_id = g.id
                INNER JOIN
                    api_kidacademics ka ON k.id = ka.kid_id
                INNER JOIN
                    api_combination c ON ka.combination_id = c.id
                WHERE
                    ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE);

            """

            # Execute the SQL query
            with connection.cursor() as cursor:
                cursor.execute(sql_query)
                data1 = cursor.fetchall()

            data = []
            if data1:
                for i in data1:
                    data.append({
                        'first_name': i[0],
                        'last_name': i[1],
                        'phone1': i[2],
                        'email': i[3],
                        'grade_name': i[4],
                        'family_name': i[5],
                        'combination_name': i[6],
                        'book_name': i[7],
                        'isbnumber': i[8],
                        'category_name': i[9],
                        'author_name': i[10],
                        'issuedate': i[11],
                        'is_student':i[12],
                        'is_alumni':i[13],
                        'is_staff':i[14],
                        'returndate': i[15],
                        'student_id': i[16],
                        'user_id': i[17]
                    })

            serializer = AllBorrowersDisplaySerializer(data=data, many=True)
            serializer.is_valid()  # Validate serializer data
            return Response(serializer.data)

        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
        
class StudentswithBookReportExportInExcelAPIView(APIView):
    permission_classes = [IsAuthenticated, ]
    def get_data_from_database(self):
        sql_query = """
           SELECT 
                    ROW_NUMBER() OVER (ORDER BY g.grade_name, c.combination_name) AS number,
                    u.rwandan_name AS last_name,
                    u.first_name,
                    u.reg_number AS studentid,
                    g.grade_name,
                    f.family_name,
                    c.combination_name,
                    b.book_name,
                    b.isbnumber,
                    cat.category_name,
                    a.author_name,
                    TO_CHAR(
                        CASE 
                            WHEN ib.issuedate LIKE '%T%' THEN TO_TIMESTAMP(ib.issuedate, 'YYYY-MM-DD"T"HH24:MI:SS')
                            WHEN ib.issuedate LIKE '%-%' THEN TO_TIMESTAMP(ib.issuedate, 'YYYY-MM-DD HH24:MI:SS')
                            WHEN ib.issuedate LIKE '%/%' THEN TO_TIMESTAMP(ib.issuedate, 'MM/DD/YYYY HH24:MI')
                            ELSE NULL
                        END, 
                        'DD Mon, YYYY HH24:MI:SS'
                    ) AS issuedate,
                    ib.returndate
                FROM 
                    api_grade g
                INNER JOIN 
                    api_family f ON g.id = f.grade_id
                INNER JOIN 
                    api_kid k ON f.id = k.family_id
                INNER JOIN 
                    api_user u ON k.user_id = u.id
                INNER JOIN 
                    api_kidacademics ka ON k.id = ka.kid_id
                INNER JOIN 
                    api_combination c ON ka.combination_id = c.id
                INNER JOIN 
                    api_issue_book ib ON ib.borrower_id = u.id
                INNER JOIN 
                    api_book b ON ib.book_id = b.id
                INNER JOIN 
                    api_category cat ON b.category_id = cat.id
                INNER JOIN 
                    api_author a ON b.author_id = a.id
                WHERE 
                    ib.returndate = 'Not yet Returned'
                    AND ka.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
                ORDER BY 
                    g.grade_name ASC, 
                    f.family_name ASC;

        """
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            data = cursor.fetchall()

        return data

    def generate_excel(self, data):
        # Create a new Workbook
        wb = Workbook()

        # Get the active worksheet
        ws = wb.active
        ws.append(["No", "Last Name","First Name", "Reg.No", "Grade", "Family", "Class","Book Name","ISBN","Category","Author","Isued Date","Returned Date"])
        # Add rows
        isued_book_data_name = 'students_with_book_report'
        ws.title = isued_book_data_name
        #logging.debug(data)
        
        for row_data in data:
            ws.append(row_data)

        # Save the workbook
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=LFHS_Issued_Books_to_students_data.xlsx'
        wb.save(response)
        return response

    def get(self, request, *args, **kwargs):
        try:
            data = self.get_data_from_database()
            if data:
                return self.generate_excel(data)
            else:
                return Response({'error': 'No data found.'}, status=404)
        except Exception as e:
            # Log the exception or return a custom error response
            return Response({'error': str(e)}, status=500)
def transform_grade_and_combination(grade_name, combination_name):
    # Map grade_name to its short form
    grade_mapping = {
        "Ijabo": "S4",
        "Ishami": "S5",
        "Intwali": "S6"
    }
    
    # If grade_name is EY2024_2025, return the combination_name as it is
    if grade_name == "EY2024_2025":
        return combination_name
    
    # Otherwise, extract the short grade name
    short_grade = grade_mapping.get(grade_name, grade_name)
    
    # Extract the text inside parentheses from combination_name
    if "(" in combination_name and ")" in combination_name:
        combination_text = combination_name.split("(")[-1].split(")")[0]
    else:
        combination_text = combination_name  # Fallback if no parentheses exist
    
    # Return the combined string in the format grade_combination
    return f"{short_grade}_{combination_text}"

def format_issueddate(date_str):
    try:
        # Try parsing in ISO 8601 format (e.g., 2024-05-28T08:59:27.108Z or 2024-05-29 15:13:50)
        if 'T' in date_str:  # For ISO format with T and Z
            formatted_date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        else:  # For format like '2023-05-29 15:11:41'
            formatted_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        
        # Return the formatted date in a user-friendly format
        return formatted_date.strftime("%Y-%m-%d %H:%M:%S")
    
    except ValueError:
        # Handle invalid date format
        return "Invalid Date"
           
def library_book_export_view(request):
    try:
        current_year = timezone.now().year

        # Subquery to get the latest unreturned book for each user
        latest_unreturn_book = Issue_Book.objects.filter(
            borrower=OuterRef('user_id'),
            returndate='Not yet Returned'
        ).select_related('book').order_by('-issuedate').values(
            'book__book_name', 'book__isbnumber', 'issuedate'
        )[:1]

        # Subquery to get the combination name based on the current academic year
        latest_combination = KidAcademics.objects.filter(
            kid=OuterRef('pk'),
            academic_year=current_year
        ).select_related('combination').values('combination__combination_name')[:1]

        # Query to fetch kids with their latest unreturned book and grade/combination
        queryset = Kid.objects.select_related(
            'user', 'family__grade'
        ).annotate(
            book_name=Subquery(latest_unreturn_book.values('book__book_name')),
            isbn_number=Subquery(latest_unreturn_book.values('book__isbnumber')),
            issued_date=Subquery(latest_unreturn_book.values('issuedate')),
            grade_name=F('family__grade__grade_name'),
            combination_name=Subquery(latest_combination)
        ).filter(
            book_name__isnull=False
        )

        # Prepare data for Excel
        data = []
        st_ids = 1
        for kid in queryset:
            try:
                if kid.issued_date:
                    try:
                        issue_date = datetime.strptime(kid.issued_date, '%Y-%m-%dT%H:%M:%S.%fZ')
                    except ValueError:
                        try:
                            issue_date = datetime.strptime(kid.issued_date, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            try:
                                issue_date = datetime.strptime(kid.issued_date, '%m/%d/%Y %H:%M')
                            except ValueError:
                                issue_date = None

                    if issue_date:
                        issue_date = timezone.make_aware(issue_date)
                        days_since_issue = (timezone.now().date() - issue_date.date()).days
                    else:
                        days_since_issue = 'Invalid Date'
                else:
                    days_since_issue = 0
            except (ValueError, TypeError):
                days_since_issue = 'Invalid Date'

            data.append({
                "#": st_ids,
                'First Name': kid.user.first_name or '',
                'Last Name': kid.user.rwandan_name or '',
                'Reg.No': kid.user.reg_number or '',
                'Class': transform_grade_and_combination(kid.grade_name, kid.combination_name or ''),
                'Family': kid.family.family_name if kid.family else '',
                'Book Name': kid.book_name or '',
                'ISBN Number': kid.isbn_number or '',
                'Issued Date': format_issueddate(kid.issued_date),
                'Days Since Issue': days_since_issue
            })
            st_ids += 1

        df = pd.DataFrame(data)

        if df.empty:
            return JsonResponse({
                'status': 'error',
                'message': 'No data found for export'
            }, status=404)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=library_book_issuance.xlsx'

        with pd.ExcelWriter(response, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Students')

            workbook = writer.book
            worksheet = writer.sheets['Students']

            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#D7E4BC',
                'border': 1
            })

            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)

            for i, col in enumerate(df.columns):
                column_len = max(df[col].astype(str).map(len).max(), len(col)) + 2
                worksheet.set_column(i, i, column_len)

        return response

    except Exception as e:
        error_traceback = traceback.format_exc()
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'traceback': error_traceback
        }, status=500)

