# app/dao/user_document_dao.py
#
# Raw SQL operations for user_documents table.
# Stores document metadata, file paths, and verification status without storing sensitive binary blobs.
# Enforces multi-user isolation by user_id on every operation.

import json
import uuid
from typing import Optional, List, Dict, Any
from app.db import get_connection


def _format_doc_row(row: Optional[dict]) -> Optional[dict]:
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


def get_documents_by_user_id(user_id: int) -> List[dict]:
    """Retrieves all documents owned by user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM user_documents WHERE user_id = %s ORDER BY created_at DESC, id DESC"
        cursor.execute(sql, (user_id,))
        rows = cursor.fetchall()
        return [_format_doc_row(r) for r in rows]
    finally:
        conn.close()


def get_document_by_id(document_id: str, user_id: int) -> Optional[dict]:
    """Retrieves single document metadata, strictly scoped to user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT * FROM user_documents
            WHERE (document_id = %s OR CAST(id AS CHAR) = %s) AND user_id = %s
            LIMIT 1
        """
        cursor.execute(sql, (document_id, document_id, user_id))
        row = cursor.fetchone()
        return _format_doc_row(row)
    finally:
        conn.close()


def upsert_document_metadata(
    user_id: int,
    document_type: str,
    document_name: str,
    file_path: Optional[str] = None,
    file_size: Optional[int] = None,
    mime_type: Optional[str] = None,
    verification_status: str = "pending",
    metadata: Optional[Dict[str, Any]] = None,
    document_id: Optional[str] = None
) -> dict:
    """Inserts or updates document metadata for user_id."""
    if not document_id:
        document_id = f"DOC-{uuid.uuid4().hex[:10].upper()}"

    meta_json = json.dumps(metadata) if metadata else None

    # Check if a document of this type already exists for this user
    existing = None
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM user_documents WHERE user_id = %s AND (document_id = %s OR document_type = %s) LIMIT 1",
            (user_id, document_id, document_type)
        )
        existing = cursor.fetchone()

        if existing:
            target_id = existing["document_id"]
            sql = """
                UPDATE user_documents
                SET document_name = %s,
                    file_path = COALESCE(%s, file_path),
                    file_size = COALESCE(%s, file_size),
                    mime_type = COALESCE(%s, mime_type),
                    verification_status = %s,
                    metadata = COALESCE(%s, metadata)
                WHERE document_id = %s AND user_id = %s
            """
            cursor.execute(sql, (document_name, file_path, file_size, mime_type, verification_status, meta_json, target_id, user_id))
            conn.commit()
            return get_document_by_id(target_id, user_id)
        else:
            sql = """
                INSERT INTO user_documents (
                    document_id, user_id, document_type, document_name,
                    file_path, file_size, mime_type, verification_status, metadata
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (document_id, user_id, document_type, document_name, file_path, file_size, mime_type, verification_status, meta_json))
            conn.commit()
            return get_document_by_id(document_id, user_id)
    finally:
        conn.close()


def update_document_status(
    document_id: str,
    user_id: int,
    verification_status: str
) -> Optional[dict]:
    """Updates verification status of a document owned by user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            UPDATE user_documents
            SET verification_status = %s
            WHERE (document_id = %s OR CAST(id AS CHAR) = %s) AND user_id = %s
        """
        cursor.execute(sql, (verification_status, document_id, document_id, user_id))
        conn.commit()
        return get_document_by_id(document_id, user_id)
    finally:
        conn.close()


def delete_document(document_id: str, user_id: int) -> bool:
    """Deletes a document owned by user_id."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        sql = """
            DELETE FROM user_documents
            WHERE (document_id = %s OR CAST(id AS CHAR) = %s) AND user_id = %s
        """
        cursor.execute(sql, (document_id, document_id, user_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
