from django.urls import path
from . import views

app_name = 'leave'

urlpatterns = [
    path('', views.leave_list, name='leave_list'),
    path('dashboard/', views.leave_dashboard, name='dashboard'),
    path('apply/', views.leave_apply, name='leave_apply'),
    path('my/', views.my_leave_list, name='my_leave'),
    path('<int:id>/', views.leave_detail, name='leave_detail'),
    path('<int:id>/approve/', views.leave_approve, name='leave_approve'),
    path('<int:id>/reject/', views.leave_reject, name='leave_reject'),
    path('<int:id>/cancel/', views.leave_cancel, name='leave_cancel'),
    path('<int:id>/attachment/', views.leave_attachment_download, name='leave_attachment_download'),
    path('types/', views.leave_type_list, name='leave_type_list'),
    path('types/create/', views.leave_type_create, name='leave_type_create'),
    path('types/<int:id>/edit/', views.leave_type_edit, name='leave_type_edit'),
]
