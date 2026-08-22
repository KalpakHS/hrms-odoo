from django.conf import settings
from django.db import models


class Company(models.Model):
    """Company / Organization entity."""
    name = models.CharField(max_length=150, unique=True, verbose_name='Company Name')
    code = models.CharField(
        max_length=10,
        unique=True,
        verbose_name='Company Code',
        help_text='2-4 letter code (e.g. OI for Odoo India) used for Login ID generation',
    )
    contact_email = models.EmailField(blank=True, null=True, verbose_name='Contact Email')
    contact_phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Contact Phone')
    address = models.TextField(blank=True, null=True, verbose_name='Office Address')
    website = models.URLField(blank=True, null=True, verbose_name='Website URL')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Department(models.Model):
    """Department inside a company (e.g., Engineering, HR, Sales, Finance)."""
    name = models.CharField(max_length=100, unique=True, verbose_name='Department Name')
    code = models.CharField(max_length=20, unique=True, verbose_name='Department Code')
    description = models.TextField(blank=True, null=True, verbose_name='Description')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['name']

    def __str__(self):
        return self.name


class Designation(models.Model):
    """Designation / Job Title associated with a department."""
    title = models.CharField(max_length=100, verbose_name='Designation Title')
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='designations',
        verbose_name='Department',
    )
    description = models.TextField(blank=True, null=True, verbose_name='Job Description')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Designation'
        verbose_name_plural = 'Designations'
        unique_together = ('title', 'department')
        ordering = ['department', 'title']

    def __str__(self):
        return f"{self.title} ({self.department.name})"


class Employee(models.Model):
    """
    Main Employee Profile model for Dayflow HRMS.
    Linked 1-to-1 with custom User model.
    """

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    class MaritalStatus(models.TextChoices):
        SINGLE = 'SINGLE', 'Single'
        MARRIED = 'MARRIED', 'Married'
        DIVORCED = 'DIVORCED', 'Divorced'
        WIDOWED = 'WIDOWED', 'Widowed'

    # User Account link
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_profile',
        verbose_name='User Account',
    )

    # Job / Company Details
    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name='employees',
        verbose_name='Company',
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name='Department',
    )
    designation = models.ForeignKey(
        Designation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name='Designation / Role',
    )
    joining_date = models.DateField(verbose_name='Joining Date', db_index=True)

    # Basic & Contact Information
    first_name = models.CharField(max_length=50, verbose_name='First Name')
    last_name = models.CharField(max_length=50, verbose_name='Last Name')
    email = models.EmailField(unique=True, verbose_name='Work Email')
    mobile = models.CharField(max_length=20, verbose_name='Mobile Number')
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name='Profile Picture / Avatar',
    )

    # Personal Information
    date_of_birth = models.DateField(null=True, blank=True, verbose_name='Date of Birth')
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
        null=True,
        verbose_name='Gender',
    )
    marital_status = models.CharField(
        max_length=20,
        choices=MaritalStatus.choices,
        blank=True,
        null=True,
        verbose_name='Marital Status',
    )
    blood_group = models.CharField(max_length=10, blank=True, null=True, verbose_name='Blood Group')
    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Emergency Contact Name',
    )
    emergency_contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Emergency Contact Phone',
    )

    # Address Details
    address = models.TextField(blank=True, null=True, verbose_name='Street Address')
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name='City')
    state = models.CharField(max_length=100, blank=True, null=True, verbose_name='State / Province')
    country = models.CharField(max_length=100, default='India', verbose_name='Country')
    postal_code = models.CharField(max_length=20, blank=True, null=True, verbose_name='Postal / Zip Code')

    # Status & Timestamps
    is_active = models.BooleanField(default=True, verbose_name='Is Active Employee')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        ordering = ['first_name', 'last_name']
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        login_id = self.user.login_id if self.user_id else "N/A"
        return f"{self.first_name} {self.last_name} ({login_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def login_id(self):
        return self.user.login_id if self.user_id else ""


class Skill(models.Model):
    """Skill master catalog (e.g. Python, Django, React, AWS, UI/UX)."""
    name = models.CharField(max_length=100, unique=True, verbose_name='Skill Name')
    category = models.CharField(max_length=50, blank=True, null=True, verbose_name='Skill Category')

    class Meta:
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        ordering = ['name']

    def __str__(self):
        return self.name


class EmployeeSkill(models.Model):
    """Mapping of skills possessed by an employee with proficiency rating."""

    class Proficiency(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='skills',
        verbose_name='Employee',
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='employee_skills',
        verbose_name='Skill',
    )
    proficiency_level = models.CharField(
        max_length=20,
        choices=Proficiency.choices,
        default=Proficiency.INTERMEDIATE,
        verbose_name='Proficiency Level',
    )
    years_of_experience = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=0.0,
        verbose_name='Years of Experience',
    )

    class Meta:
        verbose_name = 'Employee Skill'
        verbose_name_plural = 'Employee Skills'
        unique_together = ('employee', 'skill')

    def __str__(self):
        return f"{self.employee.full_name} - {self.skill.name} ({self.get_proficiency_level_display()})"


class EmployeeCertification(models.Model):
    """Certifications earned by an employee."""
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='certifications',
        verbose_name='Employee',
    )
    title = models.CharField(max_length=200, verbose_name='Certification Title')
    issuing_organization = models.CharField(max_length=200, verbose_name='Issuing Organization')
    issue_date = models.DateField(verbose_name='Issue Date')
    expiration_date = models.DateField(null=True, blank=True, verbose_name='Expiration Date')
    credential_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='Credential ID')
    credential_url = models.URLField(blank=True, null=True, verbose_name='Credential URL')
    certificate_file = models.FileField(
        upload_to='certifications/',
        null=True,
        blank=True,
        verbose_name='Certificate Document',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Employee Certification'
        verbose_name_plural = 'Employee Certifications'
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.title} - {self.employee.full_name}"


class EmployeeDocument(models.Model):
    """Documents and files belonging to an employee (Resume, ID proof, certificates)."""

    class DocumentType(models.TextChoices):
        RESUME = 'RESUME', 'Resume / CV'
        ID_PROOF = 'ID_PROOF', 'Identity Proof'
        OFFER_LETTER = 'OFFER_LETTER', 'Offer Letter'
        EXPERIENCE_LETTER = 'EXPERIENCE_LETTER', 'Experience Letter'
        EDUCATION = 'EDUCATION', 'Educational Certificate'
        OTHER = 'OTHER', 'Other Document'

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Employee',
    )
    title = models.CharField(max_length=200, verbose_name='Document Title')
    document_type = models.CharField(
        max_length=50,
        choices=DocumentType.choices,
        default=DocumentType.RESUME,
        verbose_name='Document Type',
    )
    file = models.FileField(upload_to='documents/', verbose_name='File')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Employee Document'
        verbose_name_plural = 'Employee Documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.get_document_type_display()}: {self.title} ({self.employee.full_name})"
