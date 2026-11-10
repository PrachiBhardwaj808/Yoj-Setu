# app/dao/citizen_profile_dao.py
#
# Raw SQL operations for citizen_profiles table.
# Supports SQLite and MySQL with multi-user isolation by user_id.

import json
from decimal import Decimal
from typing import Optional, Dict, Any
from app.db import get_connection


def _serialize_profile_fields(data: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts known columns and packs any extra fields into raw_details JSON."""
    known_keys = {
        "full_name", "date_of_birth", "age", "gender", "state", "district",
        "block", "village_city", "pincode", "rural_urban", "annual_income",
        "occupation", "education", "social_category", "marital_status",
        "family_size", "children_count", "disability_status",
        "disability_percentage", "bpl_status", "minority_status", "housing_status"
    }
    extracted = {}
    extra = {}
    for k, v in data.items():
        if k in known_keys:
            extracted[k] = v
        elif k not in ("id", "user_id", "created_at", "updated_at", "raw_details"):
            extra[k] = v

    # Convert numeric fields
    if "age" in extracted and extracted["age"] not in (None, ""):
        try:
            extracted["age"] = int(extracted["age"])
        except (ValueError, TypeError):
            extracted["age"] = None

    if "annual_income" in extracted and extracted["annual_income"] not in (None, ""):
        try:
            extracted["annual_income"] = float(extracted["annual_income"])
        except (ValueError, TypeError):
            extracted["annual_income"] = 0.0

    if "family_size" in extracted and extracted["family_size"] not in (None, ""):
        try:
            extracted["family_size"] = int(extracted["family_size"])
        except (ValueError, TypeError):
            extracted["family_size"] = 1

    if "children_count" in extracted and extracted["children_count"] not in (None, ""):
        try:
            extracted["children_count"] = int(extracted["children_count"])
        except (ValueError, TypeError):
            extracted["children_count"] = 0

    if "disability_percentage" in extracted and extracted["disability_percentage"] not in (None, ""):
        try:
            extracted["disability_percentage"] = float(extracted["disability_percentage"])
        except (ValueError, TypeError):
            extracted["disability_percentage"] = None

    extracted["raw_details"] = json.dumps(extra) if extra else None
    return extracted


def _format_row(row: Optional[dict]) -> Optional[dict]:
    if not row:
        return None
    res = dict(row)
    # Convert Decimal to float for JSON serializability
    if isinstance(res.get("annual_income"), Decimal):
        res["annual_income"] = float(res["annual_income"])
    # Merge unpacked raw_details
    raw = res.get("raw_details")
    if raw and isinstance(raw, str):
        try:
            extra = json.loads(raw)
            if isinstance(extra, dict):
                for k, v in extra.items():
                    if k not in res:
                        res[k] = v
        except Exception:
            pass
    return res


def get_profile_by_user_id(user_id: int) -> Optional[dict]:
    """Fetches citizen profile for the specified user_id (strict isolation)."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM citizen_profiles WHERE user_id = %s LIMIT 1"
        cursor.execute(sql, (user_id,))
        row = cursor.fetchone()
        return _format_row(row)
    finally:
        conn.close()


def upsert_profile(user_id: int, profile_data: Dict[str, Any]) -> dict:
    """
    Inserts or updates the citizen profile for user_id.
    Standard ANSI SQL ensuring cross-database compatibility without dialect collision.
    """
    fields = _serialize_profile_fields(profile_data)
    existing = get_profile_by_user_id(user_id)

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        if existing:
            set_clauses = []
            params = []
            for col, val in fields.items():
                set_clauses.append(f"{col} = %s")
                params.append(val)
            params.append(user_id)
            sql = f"UPDATE citizen_profiles SET {', '.join(set_clauses)} WHERE user_id = %s"
            cursor.execute(sql, params)
        else:
            cols = ["user_id"] + list(fields.keys())
            placeholders = ["%s"] * len(cols)
            params = [user_id] + list(fields.values())
            sql = f"INSERT INTO citizen_profiles ({', '.join(cols)}) VALUES ({', '.join(placeholders)})"
            cursor.execute(sql, params)
        conn.commit()
        return get_profile_by_user_id(user_id)
    finally:
        conn.close()


def delete_profile(user_id: int) -> bool:
    """Deletes citizen profile by user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "DELETE FROM citizen_profiles WHERE user_id = %s"
        cursor.execute(sql, (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
