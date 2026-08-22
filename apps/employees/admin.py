from django.contrib import admin
from .models import (
    Company,
    Department,
    Designation,
    Employee,
    Skill,
    EmployeeSkill,
    EmployeeCertification,
    EmployeeDocument,
)


class EmployeeSkillInline(admin.TabularInline):
    model = EmployeeSkill
    extra = 1


class EmployeeCertificationInline(admin.TabularInline):
    model = EmployeeCertification
    extra = 1


class EmployeeDocumentInline(admin.TabularInline):
    model = EmployeeDocument
    extra = 1


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'contact_email', 'contact_phone')
    search_fields = ('name', 'code')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'created_at')
    list_filter = ('department',)
    search_fields = ('title',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'mobile', 'company', 'department', 'designation', 'joining_date', 'is_active')
    list_filter = ('company', 'department', 'designation', 'is_active', 'gender', 'marital_status')
    search_fields = ('first_name', 'last_name', 'email', 'mobile', 'user__login_id')
    date_hierarchy = 'joining_date'
    inlines = [EmployeeSkillInline, EmployeeCertificationInline, EmployeeDocumentInline]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    search_fields = ('name', 'category')


@admin.register(EmployeeCertification)
class EmployeeCertificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'employee', 'issuing_organization', 'issue_date', 'expiration_date')
    list_filter = ('issuing_organization',)
    search_fields = ('title', 'employee__first_name', 'employee__last_name', 'credential_id')


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'employee', 'document_type', 'uploaded_at')
    list_filter = ('document_type',)
    search_fields = ('title', 'employee__first_name', 'employee__last_name')
