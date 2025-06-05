from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

from rest_framework_simplejwt.views import (
    TokenRefreshView, 
)

router = DefaultRouter()
router.register(r'users', views.UserViewSet) #user crud
router.register(r'grades', views.GradeViewSet)# grade crud
router.register(r'families', views.FamilyViewSet) #family crud
router.register(r'leaps', views.LeapViewSet) #Leap CRUD
router.register(r'subjects', views.SubjectViewSet, basename='subject')#Subject crud
router.register(r'combinations', views.CombinationViewSet) #combination crud
router.register(r'kids', views.KidViewSet) #Kid crud
router.register(r'kid-academics', views.KidAcademicsViewSet) #KidAcademics crud
router.register(r'employments', views.EmploymentViewSet, basename='employment') #Employment crud
router.register(r'further-education', views.FurtherEducationViewSet, basename='furthereducation') #Further Education crud
router.register(r'colleges', views.CollegeViewSet, basename='colleges') #College crud 


urlpatterns = [
    # user paths
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('changepassword/',views.ChangePasswordView.as_view(),name="change_password"),
    path('password-reset/<str:encoded_pk>/<str:token>',
        views.ResetPassword.as_view(),
         name="reset-password",
    ), 
    path('password-reset/', views.PasswordReset.as_view(), name="password-reset"),
    
    path('updateuserimage/<str:pk>', views.update_user_image, name='update-userimage'),
    
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    #Upload data
    path('upload-grades/', views.GradeExcelUploadView.as_view(), name='upload-grades'),#Upload grades
    path('upload-families/', views.FamilyExcelUploadView.as_view(), name='upload-staffs'),#Upload Families using .xlsx file
    path('upload-staffs/', views.StaffExcelUploadView.as_view(), name='upload-staffs'),#Upload staff with .xlsx file
    path('upload-leap/', views.LeapExcelUploadView.as_view(), name='leap-excel-upload'),#leap-excel-upload
    path('kids-data-upload-xlsx/', 
         views.DataUploadViewSet.as_view({'post': 'upload_xlsx'}), 
         name='kids-data-upload-xlsx'),#kids-data-upload-xlsx
    path('kid-academics/import/', views.KidAcademicsImportView.as_view(), name='kid-academics-import'),
    path('upload-employment/', views.EmploymentExcelUploadView.as_view(), name='upload-employment'),
    path('upload-college/', views.CollegeExcelUploadView.as_view(), name='upload-college'),
    path('upload-further-education/', views.FurtherEducationExcelUploadView.as_view(), name='upload-further-education'),

    path('', include(router.urls)),

    
    path('', views.getRoutes),

    path('alumnilist/', views.AlumniListView.as_view(), name='alumini'), #It is used in new ams
    path('gender-distribution/', views.gender_distribution, name='gender_distribution'),
    path('combination-counts/', views.combination_counts, name='combination_counts'),
    path('alumni-outcomes-percentage/', views.alumni_outcome_percentages, name='general report'),
    path('kid/<int:user_id>/', views.get_student_information, name='kid-info')
    path('alumni-outcomes-percentage/', views.alumni_outcome_percentages, name='general report'), 
    path('alumni-country-map/', views.AlumniCountryMap.as_view(), name="alumni-country-map")
]