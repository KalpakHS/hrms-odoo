from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('', views.attendance_list, name='attendance_list'),
    path('dashboard/', views.attendance_dashboard, name='dashboard'),
    path('my/', views.my_attendance, name='my_attendance'),
    path('check-in/', views.check_in_view, name='check_in'),
    path('check-out/', views.check_out_view, name='check_out'),
    path('create/', views.attendance_create, name='attendance_create'),
    path('<int:id>/', views.attendance_detail, name='attendance_detail'),
    path('<int:id>/edit/', views.attendance_edit, name='attendance_edit'),
]
