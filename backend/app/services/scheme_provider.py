# app/services/scheme_provider.py
#
# Provider architecture separating Official Government APIs from Mock Development Providers.

from abc import ABC, abstractmethod
from app.config import SCHEME_PROVIDER


class BaseSchemeProvider(ABC):
    """Abstract base class for government scheme providers."""

    @abstractmethod
    def fetch_all_schemes() -> list[dict]:
        """Fetches raw scheme records with metadata, rules, and documents."""
        pass


class OfficialSchemeProvider(BaseSchemeProvider):
    """Production provider consuming verified official government APIs/data sources (MyScheme / India.gov.in)."""

    def fetch_all_schemes(self) -> list[dict]:
        # Placeholder for production government API integration (e.g. https://api.myscheme.gov.in/v1/schemes)
        raise NotImplementedError("Official Government Scheme API credentials not configured. Switch to SCHEME_PROVIDER=mock for development.")


class MockSchemeProvider(BaseSchemeProvider):
    """Development provider returning verified, realistic Indian welfare schemes clearly marked for dev mode."""

    def fetch_all_schemes(self) -> list[dict]:
        return [
            {
                "external_scheme_id": "SCH-PM-KISAN-001",
                "name": "PM Kisan Samman Nidhi",
                "description": "Direct income support of ₹6,000 per year in three equal installments to small and marginal landholding farmer families.",
                "benefits": "₹6,000 / year direct transfer",
                "category": "Agriculture",
                "government_level": "Central",
                "state": "All India",
                "department": "Ministry of Agriculture & Farmers Welfare",
                "source_url": "https://pmkisan.gov.in",
                "source_name": "PM Kisan Portal",
                "application_url": "https://pmkisan.gov.in/RegistrationForm.aspx",
                "application_method": "Online",
                "status": "Active",
                "rules": [
                    {"field_name": "occupation", "operator": "IN", "field_value": "Farmer,Agricultural worker", "is_mandatory": True, "raw_text": "Must be a landholding farmer or agricultural worker"},
                    {"field_name": "annual_household_income", "operator": "<=", "field_value": "800000", "is_mandatory": True, "raw_text": "Annual household income below ₹8,00,000"}
                ],
                "documents": [
                    {"document_name": "Aadhaar Card", "is_mandatory": True, "description": "Mandatory for biometric/OTP KYC"},
                    {"document_name": "Bank Account", "is_mandatory": True, "description": "Jan Dhan / Savings account for DBT"},
                    {"document_name": "Land Document", "is_mandatory": True, "description": "RoR / Khasra land record copy"}
                ]
            },
            {
                "external_scheme_id": "SCH-AYUSHMAN-002",
                "name": "Ayushman Bharat (PM-JAY)",
                "description": "Health coverage of ₹5 Lakhs per family per year for secondary and tertiary care hospitalization across impaneled hospitals.",
                "benefits": "₹5 Lakhs health cover / year",
                "category": "Health",
                "government_level": "Central",
                "state": "All India",
                "department": "National Health Authority",
                "source_url": "https://pmjay.gov.in",
                "source_name": "PM-JAY Portal",
                "application_url": "https://setu.pmjay.gov.in",
                "application_method": "Online",
                "status": "Active",
                "rules": [
                    {"field_name": "annual_household_income", "operator": "<=", "field_value": "500000", "is_mandatory": True, "raw_text": "Annual household income under ₹5,00,000"},
                    {"field_name": "bpl_status", "operator": "IN", "field_value": "Yes,Not sure", "is_mandatory": False, "raw_text": "BPL or SECC 2011 priority household list"}
                ],
                "documents": [
                    {"document_name": "Aadhaar Card", "is_mandatory": True, "description": "ID verification for e-card generation"},
                    {"document_name": "Ration Card", "is_mandatory": False, "description": "Family identity proof"}
                ]
            },
            {
                "external_scheme_id": "SCH-SURYA-GHAR-003",
                "name": "PM Surya Ghar: Muft Bijli Yojana",
                "description": "Subsidy up to ₹78,000 for rooftop solar installation to provide up to 300 units free electricity per month.",
                "benefits": "Up to ₹78,000 solar subsidy",
                "category": "Housing & Solar",
                "government_level": "Central",
                "state": "All India",
                "department": "Ministry of New and Renewable Energy",
                "source_url": "https://pmsuryaghar.gov.in",
                "source_name": "National Portal for Rooftop Solar",
                "application_url": "https://pmsuryaghar.gov.in",
                "application_method": "Online",
                "status": "Active",
                "rules": [
                    {"field_name": "housing_status", "operator": "IN", "field_value": "Own house,Government housing", "is_mandatory": True, "raw_text": "Must own house suitable for rooftop solar panel placement"}
                ],
                "documents": [
                    {"document_name": "Aadhaar Card", "is_mandatory": True, "description": "Applicant Identity Proof"},
                    {"document_name": "Electricity Bill", "is_mandatory": True, "description": "Recent DISCOM electricity consumer bill"}
                ]
            },
            {
                "external_scheme_id": "SCH-POST-MATRIC-004",
                "name": "Post-Matric Scholarship Scheme",
                "description": "100% tuition fee reimbursement and maintenance allowance for students pursuing Class 11 through university studies.",
                "benefits": "100% tuition + allowance",
                "category": "Education",
                "government_level": "Central",
                "state": "All India",
                "department": "Ministry of Social Justice & Empowerment",
                "source_url": "https://scholarships.gov.in",
                "source_name": "National Scholarship Portal",
                "application_url": "https://scholarships.gov.in",
                "application_method": "Online",
                "status": "Active",
                "rules": [
                    {"field_name": "age", "operator": "<=", "field_value": "35", "is_mandatory": True, "raw_text": "Age 35 years or under"},
                    {"field_name": "annual_household_income", "operator": "<=", "field_value": "250000", "is_mandatory": True, "raw_text": "Household annual income below ₹2.5 Lakhs"}
                ],
                "documents": [
                    {"document_name": "Income Certificate", "is_mandatory": True, "description": "Authorized tehsildar income certificate"},
                    {"document_name": "Caste Certificate", "is_mandatory": False, "description": "Required for reserved category scholarship streams"},
                    {"document_name": "Aadhaar Card", "is_mandatory": True, "description": "Student identity verification"}
                ]
            },
            {
                "external_scheme_id": "SCH-MGNREGA-005",
                "name": "MGNREGA Rural Employment Guarantee",
                "description": "Guaranteed 100 days of wage employment in a financial year for adult members of rural households.",
                "benefits": "100 days guaranteed wage labor",
                "category": "Employment",
                "government_level": "Central",
                "state": "All India",
                "department": "Ministry of Rural Development",
                "source_url": "https://nrega.nic.in",
                "source_name": "MGNREGA Official Portal",
                "application_url": "https://nrega.nic.in",
                "application_method": "Online",
                "status": "Active",
                "rules": [
                    {"field_name": "rural_urban", "operator": "==", "field_value": "Rural", "is_mandatory": True, "raw_text": "Must be resident of a rural area"},
                    {"field_name": "age", "operator": ">=", "field_value": "18", "is_mandatory": True, "raw_text": "Adult age 18 years or above"}
                ],
                "documents": [
                    {"document_name": "Aadhaar Card", "is_mandatory": True, "description": "Job card issue KYC"},
                    {"document_name": "Bank Account", "is_mandatory": True, "description": "Bank account for direct wage deposit"}
                ]
            },
            {
                "external_scheme_id": "SCH-PMAY-006",
                "name": "PM Awas Yojana (PMAY-Urban/Rural)",
                "description": "Financial assistance of up to ₹2.5 Lakhs for construction of pucca house for homeless and low-income families.",
                "benefits": "Up to ₹2.5 Lakhs house subsidy",
                "category": "Housing",
                "government_level": "Central",
                "state": "All India",
                "department": "Ministry of Housing and Urban Affairs",
                "source_url": "https://pmaymis.gov.in",
                "source_name": "PMAY Urban Portal",
                "application_url": "https://pmaymis.gov.in",
                "application_method": "Online",
                "status": "Active",
                "rules": [
                    {"field_name": "annual_household_income", "operator": "<=", "field_value": "600000", "is_mandatory": True, "raw_text": "Annual household income below ₹6 Lakhs"},
                    {"field_name": "housing_status", "operator": "IN", "field_value": "Rented,Homeless,Other,Kutcha House", "is_mandatory": True, "raw_text": "Family does not own a pucca house in India"}
                ],
                "documents": [
                    {"document_name": "Aadhaar Card", "is_mandatory": True, "description": "Primary applicant & family identity"},
                    {"document_name": "Income Certificate", "is_mandatory": True, "description": "Proof of household annual income"},
                    {"document_name": "Land Document", "is_mandatory": False, "description": "Construction site land title proof"}
                ]
            }
        ]
        for s in schemes:
            s["title"] = s.get("name", "")
            s["benefitAmount"] = s.get("benefits", "")
        return schemes


def get_scheme_provider() -> BaseSchemeProvider:
    """Factory function returning active scheme provider based on environment setting."""
    if SCHEME_PROVIDER == "official":
        return OfficialSchemeProvider()
    return MockSchemeProvider()
