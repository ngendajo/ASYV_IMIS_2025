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
    reg_number = models.CharField(max_length=50, unique=True, null=True) #unique identifier 
    first_name = models.CharField(max_length=150, null=True) 
    rwandan_name = models.CharField(max_length=150, null=True) #do not inherit family name - no last name
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
    image_url = models.ImageField(upload_to='profiles', default='profiles/default.jpeg')
    dob = models.CharField(
        max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='N')

    # Default fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) #any interested staff - includes M&E 
    is_superuser = models.BooleanField(default=False)
    is_crc = models.BooleanField(default=False)
    is_alumni = models.BooleanField(default=False)
    is_mama = models.BooleanField(default=False)
    is_librarian = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)
    is_teacher = models.BooleanField(default=False)
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
    
    def get_full_name(self):
        return f"{self.first_name} {self.middle_name or ''} {self.rwandan_name}".strip()

    def __str__(self):
        return f"{self.get_full_name()}"
    
    def get_short_name(self):
        return self.first_name
    
#Grades Model
    
class Grade(models.Model): #each graduation class
    grade_name = models.CharField(max_length=100)
    admission_year_to_asyv = models.IntegerField()
    graduation_year_to_asyv = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.grade_name} , Class of {self.graduation_year_to_asyv}"

    class Meta:
        ordering = ['-created_at']
        
#Families Model

class Family(models.Model):
    family_name = models.CharField(max_length=100)
    family_number = models.CharField(max_length=50) #1 to 6
    mother = models.ForeignKey(User, on_delete=models.CASCADE, related_name='families')
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='families',null=True, blank=True) # 6 families to a grade
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
        ('programming', 'Programming'),#python
        ('professional', 'Professional'),#practical skills
    ]
    
    ep = models.CharField(max_length=100) #name
    leap_category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='club'
    )
    # NEW FIELDS - Add these first
    recorded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='recorded_leaps'
    )
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
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
        return self.combination_name + self.abbreviation

class Kid(models.Model):
    GRADUATION_STATUS_CHOICES = [
        ('graduated', 'Graduated'),
        ('studying', 'Studying'),
        ('dropped', 'Dropped'),
        ('deceased_before', 'Deceased Before Graduation')
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kid')
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='kids',null=True, blank=True)
    
    # Add new managed relationship with approval system
    leaps = models.ManyToManyField(
        Leap, 
        related_name='managed_kids', 
        through='KidLeap',
        blank=True
    )
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
    
class KidLeap(models.Model):
    kid = models.ForeignKey(Kid, on_delete=models.CASCADE)
    leap = models.ForeignKey(Leap, on_delete=models.CASCADE)
    recorded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='recorded_kid_leaps'
    )
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('kid', 'leap')

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
    marks = models.FloatField(default=0)
    report_card = models.FileField(upload_to='pdfs/', null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)

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
        
class Employment(models.Model):
    title = models.CharField(max_length=5000)
    alumn = models.ForeignKey(Kid, on_delete=models.PROTECT, related_name='employment')
    
    EMPLOYMENT_CHOICES = (
        ('F', 'Full-time'),
        ('P', 'Part-time'),
        ('S', 'Self-employed'),
        ('I', 'Intern'),
    ) 
    status = models.CharField(max_length=2, choices=EMPLOYMENT_CHOICES)
    INDUSTRY_CHOICES = [
        ("Agriculture, Forestry, and Fishing", "Agriculture, Forestry, and Fishing"),
        ("Art, Design, and Performance", "Art, Design, and Performance"),
        ("Beauty and Personal Care", "Beauty and Personal Care"),
        ("Business and Management", "Business and Management"),
        ("Construction and Engineering", "Construction and Engineering"),
        ("Dining and Hospitality Services", "Dining and Hospitality Services"),
        ("Education and Training", "Education and Training"),
        ("Energy and Utilities", "Energy and Utilities"),
        ("Finance and Banking", "Finance and Banking"),
        ("Government and Public Service", "Government and Public Service"),
        ("Healthcare and Medical Services", "Healthcare and Medical Services"),
        ("Information Technology and Software Development", "Information Technology and Software Development"),
        ("Legal Services", "Legal Services"),
        ("Logistics and Transportation", "Logistics and Transportation"),
        ("Manufacturing and Production", "Manufacturing and Production"),
        ("Marketing, Sales, and Customer Service", "Marketing, Sales, and Customer Service"),
        ("Media and Communication", "Media and Communication"),
        ("Real Estate and Property Management", "Real Estate and Property Management"),
        ("Research and Development", "Research and Development"),
        ("Security and Law Enforcement", "Security and Law Enforcement"),
        ("Social Work and Community Services", "Social Work and Community Services"),
        ("Sports and Recreation", "Sports and Recreation"),
        ("Telecommunications", "Telecommunications"),
        ("Trade and Skilled Labor", "Trade and Skilled Labor"),
        ("Others / Not Specified", "Others / Not Specified"),
    ]

    industry = models.CharField(
        max_length=100,
        choices=INDUSTRY_CHOICES,
        default="Others / Not Specified",
    )
    description = models.CharField(max_length=2000, default="")
    company = models.CharField(max_length=2000)
    on_going = models.BooleanField(default=False)
    crc_support = models.BooleanField(default=False)
    # NEW FIELDS - Add these first  
    recorded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='recorded_employments'
    )
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    contributing_leaps = models.ManyToManyField(
        Leap, 
        blank=True,
        related_name='related_employments'
    )
    start_date = models.CharField(max_length=100, default="")
    end_date = models.CharField(max_length=100, default="")

    def __str__(self):
        return self.title
    
