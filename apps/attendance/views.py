from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from common.permissions import IsAdminOrHR, IsSelfOrAdmin
from .models import Attendance, AttendanceStatus
from apps.employees.models import Employee
from .serializers import (
    AttendanceSerializer,
    CheckInSerializer,
    CheckOutSerializer,
    AdminAttendanceCreateUpdateSerializer
)

class AttendanceViewSet(viewsets.ModelViewSet):
    """
    Attendance records endpoint:
    - Admin/HR: Full view of all employee attendance records with date/employee filtering.
    - Employee: View only their own attendance history.
    """
    queryset = Attendance.objects.select_related('employee', 'employee__user').all()
    ordering = ['-date', 'employee__emp_code']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrHR()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminAttendanceCreateUpdateSerializer
        return AttendanceSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Attendance.objects.none()

        queryset = Attendance.objects.select_related('employee', 'employee__user').all()

        # Non-admin users are restricted to their own attendance
        if user.role != 'ADMIN' and not user.is_staff:
            queryset = queryset.filter(employee__user=user)

        # Filters for Date, Employee, Status, Weekly
        emp_id = self.request.query_params.get('employee_id')
        date_str = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        status_param = self.request.query_params.get('status')
        filter_period = self.request.query_params.get('period') # 'daily', 'weekly', 'monthly'

        if emp_id and (user.role == 'ADMIN' or user.is_staff):
            queryset = queryset.filter(employee_id=emp_id)

        if date_str:
            queryset = queryset.filter(date=date_str)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)

        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        if filter_period == 'weekly':
            today = timezone.localdate()
            start_of_week = today - timedelta(days=today.weekday())
            queryset = queryset.filter(date__gte=start_of_week, date__lte=today)
        elif filter_period == 'daily':
            queryset = queryset.filter(date=timezone.localdate())

        return queryset


class CheckInView(views.APIView):
    """
    Employee action: Records clock-in time for today.
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

        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        today = timezone.localdate()
        current_time = timezone.localtime().time()

        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={
                'check_in': current_time,
                'status': AttendanceStatus.PRESENT,
                'notes': serializer.validated_data.get('notes', '')
            }
        )

        if not created:
            if attendance.check_in:
                return Response(
                    {"detail": f"Already checked in today at {attendance.check_in.strftime('%H:%M:%S')}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            attendance.check_in = current_time
            if serializer.validated_data.get('notes'):
                attendance.notes = serializer.validated_data['notes']
            attendance.save()

        return Response({
            "message": "Check-in successful",
            "attendance": AttendanceSerializer(attendance).data
        }, status=status.HTTP_200_OK)


class CheckOutView(views.APIView):
    """
    Employee action: Records clock-out time for today.
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

        serializer = CheckOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        today = timezone.localdate()
        current_time = timezone.localtime().time()

        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response(
                {"detail": "No check-in record found for today. Please check-in first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attendance.check_out:
            return Response(
                {"detail": f"Already checked out today at {attendance.check_out.strftime('%H:%M:%S')}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.check_out = current_time
        if serializer.validated_data.get('notes'):
            attendance.notes = f"{attendance.notes} | Out: {serializer.validated_data['notes']}".strip(" |")

        # Auto-compute Half-day status if under 4 hours
        if attendance.total_hours is not None and attendance.total_hours < 4.0:
            attendance.status = AttendanceStatus.HALF_DAY

        attendance.save()

        return Response({
            "message": "Check-out successful",
            "attendance": AttendanceSerializer(attendance).data
        }, status=status.HTTP_200_OK)


class MyAttendanceHistoryView(views.APIView):
    """
    Employee view to fetch their personal attendance history with date range filtering.
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

        queryset = Attendance.objects.filter(employee=employee).order_by('-date')

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        period = request.query_params.get('period')

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        if period == 'weekly':
            today = timezone.localdate()
            start_of_week = today - timedelta(days=today.weekday())
            queryset = queryset.filter(date__gte=start_of_week, date__lte=today)
        elif period == 'monthly':
            today = timezone.localdate()
            first_of_month = today.replace(day=1)
            queryset = queryset.filter(date__gte=first_of_month, date__lte=today)

        serializer = AttendanceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
