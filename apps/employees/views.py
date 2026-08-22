from rest_framework import viewsets, permissions, status, views, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from common.permissions import IsAdminOrHR, IsSelfOrAdmin
from .models import Employee
from .serializers import (
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    EmployeeCreateSerializer,
    EmployeeSelfUpdateSerializer
)

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Employee Management.
    - Admin/HR: Full access to all employee records.
    - Employees: Read/update access strictly to their own profile.
    """
    queryset = Employee.objects.select_related('user').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['emp_code', 'first_name', 'last_name', 'email', 'department', 'designation']
    ordering_fields = ['emp_code', 'joining_date', 'first_name', 'department']
    ordering = ['emp_code']

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdminOrHR()]
        return [permissions.IsAuthenticated(), IsSelfOrAdmin()]

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            # Non-admin users can only update specific personal fields
            if self.request.user.role != 'ADMIN' and not self.request.user.is_staff:
                return EmployeeSelfUpdateSerializer
            return EmployeeDetailSerializer
        return EmployeeDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Employee.objects.none()
        
        # Admin can view all employees, optionally filtered by department
        if user.role == 'ADMIN' or user.is_staff:
            queryset = Employee.objects.select_related('user').all()
            dept = self.request.query_params.get('department')
            if dept:
                queryset = queryset.filter(department__iexact=dept)
            return queryset

        # Employees can only access their own profile
        return Employee.objects.select_related('user').filter(user=user)


class MyProfileView(views.APIView):
    """
    Dedicated endpoint for the currently authenticated employee to view and update their profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            return Response(
                {"detail": "No employee profile associated with this account."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = EmployeeDetailSerializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            return Response(
                {"detail": "No employee profile associated with this account."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = EmployeeSelfUpdateSerializer(employee, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(EmployeeDetailSerializer(employee).data, status=status.HTTP_200_OK)