class College(models.Model):
    college_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)

    def __str__(self):
        return self.college_name

class FurtherEducation(models.Model):

    alumn = models.ForeignKey('Kid', on_delete=models.PROTECT, related_name='furthereducation')

    college = models.ForeignKey('College', on_delete=models.PROTECT, related_name='college')
    
    LEVEL_CHOICES = (
        ('C', 'Certificate'),
        ('A1', 'Advanced diploma'),
        ('A0', 'Bachelors'),
        ('M', 'Masters'),
        ('PHD', 'PHD'),
    )
    level = models.CharField(max_length=3, choices=LEVEL_CHOICES, default='C')#Examples:Bachelors,Masters,PHD
    degree = models.CharField(max_length=2500)
    APPLICATION_RESULT_CHOICES = (
        ('A', 'Accepted'),
        ('R', 'Rejected'),
        ('W', 'Withdrow'),
        ('P', 'Pending'),
    )
    application_result = models.CharField(max_length=1,default='P', choices=APPLICATION_RESULT_CHOICES)
    waitlisted = models.BooleanField(default=False)
    enrolled = models.BooleanField(default=False)
    SCHOLARSHIP_CHOICES = (
        ('F', 'Full'),
        ('P', 'Partial'),
        ('S', 'Self-Sponsor'),
    )
    scholarship = models.CharField(max_length=3, choices=SCHOLARSHIP_CHOICES)
    scholarship_details = models.CharField(max_length=2000, default="")
    
    STATUS_CHOICES = (
        ('D', 'Dropped_Out'),
        ('S', 'Suspended'),
        ('O', 'On_going'),
        ('G', 'Graduated'),
        ('N', 'NA'),
    )
    status = models.CharField(max_length=3, choices=STATUS_CHOICES)
    crc_support = models.BooleanField(default=False)

    def __str__(self):
        return str(self.alumn.user.first_name + ' - ' + self.college.college_name)
    
#Library Management System

# Authors models
class Author(models.Model):
    author_name = models.CharField(max_length=500)

    def __str__(self):
        return str(self.author_name)
    
# Category models
class Category(models.Model):
    category_name = models.CharField(max_length=500)
    #category_id = models.IntegerField(unique=True,null=True)

    def __str__(self):
        return str(self.category_name)
    
# Books models
class Book(models.Model):
    book_name = models.CharField(max_length=500)
    isbnumber = models.CharField(max_length=100)
    number_of_books = models.CharField(max_length=30)
    category = models.ForeignKey(Category,on_delete=models.PROTECT, related_name="categ")
    author = models.ForeignKey(Author,related_name="autho",on_delete=models.PROTECT)

    def __str__(self):
        return str(self.book_name)
    
# Issue Books models
class Issue_Book(models.Model):
    book = models.ForeignKey(Book,on_delete=models.PROTECT, related_name="boo")
    borrower = models.ForeignKey(User,on_delete=models.PROTECT, related_name="borrow")
    library_number = models.CharField(max_length=30)
    issuedate = models.CharField(max_length=70)
    returndate = models.CharField(max_length=70)
    

    def __str__(self):
        return str(self.book.book_name + self.borrower.first_name + "borrow")


    def __str__(self):
        return str(self.term_name)