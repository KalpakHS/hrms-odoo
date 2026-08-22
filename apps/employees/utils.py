"""
Helper utilities for employee login ID generation and initial passwords.
"""

import re
import secrets
import string


def extract_prefix(text, length=2):
    """Extracts first `length` alpha characters or fills with 'X'."""
    clean = re.sub(r'[^A-Za-z]', '', text or '').upper()
    if len(clean) >= length:
        return clean[:length]
    return (clean + 'X' * length)[:length]


def generate_employee_login_id(company_name_or_code, first_name, last_name, joining_year, serial_number=None):
    """
    Generates an employee Login ID based on the required format:
    [First two letters of company name/code]
    [First two letters of employee first name]
    [First two letters of employee last name]
    [4-digit joining year]
    [4-digit serial number]

    Examples:
    - Company: "Odoo India", First: "John", Last: "Doe", Year: 2026 -> OIJODO20260001
    - Company: "OI", First: "John", Last: "Doe", Year: 2022 -> OIJODO20220001
    - Single character / edge-case names: First: "J", Last: None, Year: 2026 -> OIJXXX20260001
    """
    from accounts.models import User

    raw_comp = (company_name_or_code or '').strip()
    words = [re.sub(r'[^A-Za-z]', '', w).upper() for w in raw_comp.split() if re.sub(r'[^A-Za-z]', '', w)]

    # If multi-word company (e.g. "Odoo India"), take first letter of each word
    if len(words) >= 2 and len(words[0]) >= 1 and len(words[1]) >= 1:
        comp_prefix = (words[0][0] + words[1][0]).upper()
    else:
        comp_prefix = extract_prefix(raw_comp, 2)

    first_prefix = extract_prefix(first_name, 2)
    last_prefix = extract_prefix(last_name, 2)
    year_str = f"{int(joining_year):04d}"[-4:]

    base_prefix = f"{comp_prefix}{first_prefix}{last_prefix}{year_str}"

    if serial_number is not None:
        return f"{base_prefix}{int(serial_number):04d}"

    # Query existing login IDs matching base prefix to find the highest serial
    existing_ids = list(
        User.objects.filter(login_id__startswith=base_prefix)
        .values_list('login_id', flat=True)
    )

    max_serial = 0
    for lid in existing_ids:
        suffix = lid[len(base_prefix):]
        if suffix.isdigit():
            max_serial = max(max_serial, int(suffix))

    next_serial = max_serial + 1
    candidate_id = f"{base_prefix}{next_serial:04d}"

    while User.objects.filter(login_id=candidate_id).exists():
        next_serial += 1
        candidate_id = f"{base_prefix}{next_serial:04d}"

    return candidate_id


def generate_initial_password(length=12):
    """
    Generates a secure temporary initial password containing uppercase,
    lowercase, digits, and punctuation symbols.
    """
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*'
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.isupper() for c in password)
                and any(c.islower() for c in password)
                and any(c.isdigit() for c in password)
                and any(c in '!@#$%^&*' for c in password)):
            return password
