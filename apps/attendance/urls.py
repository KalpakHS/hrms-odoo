from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendanceViewSet,
    CheckInView,
    CheckOutView,
    MyAttendanceHistoryView
)

router = DefaultRouter()
router.register(r'logs', AttendanceViewSet, basename='attendance-logs')

urlpatterns = [
    path('check-in/', CheckInView.as_view(), name='attendance_check_in'),
    path('check-out/', CheckOutView.as_view(), name='attendance_check_out'),
    path('my-history/', MyAttendanceHistoryView.as_view(), name='attendance_my_history'),
    path('', include(router.urls)),
]
