from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollViewSet, MyPayrollView

router = DefaultRouter()
router.register(r'records', PayrollViewSet, basename='payroll-records')

urlpatterns = [
    path('my-payroll/', MyPayrollView.as_view(), name='payroll_my_payroll'),
    path('', include(router.urls)),
]
