# app/dao/application_dao.py
#
# Raw SQL operations for applications table.
# Supports multi-user isolation by enforcing user_id on every operation.

import json
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.db import get_connection


def _format_app_row(row: Optional[dict]) -> Optional[dict]:
    if not row:
        return None
    res = dict(row)
    raw_meta = res.get("metadata")
    if raw_meta and isinstance(raw_meta, str):
        try:
            res["metadata"] = json.loads(raw_meta)
        except Exception:
            pass
    return res


def get_applications_by_user_id(user_id: int) -> List[dict]:
    """Retrieves all scheme applications owned by the authenticated user."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT a.*, s.name as scheme_name, s.category, s.benefits, s.application_url
            FROM applications a
            LEFT JOIN schemes s ON a.scheme_id = s.id OR a.external_scheme_id = s.external_scheme_id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC, a.id DESC
        """
        cursor.execute(sql, (user_id,))
        rows = cursor.fetchall()
        return [_format_app_row(r) for r in rows]
    finally:
        conn.close()


def get_application_by_id(application_id: str, user_id: int) -> Optional[dict]:
    """Retrieves single application by its public application_id, scoped strictly to user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT a.*, s.name as scheme_name, s.category, s.benefits, s.application_url
            FROM applications a
            LEFT JOIN schemes s ON a.scheme_id = s.id OR a.external_scheme_id = s.external_scheme_id
            WHERE (a.application_id = %s OR CAST(a.id AS CHAR) = %s) AND a.user_id = %s
            LIMIT 1
        """
        cursor.execute(sql, (application_id, application_id, user_id))
        row = cursor.fetchone()
        return _format_row_single(row)
    finally:
        conn.close()


def _format_row_single(row: Optional[dict]) -> Optional[dict]:
    return _format_app_row(row)


def create_application(
    user_id: int,
    external_scheme_id: str,
    status: str = "planning",
    metadata: Optional[Dict[str, Any]] = None,
    scheme_id: Optional[int] = None,
    application_id: Optional[str] = None
) -> dict:
    """Creates a new tracked scheme application for a user."""
    if not application_id:
        application_id = f"APP-{uuid.uuid4().hex[:10].upper()}"

    # Resolve scheme_id if not explicitly provided
    if scheme_id is None:
        from app.dao import scheme_dao
        sc = scheme_dao.get_scheme_by_external_id(external_scheme_id)
        if sc:
            scheme_id = sc["id"]

    meta_json = json.dumps(metadata) if metadata else None

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            INSERT INTO applications (application_id, user_id, scheme_id, external_scheme_id, status, metadata)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (application_id, user_id, scheme_id, external_scheme_id, status, meta_json))
        conn.commit()
        return get_application_by_id(application_id, user_id)
    finally:
        conn.close()


def update_application_status(
    application_id: str,
    user_id: int,
    status: str,
    applied_date: Optional[str] = None
) -> Optional[dict]:
    """Updates status of an application scoped strictly to user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        if status == "applied_by_user" and not applied_date:
            applied_date = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        sql = """
            UPDATE applications
            SET status = %s, applied_date = COALESCE(%s, applied_date)
            WHERE (application_id = %s OR CAST(id AS CHAR) = %s) AND user_id = %s
        """
        cursor.execute(sql, (status, applied_date, application_id, application_id, user_id))
        conn.commit()
        return get_application_by_id(application_id, user_id)
    finally:
        conn.close()


def delete_application(application_id: str, user_id: int) -> bool:
    """Deletes an application belonging to user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            DELETE FROM applications
            WHERE (application_id = %s OR CAST(id AS CHAR) = %s) AND user_id = %s
        """
        cursor.execute(sql, (application_id, application_id, user_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
