from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, MyProfileView

router = DefaultRouter()
router.register(r'', EmployeeViewSet, basename='employee')

urlpatterns = [
    path('profile/me/', MyProfileView.as_view(), name='employee_my_profile'),
    path('', include(router.urls)),
]
