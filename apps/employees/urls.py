from django.urls import path
from . import views

app_name = 'employees'

urlpatterns = [
    # Employee Directory & Profiles
    path('', views.employee_list, name='employee_list'),
    path('create/', views.employee_create, name='employee_create'),
    path('<int:id>/', views.employee_detail, name='employee_detail'),
    path('<int:id>/edit/', views.employee_edit, name='employee_edit'),
    path('<int:id>/activate/', views.employee_activate, name='employee_activate'),
    path('<int:id>/deactivate/', views.employee_deactivate, name='employee_deactivate'),

    # Company Management
    path('companies/', views.company_list, name='company_list'),
    path('companies/create/', views.company_create, name='company_create'),
    path('companies/<int:id>/edit/', views.company_edit, name='company_edit'),

    # Department Management
    path('departments/', views.department_list, name='department_list'),
    path('departments/create/', views.department_create, name='department_create'),
    path('departments/<int:id>/edit/', views.department_edit, name='department_edit'),

    # Designation Management
    path('designations/', views.designation_list, name='designation_list'),
    path('designations/create/', views.designation_create, name='designation_create'),
    path('designations/<int:id>/edit/', views.designation_edit, name='designation_edit'),

    # Skills Management
    path('<int:id>/skills/add/', views.employee_skill_add, name='employee_skill_add'),
    path('<int:id>/skills/<int:skill_id>/edit/', views.employee_skill_edit, name='employee_skill_edit'),
    path('<int:id>/skills/<int:skill_id>/delete/', views.employee_skill_delete, name='employee_skill_delete'),

    # Certifications Management
    path('<int:id>/certifications/add/', views.employee_certification_add, name='employee_certification_add'),
    path('<int:id>/certifications/<int:cert_id>/edit/', views.employee_certification_edit, name='employee_certification_edit'),
    path('<int:id>/certifications/<int:cert_id>/delete/', views.employee_certification_delete, name='employee_certification_delete'),

    # Documents Management & Secure Download
    path('<int:id>/documents/add/', views.employee_document_add, name='employee_document_add'),
    path('<int:id>/documents/<int:document_id>/download/', views.employee_document_download, name='employee_document_download'),
    path('<int:id>/documents/<int:document_id>/delete/', views.employee_document_delete, name='employee_document_delete'),
]
