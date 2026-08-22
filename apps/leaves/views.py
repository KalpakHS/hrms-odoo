from django.utils import timezone
from rest_framework import viewsets, permissions, status, views, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from common.permissions import IsAdminOrHR, IsSelfOrAdmin
from .models import LeaveRequest, LeaveStatus
from apps.employees.models import Employee
from .serializers import (
    LeaveRequestSerializer,
    LeaveApplySerializer,
    LeaveReviewSerializer
)

class LeaveViewSet(viewsets.ModelViewSet):
    """
    Leave Management ViewSet:
    - Admin/HR: Full view of all applications, capability to approve/reject.
    - Employee: View only their own leave applications.
    """
    queryset = LeaveRequest.objects.select_related('employee', 'employee__user', 'reviewed_by').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__emp_code', 'employee__first_name', 'employee__last_name', 'remarks']
    ordering_fields = ['applied_at', 'start_date', 'status']
    ordering = ['-applied_at']

    def get_permissions(self):
        if self.action in ['destroy', 'review']:
            return [IsAdminOrHR()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        return LeaveRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return LeaveRequest.objects.none()

        queryset = LeaveRequest.objects.select_related('employee', 'employee__user', 'reviewed_by').all()

        # Employees only see their own requests
        if user.role != 'ADMIN' and not user.is_staff:
            queryset = queryset.filter(employee__user=user)

        # Filters
        status_param = self.request.query_params.get('status')
        leave_type = self.request.query_params.get('leave_type')
        employee_id = self.request.query_params.get('employee_id')

        if status_param:
            queryset = queryset.filter(status=status_param.upper())
        if leave_type:
            queryset = queryset.filter(leave_type=leave_type.upper())
        if employee_id and (user.role == 'ADMIN' or user.is_staff):
            queryset = queryset.filter(employee_id=employee_id)

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrHR])
    def review(self, request, pk=None):
        """
        Admin endpoint to approve or reject a pending leave application.
        """
        leave_request = self.get_object()

        serializer = LeaveReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        leave_request.status = serializer.validated_data['status']
        leave_request.admin_comment = serializer.validated_data.get('admin_comment', '')
        leave_request.reviewed_by = request.user
        leave_request.reviewed_at = timezone.now()
        leave_request.save()

        return Response({
            "message": f"Leave request marked as {leave_request.get_status_display()}.",
            "leave": LeaveRequestSerializer(leave_request).data
        }, status=status.HTTP_200_OK)


class ApplyLeaveView(views.APIView):
    """
    Employee action: Submits a new leave application.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            return Response(
                {"detail": "No employee profile found for current user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = LeaveApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        leave_request = LeaveRequest.objects.create(
            employee=employee,
            leave_type=serializer.validated_data['leave_type'],
            start_date=serializer.validated_data['start_date'],
            end_date=serializer.validated_data['end_date'],
            remarks=serializer.validated_data['remarks'],
            status=LeaveStatus.PENDING
        )

        return Response({
            "message": "Leave application submitted successfully.",
            "leave": LeaveRequestSerializer(leave_request).data
        }, status=status.HTTP_201_CREATED)


class MyLeavesView(views.APIView):
    """
    Employee action: Lists all leave requests submitted by the logged-in employee.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            return Response(
                {"detail": "No employee profile found for current user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        leaves = LeaveRequest.objects.filter(employee=employee).order_by('-applied_at')
        serializer = LeaveRequestSerializer(leaves, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
