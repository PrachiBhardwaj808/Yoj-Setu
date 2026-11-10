# app/services/scheme_ingestion_service.py
#
# Service orchestrating government scheme ingestion, synchronization, and persistence.
# Implements idempotent upsert: updates existing scheme metadata, benefits, rules, and documents
# while preserving primary keys and application references.

from typing import Dict, Any, List
from app.dao import scheme_dao
from app.services.scheme_provider import get_scheme_provider


def ingest_schemes() -> int:
    """
    Fetches scheme data from active SchemeProvider (mock or official),
    upserts scheme records, and synchronizes rules and required documents.
    Returns total count of schemes ingested/updated.
    """
    provider = get_scheme_provider()
    raw_schemes = provider.fetch_all_schemes()
    ingested_count = 0

    for s in raw_schemes:
        ext_id = s["external_scheme_id"]
        existing = scheme_dao.get_scheme_by_external_id(ext_id)

        if existing:
            scheme_id = existing["id"]
            scheme_dao.update_scheme(
                scheme_id=scheme_id,
                name=s["name"],
                description=s["description"],
                benefits=s["benefits"],
                category=s["category"],
                government_level=s.get("government_level", "Central"),
                state=s.get("state", "All India"),
                department=s.get("department", "Government Department"),
                source_url=s.get("source_url", "https://myscheme.gov.in"),
                source_name=s.get("source_name", "MyScheme Portal"),
                application_url=s.get("application_url", "https://myscheme.gov.in"),
                application_method=s.get("application_method", "Online"),
                status=s.get("status", "Active")
            )
        else:
            scheme_id = scheme_dao.insert_scheme(
                external_scheme_id=ext_id,
                name=s["name"],
                description=s["description"],
                benefits=s["benefits"],
                category=s["category"],
                government_level=s.get("government_level", "Central"),
                state=s.get("state", "All India"),
                department=s.get("department", "Government Department"),
                source_url=s.get("source_url", "https://myscheme.gov.in"),
                source_name=s.get("source_name", "MyScheme Portal"),
                application_url=s.get("application_url", "https://myscheme.gov.in"),
                application_method=s.get("application_method", "Online"),
                status=s.get("status", "Active")
            )

        # Synchronize Rules: replace existing rules with latest provider definitions
        if "rules" in s and isinstance(s["rules"], list):
            scheme_dao.sync_scheme_rules(scheme_id, s["rules"])

        # Synchronize Documents: replace existing documents with latest provider definitions
        if "documents" in s and isinstance(s["documents"], list):
            scheme_dao.sync_scheme_documents(scheme_id, s["documents"])

        ingested_count += 1

    print(f"[ingestion] Successfully ingested and synchronized {ingested_count} government schemes.")
    return ingested_count


def seed_schemes_if_empty() -> None:
    """Helper called at startup to populate schemes table if empty."""
    existing = scheme_dao.get_all_schemes()
    if not existing:
        print("[startup] Schemes table empty. Running initial ingestion...")
        ingest_schemes()


class SchemeIngestionService:
    """Class wrapper for dependency injection or OOP invocation."""
    def ingest_schemes(self) -> int:
        return ingest_schemes()
