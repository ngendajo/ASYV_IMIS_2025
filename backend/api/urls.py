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
    path('upload-marks/', views.MarksExcelUpload.as_view(), name='upload-marks'),
    path('', include(router.urls)), 
    
    #author paths
    path('author/',views.AuthorRegistrationView.as_view()),
    path('author/<int:pk>/delete/', views.delete_author, name='delete-author'),
    path('author/<int:pk>/', views.update_Author, name='update_author'),
    
    #category paths
    path('category/',views.CategoryRegistrationView.as_view()),
    path('category/<int:pk>/delete/', views.delete_category, name='delete-category'),
    path('category/<int:pk>/', views.update_Category, name='update_category'),
    
    #book paths
    path('book/',views.BookRegistrationView.as_view()),
    path('books/',views.BookListDisplayAPIView.as_view()),
    path('exportbooks/',views.BookReportExportAPIView.as_view()),
    path('book/<int:pk>/delete/', views.delete_book, name='delete-book'),
    path('book/<int:pk>/', views.update_Book, name='update_book'),

    #Issue_Book paths
    path('issue/', views.Issue_BookRegistrationView.as_view(), name='issue_book_api'),
    path('issued/', views.IssuedBookDisplayAPIView.as_view(), name='issued_book_api'),
    path('exportissued/', views.Issued_BookReportExportAPIView.as_view(), name='issued_book_api_in_pdf'),
    path('exportoverdue/', views.Overdue_BookReportExportAPIView.as_view(), name='overdue_book_api_in_pdf'),
    path('issue/<int:pk>/delete/', views.delete_Issue_Book, name='delete-issue'),
    path('issue/<int:pk>/', views.update_Issue_Book, name='update_issue'),
    #path('change-stpassword/', views.ChangeStudentPasswordView.as_view(), name='change-password'),
    
    path('students/', views.StudentListDisplayAPIView.as_view(), name='students'),
    path('exportstudentexcel/', views.StudentsReportExportAPIView.as_view(), name='student-export-data'),    
    path('exportissuedexcel/', views.StudentswithBookReportExportInExcelAPIView.as_view(), name='issued-export-data'),  
    
    #General report
    path('general/', views.GeneralReportDisplayAPIView.as_view(), name='general_report'),
    path('mostborrower/', views.MostBorrowerDisplayAPIView.as_view(), name='most_borrower_report'),
    path('gborrower/', views.BorrowerByGradeDisplayAPIView.as_view(), name='grade_borrower_report'),
    path('borrowers/', views.AllBorrowersDisplayAPIView.as_view(), name='borrowers_report'),
    path('library/book-export/', views.library_book_export_view, name='library_book_export'),
    
    path('', views.getRoutes),

    #visualizations
    path('alumnilist/', views.AlumniListView.as_view(), name='alumini'), #It is used in new ams
    path('gender-distribution/', views.gender_distribution, name='gender_distribution'),
    path('combination-counts/', views.combination_counts, name='combination_counts'),
    path('alumni-outcomes-percentage/', views.alumni_outcome_percentages, name='general report'),

    path('alumni-directory/', views.AlumniDirectoryView.as_view(), name='alumni directory'), 
    path('alumni-country-map/', views.AlumniCountryMap.as_view(), name="alumni-country-map"), 
    path('alumni-trends/', views.AlumniOutcomeTrends.as_view(), name="alumni-outcome-trends"),  
    
    #profile 
    path('kid/<int:user_id>/', views.get_student_information, name='kid-info'),
    path('alumni-employment/', views.AlumniEmploymentView.as_view(), name='alumni-employment'),
    path('alumni-academic/', views.AlumniAcademicView.as_view(), name='alumni-academic'),
    #selection options
    path('options/all-dropdowns/', views.DropdownOptionsAPIView.as_view(), name='profile-dropdowns'),


]