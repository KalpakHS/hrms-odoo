from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from common.permissions import IsAdminOrHR
from .models import Payroll
from apps.employees.models import Employee
from .serializers import PayrollSerializer, AdminPayrollUpdateSerializer

class PayrollViewSet(viewsets.ModelViewSet):
    """
    Payroll API:
    - Admin/HR: View and update salary structure for any employee.
    - Employee: Restricted from mutating payroll.
    """
    queryset = Payroll.objects.select_related('employee', 'employee__user').all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrHR()]
        return [IsAdminOrHR()]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return AdminPayrollUpdateSerializer
        return PayrollSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or (user.role != 'ADMIN' and not user.is_staff):
            return Payroll.objects.none()

        queryset = Payroll.objects.select_related('employee', 'employee__user').all()
        dept = self.request.query_params.get('department')
        if dept:
            queryset = queryset.filter(employee__department__iexact=dept)
        return queryset


class MyPayrollView(views.APIView):
    """
    Employee action: Read-only access to view their own salary structure and net pay breakdown.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            return Response(
                {"detail": "No employee profile found for current user."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            payroll = employee.payroll
        except Payroll.DoesNotExist:
            payroll = Payroll.objects.create(employee=employee)

        serializer = PayrollSerializer(payroll)
        return Response(serializer.data, status=status.HTTP_200_OK)
