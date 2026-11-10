# app/dao/user_dao.py
#
# Raw SQL operations for the `users` table.

from app.db import get_connection

def create_user(
    full_name: str,
    phone: str,
    email: str | None,
    password_hash: str,
    role: str = "citizen",
    onboarding_complete: bool = False
) -> dict:
    """
    Inserts a new user record into the users table using raw SQL.
    Normalizes phone number to E.164 and persists onboarding_complete.
    Returns the created user record.
    """
    from app.services.otp_service import format_phone
    normalized_phone = format_phone(phone)
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            INSERT INTO users (full_name, phone, email, password_hash, is_phone_verified, role, is_active, onboarding_complete)
            VALUES (%s, %s, %s, %s, TRUE, %s, TRUE, %s)
        """
        cursor.execute(sql, (full_name, normalized_phone, email, password_hash, role, onboarding_complete))
        conn.commit()
        user_id = cursor.lastrowid
        return get_user_by_id(user_id)
    finally:
        conn.close()

def get_user_by_phone(phone: str) -> dict | None:
    """Finds user by phone number using normalized and raw formats."""
    if not phone:
        return None
    from app.services.otp_service import format_phone
    normalized_phone = format_phone(phone)
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE phone = %s OR phone = %s LIMIT 1"
        cursor.execute(sql, (normalized_phone, phone.strip()))
        return cursor.fetchone()
    finally:
        conn.close()

def get_user_by_email(email: str) -> dict | None:
    """Finds user by email address (case-insensitive)."""
    if not email:
        return None
    clean_email = email.strip()
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(%s) LIMIT 1"
        cursor.execute(sql, (clean_email,))
        return cursor.fetchone()
    finally:
        conn.close()

def get_user_by_identifier(identifier: str) -> dict | None:
    """
    Finds user by phone OR email.
    If identifier has '@', performs email lookup.
    Otherwise normalizes phone (supporting 10-digit, +91, and international numbers).
    """
    if not identifier:
        return None
    ident = identifier.strip()
    if "@" in ident:
        return get_user_by_email(ident)

    from app.services.otp_service import format_phone
    normalized_phone = format_phone(ident)
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE phone = %s OR phone = %s OR email = %s LIMIT 1"
        cursor.execute(sql, (normalized_phone, ident, ident))
        return cursor.fetchone()
    finally:
        conn.close()

def get_user_by_id(user_id: int) -> dict | None:
    """Finds user by primary key ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE id = %s LIMIT 1"
        cursor.execute(sql, (user_id,))
        return cursor.fetchone()
    finally:
        conn.close()

def update_user_password(phone: str, password_hash: str) -> None:
    """Updates user password hash by phone number."""
    from app.services.otp_service import format_phone
    normalized_phone = format_phone(phone)
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "UPDATE users SET password_hash = %s WHERE phone = %s OR phone = %s"
        cursor.execute(sql, (password_hash, normalized_phone, phone.strip()))
        conn.commit()
    finally:
        conn.close()

def update_user_onboarding(user_id: int, completed: bool = True) -> None:
    """Updates user onboarding_complete status in the database."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "UPDATE users SET onboarding_complete = %s WHERE id = %s"
        cursor.execute(sql, (completed, user_id))
        conn.commit()
    finally:
        conn.close()
