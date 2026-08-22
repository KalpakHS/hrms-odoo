from django.urls import path
from . import views

app_name = 'payroll'

urlpatterns = [
    path('', views.salary_list, name='salary_list'),
    path('dashboard/', views.payroll_dashboard, name='dashboard'),
    path('salary/<int:employee_id>/', views.salary_detail, name='salary_detail'),
    path('salary/<int:employee_id>/create/', views.salary_create, name='salary_create'),
    path('salary/<int:employee_id>/edit/', views.salary_edit, name='salary_edit'),
    path('payslips/', views.payslip_list, name='payslip_list'),
    path('my-payslips/', views.my_payslips, name='my_payslips'),
    path('payslips/generate/', views.payslip_generate_view, name='payslip_generate'),
    path('payslips/<int:id>/', views.payslip_detail, name='payslip_detail'),
    path('payslips/<int:id>/pdf/', views.payslip_pdf, name='payslip_pdf'),
    path('payslips/<int:id>/payment/', views.payslip_payment_update, name='payslip_payment_update'),
]
