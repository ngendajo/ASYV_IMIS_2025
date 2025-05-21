from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError

#General User model
class CustomUserManager(BaseUserManager):
    def _create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is required')

        user = self.model(username=username, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(username, password, **extra_fields)

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self._create_user(username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('N', 'Not Specified'),
    ]

    # Required fields
    username = models.CharField(max_length=150, unique=True)
    reg_number = models.CharField(max_length=50, unique=True, null=True)
    first_name = models.CharField(max_length=150, null=True)
    rwandan_name = models.CharField(max_length=150, null=True)
    password = models.CharField(max_length=128)

    # Optional fields
    middle_name = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(blank=True, null=True, unique=True)
    email1 = models.EmailField(blank=True, null=True, unique=True)
    phone = models.CharField(
        max_length=30, blank=True, null=True, unique=True,
        validators=[RegexValidator(regex=r'^\+?\d{1,4}[\d\s()-]{7,30}$')]
    )
    phone1 = models.CharField(
        max_length=30, blank=True, null=True, unique=True,
        validators=[RegexValidator(regex=r'^\+?\d{1,4}[\d\s()-]{7,30}$')]
    )
    image_url = models.URLField(blank=True, null=True)
    dob = models.CharField(
        max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='N')

    # Default fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['reg_number', 'first_name', 'rwandan_name', 'gender']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        constraints = [
            models.CheckConstraint(
                check=~models.Q(email=models.F('email1')),
                name='email_email1_unique'
            ),
            models.CheckConstraint(
                check=~models.Q(phone=models.F('phone1')),
                name='phone_phone1_unique'
            ),
            models.CheckConstraint(
                check=~models.Q(username=models.F('reg_number')),
                name='username_regnumber_unique'
            ),
        ]

    def clean(self):
        super().clean()

        # Ensure no duplicate values across multiple fields
        fields = [self.email, self.email1, self.phone, self.phone1, self.username, self.reg_number]
        values = [field for field in fields if field]  # Remove None/empty values

        if len(values) != len(set(values)):  # Check for duplicates
            raise ValidationError("Email, phone numbers, username, and registration number must be unique across all fields.")

    def save(self, *args, **kwargs):
        self.clean()  # Validate before saving
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f"{self.first_name} {self.middle_name or ''} {self.rwandan_name}".strip()

    def get_short_name(self):
        return self.first_name
    
#Grades Model
    
class Grade(models.Model):
    grade_name = models.CharField(max_length=100)
    admission_year_to_asyv = models.IntegerField()
    graduation_year_to_asyv = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.grade_name

    class Meta:
        ordering = ['-created_at']
        
#Families Model

class Family(models.Model):
    family_name = models.CharField(max_length=100)
    family_number = models.CharField(max_length=50)
    mother = models.ForeignKey(User, on_delete=models.CASCADE, related_name='families')
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='families',null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.family_name

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Families"
        
#Leap models
        
class Leap(models.Model):
    CATEGORY_CHOICES = [
        ('science_center', 'Science Center'),
        ('art_center', 'Art Center'),
        ('sport', 'Sport'),
        ('club', 'Club'),
        ('professional', 'Professional'),
    ]
    
    ep = models.CharField(max_length=100)
    leap_category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='club'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ep} - {self.leap_category}"  

# kids crud
class Subject(models.Model):
    subject_name = models.CharField(max_length=100)
    credits = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.subject_name

class Combination(models.Model):
    combination_name = models.CharField(max_length=100)
    abbreviation = models.CharField(max_length=20)

    def __str__(self):
        return self.combination_name

class Kid(models.Model):
    GRADUATION_STATUS_CHOICES = [
        ('graduated', 'Graduated'),
        ('studying', 'Studying'),
        ('dropped', 'Dropped'),
        ('deceased_before', 'Deceased Before Graduation')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids')
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='kids',null=True, blank=True)
    leaps = models.ManyToManyField(Leap, related_name='kids')
    graduation_status = models.CharField(
        max_length=50, 
        choices=GRADUATION_STATUS_CHOICES,
        default='studying'
    )
    origin_district = models.CharField(max_length=100)
    origin_sector = models.CharField(max_length=100)
    current_district_or_city = models.CharField(max_length=100)
    current_county = models.CharField(max_length=100)
    health_issue = models.TextField(null=True, blank=True)
    marital_status = models.CharField(max_length=20)
    life_status = models.CharField(max_length=20)
    has_children = models.BooleanField()
    points_in_national_exam = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    maximum_points_in_national_exam = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    mention = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.family.family_name}"

class KidAcademics(models.Model):
    LEVEL_CHOICES = [
        ('EY', 'EY'),
        ('S4', 'S4'),
        ('S5', 'S5'),
        ('S6', 'S6'),
    ]
    
    kid = models.ForeignKey(Kid, on_delete=models.CASCADE, related_name='academics')
    academic_year = models.IntegerField()
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    combination = models.ForeignKey(Combination, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('kid', 'academic_year')
        
    def __str__(self):
        return f"{self.kid} - {self.academic_year} - {self.level}"

class NationalSubjectResult(models.Model):
    GRADE_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('E', 'E'),
        ('S', 'S'),
        ('F', 'F'),
    ]
    kid = models.ForeignKey(Kid, on_delete=models.CASCADE, related_name='subject_results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    grade = models.CharField(max_length=1, choices=GRADE_CHOICES)
    marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ('kid', 'subject')