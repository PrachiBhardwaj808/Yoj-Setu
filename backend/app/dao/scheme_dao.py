# app/dao/scheme_dao.py
#
# Raw SQL operations for schemes, scheme_rules, and scheme_documents.

from typing import Optional, List
from app.db import get_connection

def insert_scheme(
    external_scheme_id: str,
    name: str,
    description: str,
    benefits: str,
    category: str,
    government_level: str = "Central",
    state: str = "All India",
    department: str = "Ministry of Agriculture & Farmers Welfare",
    source_url: str = "https://myscheme.gov.in",
    source_name: str = "MyScheme Portal",
    application_url: str = "https://pmkisan.gov.in",
    application_method: str = "Online",
    status: str = "Active"
) -> int:
    """Inserts a new scheme record and returns its database ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            INSERT INTO schemes (
                external_scheme_id, name, description, benefits, category,
                government_level, state, department, source_url, source_name,
                application_url, application_method, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            external_scheme_id, name, description, benefits, category,
            government_level, state, department, source_url, source_name,
            application_url, application_method, status
        ))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()

def _normalize_row(row: dict | None) -> dict | None:
    if row is None:
        return None
    if "title" not in row or not row["title"]:
        row["title"] = row.get("name", "")
    if "benefitAmount" not in row or not row["benefitAmount"]:
        row["benefitAmount"] = row.get("benefits", "")
    return row

def get_all_schemes(category: Optional[str] = None, state: Optional[str] = None, status: Optional[str] = "Active") -> List[dict]:
    """Fetches schemes from database with optional category, state, and status filtering."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        conditions = []
        params = []
        
        if status and isinstance(status, str):
            conditions.append("status = %s")
            params.append(status)
            
        if category and isinstance(category, str) and category.lower() != "all":
            conditions.append("LOWER(category) = %s")
            params.append(category.lower())
            
        if state and isinstance(state, str) and state.lower() not in ["all", "all india"]:
            conditions.append("(LOWER(state) = %s OR LOWER(state) = 'all india')")
            params.append(state.lower())
            
        where_clause = (" WHERE " + " AND ".join(conditions)) if conditions else ""
        sql = f"SELECT * FROM schemes{where_clause} ORDER BY id ASC"
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [_normalize_row(r) for r in rows]
    finally:
        conn.close()

def get_scheme_by_id(scheme_id: int) -> dict | None:
    """Fetches scheme by primary key ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM schemes WHERE id = %s LIMIT 1"
        cursor.execute(sql, (scheme_id,))
        row = cursor.fetchone()
        return _normalize_row(row)
    finally:
        conn.close()

def get_scheme_by_external_id(external_id: str) -> dict | None:
    """Fetches scheme by external_scheme_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM schemes WHERE external_scheme_id = %s LIMIT 1"
        cursor.execute(sql, (external_id,))
        row = cursor.fetchone()
        return _normalize_row(row)
    finally:
        conn.close()

def insert_scheme_rule(scheme_id: int, field_name: str, operator: str, field_value: str, is_mandatory: bool = True, raw_text: str = "") -> int:
    """Inserts a structured eligibility rule for a scheme."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            INSERT INTO scheme_rules (scheme_id, field_name, operator, field_value, is_mandatory, raw_condition_text)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (scheme_id, field_name, operator, str(field_value), is_mandatory, raw_text))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()

def get_scheme_rules(scheme_id: int) -> List[dict]:
    """Fetches all structured eligibility rules for a scheme."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM scheme_rules WHERE scheme_id = %s"
        cursor.execute(sql, (scheme_id,))
        return cursor.fetchall()
    finally:
        conn.close()

# Alias for backwards compatibility
get_rules_for_scheme = get_scheme_rules


