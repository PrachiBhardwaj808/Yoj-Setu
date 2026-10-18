# app/schemas/scheme_schemas.py
#
# Pydantic schemas for government schemes, rules, eligibility, and recommendations.

from pydantic import BaseModel, model_validator
from typing import Optional, Any


class SchemeRuleModel(BaseModel):
    field_name: str
    operator: str
    field_value: str
    is_mandatory: bool = True
    raw_condition_text: Optional[str] = None


class SchemeDocumentModel(BaseModel):
    document_name: str
    is_mandatory: bool = True
    description: Optional[str] = None


class SchemeResponse(BaseModel):
    id: int
    external_scheme_id: str
    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[str] = None
    benefitAmount: Optional[str] = None
    category: Optional[str] = None
    government_level: Optional[str] = "Central"
    state: Optional[str] = "All India"
    department: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    application_url: Optional[str] = None
    application_method: Optional[str] = "Online"
    status: Optional[str] = "Active"
    rules: Optional[list[SchemeRuleModel]] = []
    documents: Optional[list[SchemeDocumentModel]] = []

    @model_validator(mode="before")
    @classmethod
    def populate_dual_attributes(cls, data: Any) -> Any:
        if isinstance(data, dict):
            name_val = data.get("name") or data.get("title") or ""
            data["name"] = name_val
            data["title"] = name_val

            ben_val = data.get("benefits") or data.get("benefitAmount") or data.get("benefit") or ""
            data["benefits"] = ben_val
            data["benefitAmount"] = ben_val
        return data


SchemeDetailResponse = SchemeResponse



class RecommendationRequest(BaseModel):
    profile: dict


class ConditionResultModel(BaseModel):
    field: str
    user_value: Any
    required: Any
    status: str
    description: str


class DocumentStatusModel(BaseModel):
    name: str
    is_mandatory: bool
    is_available: bool
    status: str


class SchemeRecommendationItem(BaseModel):
    scheme_id: int
    external_scheme_id: str
    scheme_name: str
    name: Optional[str] = None
    title: Optional[str] = None
    category: str
    benefit: str
    benefits: Optional[str] = None
    benefitAmount: Optional[str] = None
    status: str
    match_score: int
    priority: int
    reason: str
    document_readiness_score: int
    passed_conditions: list[dict] = []
    failed_conditions: list[dict] = []
    missing_information: list[str] = []
    documents: list[dict] = []
    source_url: Optional[str] = None
    application_url: Optional[str] = None
    department: Optional[str] = None
    government_level: Optional[str] = "Central"
    state: Optional[str] = "All India"

    @model_validator(mode="before")
    @classmethod
    def populate_item_dual_attributes(cls, data: Any) -> Any:
        if isinstance(data, dict):
            name_val = data.get("scheme_name") or data.get("name") or data.get("title") or ""
            data["scheme_name"] = name_val
            data["name"] = name_val
            data["title"] = name_val

            ben_val = data.get("benefit") or data.get("benefits") or data.get("benefitAmount") or ""
            data["benefit"] = ben_val
            data["benefits"] = ben_val
            data["benefitAmount"] = ben_val
        return data


class RecommendationResponse(BaseModel):
    total_evaluated: int
    eligible_count: int
    high_confidence_count: int
    more_to_explore_count: int
    recommendations: list[SchemeRecommendationItem]
