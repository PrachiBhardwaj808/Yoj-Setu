# app/services/scheme_ingestion_service.py
#
# Service orchestrating government scheme ingestion, normalization, and persistence.

from app.dao import scheme_dao
from app.services.scheme_provider import get_scheme_provider


def ingest_schemes() -> int:
    """
    Fetches scheme data from active SchemeProvider (mock or official),
    normalizes the records, and updates the database.
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

        # Ingest Rules if not already present
        existing_rules = scheme_dao.get_rules_for_scheme(scheme_id)
        if not existing_rules and "rules" in s:
            for rule in s["rules"]:
                scheme_dao.insert_scheme_rule(
                    scheme_id=scheme_id,
                    field_name=rule["field_name"],
                    operator=rule["operator"],
                    field_value=str(rule["field_value"]),
                    is_mandatory=bool(rule.get("is_mandatory", True)),
                    raw_text=rule.get("raw_text", "")
                )

        # Ingest Documents if not already present
        existing_docs = scheme_dao.get_documents_for_scheme(scheme_id)
        if not existing_docs and "documents" in s:
            for doc in s["documents"]:
                scheme_dao.insert_scheme_document(
                    scheme_id=scheme_id,
                    document_name=doc["document_name"],
                    is_mandatory=bool(doc.get("is_mandatory", True)),
                    description=doc.get("description", "")
                )

        ingested_count += 1

    print(f"[ingestion] Successfully ingested {ingested_count} government schemes.")
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