def get_rules_for_schemes(scheme_ids: List[int]) -> dict:
    """Batch fetches all rules for multiple scheme IDs in a single query."""
    if not scheme_ids:
        return {}
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        placeholders = ", ".join(["%s"] * len(scheme_ids))
        sql = f"SELECT * FROM scheme_rules WHERE scheme_id IN ({placeholders}) ORDER BY scheme_id ASC, id ASC"
        cursor.execute(sql, tuple(scheme_ids))
        rows = cursor.fetchall()
        result = {sid: [] for sid in scheme_ids}
        for r in rows:
            sid = r["scheme_id"]
            if sid in result:
                result[sid].append(r)
        return result
    finally:
        conn.close()


def insert_scheme_document(scheme_id: int, document_name: str, is_mandatory: bool = True, description: str = "") -> int:
    """Inserts a required document for a scheme."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            INSERT INTO scheme_documents (scheme_id, document_name, is_mandatory, description)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (scheme_id, document_name, is_mandatory, description))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()

def get_scheme_documents(scheme_id: int) -> List[dict]:
    """Fetches all required documents for a scheme."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM scheme_documents WHERE scheme_id = %s"
        cursor.execute(sql, (scheme_id,))
        return cursor.fetchall()
    finally:
        conn.close()

# Alias for backwards compatibility
get_documents_for_scheme = get_scheme_documents


def get_documents_for_schemes(scheme_ids: List[int]) -> dict:
    """Batch fetches all documents for multiple scheme IDs in a single query."""
    if not scheme_ids:
        return {}
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        placeholders = ", ".join(["%s"] * len(scheme_ids))
        sql = f"SELECT * FROM scheme_documents WHERE scheme_id IN ({placeholders}) ORDER BY scheme_id ASC, id ASC"
        cursor.execute(sql, tuple(scheme_ids))
        rows = cursor.fetchall()
        result = {sid: [] for sid in scheme_ids}
        for r in rows:
            sid = r["scheme_id"]
            if sid in result:
                result[sid].append(r)
        return result
    finally:
        conn.close()


def update_scheme(
    scheme_id: int,
    name: str,
    description: str,
    benefits: str,
    category: str,
    government_level: str = "Central",
    state: str = "All India",
    department: str = "Ministry of Agriculture & Farmers Welfare",
    source_url: str = "https://myscheme.gov.in",
    source_name: str = "MyScheme Portal",
    application_url: str = "https://pmkisan.gov.in",
    application_method: str = "Online",
    status: str = "Active"
) -> bool:
    """Updates an existing scheme by ID, preserving foreign key relationships and application references."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            UPDATE schemes SET
                name = %s, description = %s, benefits = %s, category = %s,
                government_level = %s, state = %s, department = %s,
                source_url = %s, source_name = %s, application_url = %s,
                application_method = %s, status = %s
            WHERE id = %s
        """
        cursor.execute(sql, (
            name, description, benefits, category,
            government_level, state, department,
            source_url, source_name, application_url,
            application_method, status, scheme_id
        ))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def sync_scheme_rules(scheme_id: int, rules: List[dict]) -> None:
    """
    Synchronizes rules for a scheme.
    Replaces existing rules with updated rule definitions without duplicating.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("DELETE FROM scheme_rules WHERE scheme_id = %s", (scheme_id,))
        for r in rules:
            sql = """
                INSERT INTO scheme_rules (scheme_id, field_name, operator, field_value, is_mandatory, raw_condition_text)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                scheme_id,
                r["field_name"],
                r["operator"],
                str(r["field_value"]),
                bool(r.get("is_mandatory", True)),
                r.get("raw_text") or r.get("raw_condition_text", "")
            ))
        conn.commit()
    finally:
        conn.close()


def sync_scheme_documents(scheme_id: int, documents: List[dict]) -> None:
    """
    Synchronizes required documents for a scheme.
    Replaces existing documents with updated definitions without duplicating.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("DELETE FROM scheme_documents WHERE scheme_id = %s", (scheme_id,))
        for d in documents:
            sql = """
                INSERT INTO scheme_documents (scheme_id, document_name, is_mandatory, description)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                scheme_id,
                d["document_name"],
                bool(d.get("is_mandatory", True)),
                d.get("description", "")
            ))
        conn.commit()
    finally:
        conn.close()
