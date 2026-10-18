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
