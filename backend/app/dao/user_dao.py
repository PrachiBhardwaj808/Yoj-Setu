# app/dao/user_dao.py
#
# Raw SQL operations for the `users` table.

from app.db import get_connection

def create_user(full_name: str, phone: str, email: str | None, password_hash: str, role: str = "citizen") -> dict:
    """
    Inserts a new user record into the users table using raw SQL.
    Returns the created user record.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            INSERT INTO users (full_name, phone, email, password_hash, is_phone_verified, role, is_active)
            VALUES (%s, %s, %s, %s, TRUE, %s, TRUE)
        """
        cursor.execute(sql, (full_name, phone, email, password_hash, role))
        conn.commit()
        user_id = cursor.lastrowid
        return get_user_by_id(user_id)
    finally:
        conn.close()

def get_user_by_phone(phone: str) -> dict | None:
    """Finds user by phone number."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE phone = %s LIMIT 1"
        cursor.execute(sql, (phone,))
        return cursor.fetchone()
    finally:
        conn.close()

def get_user_by_email(email: str) -> dict | None:
    """Finds user by email address."""
    if not email:
        return None
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE email = %s LIMIT 1"
        cursor.execute(sql, (email,))
        return cursor.fetchone()
    finally:
        conn.close()

def get_user_by_identifier(identifier: str) -> dict | None:
    """Finds user by phone OR email."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE phone = %s OR email = %s LIMIT 1"
        cursor.execute(sql, (identifier, identifier))
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
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "UPDATE users SET password_hash = %s WHERE phone = %s"
        cursor.execute(sql, (password_hash, phone))
        conn.commit()
    finally:
        conn.close()
