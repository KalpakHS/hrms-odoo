from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveViewSet, ApplyLeaveView, MyLeavesView

router = DefaultRouter()
router.register(r'requests', LeaveViewSet, basename='leave-requests')

urlpatterns = [
    path('apply/', ApplyLeaveView.as_view(), name='leave_apply'),
    path('my-leaves/', MyLeavesView.as_view(), name='leave_my_leaves'),
    path('', include(router.urls)),
]
