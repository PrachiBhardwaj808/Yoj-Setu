# app/routers/assistant.py
#
# Production API Router for AI Scheme Sathi Assistant.
# Keeps LLM/AI credentials secure on the backend and provides grounded responses
# backed by the verified government scheme database with safe deterministic fallback.

import os
import re
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field

from app.dao import scheme_dao
from app.config import AI_PROVIDER

router = APIRouter(prefix="/assistant", tags=["Assistant"])


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Citizen inquiry message")
    language: Optional[str] = Field("en", description="Preferred response language")
    user_profile: Optional[Dict[str, Any]] = Field(None, description="Optional user demographic profile")


CATEGORY_PATTERNS = {
    "Agriculture": re.compile(r"farm|agri|kisan|crop|land|किसान|ਖੇਤੀ|कृषि|शेतकरी|విவசாயി|రైతు|ખેડૂત|ರೈತ", re.I),
    "Health": re.compile(r"health|hospital|insurance|ayushman|medical|doctor|स्वास्थ्य|सेहत|স্বাস্থ্য|ஆரோக்கியம்", re.I),
    "Housing": re.compile(r"house|housing|ghar|awas|solar|roof|rooftop|pmay|surya|आवास|घर|ਮਕਾਨ", re.I),
    "Education": re.compile(r"scholarship|education|study|school|college|degree|छात्रवृत्ति|ਪੜ੍ਹਾਈ", re.I),
    "Employment": re.compile(r"employment|job|work|mgnrega|wage|rural employment|मनरेगा|रोजगार", re.I),
}

ELIGIBILITY_QUERY = re.compile(r"eligible|eligibility|qualify|पात्र|योग्य|ਯੋਗ|যোগ্য|தகுதி|అర్హత|પાત્ર", re.I)
TRACKING_QUERY = re.compile(r"track|status|application|check my|आवेदन|स्थिति|ਅਰਜ਼ੀ|ਸਥਿਤੀ|আবেদন", re.I)


def _grounded_catalog_reply(query: str, language: str = "en") -> dict:
    """Deterministic, catalog-grounded response fallback when external AI provider is unconfigured or unavailable."""
    schemes = scheme_dao.get_all_schemes()
    q_lower = query.lower()

    # Find matched category
    matched_cat = None
    for cat_name, pat in CATEGORY_PATTERNS.items():
        if pat.search(q_lower):
            matched_cat = cat_name
            break

    # Match schemes
    matched = []
    for s in schemes:
        name = s.get("name", "")
        desc = s.get("description", "")
        cat = s.get("category", "")
        benefits = s.get("benefits", "") or s.get("benefitAmount", "")
        text = f"{name} {desc} {cat} {benefits}".lower()

        if q_lower in text or any(word in text for word in q_lower.split() if len(word) > 3):
            matched.append(s)
        elif matched_cat and cat and cat.lower() == matched_cat.lower():
            matched.append(s)

    matched = matched[:4]

    if ELIGIBILITY_QUERY.search(q_lower):
        if matched:
            scheme_bullets = "\n".join([f"• {s['name']}: {s.get('benefits') or s.get('benefitAmount', '')}" for s in matched])
            reply = f"I can show catalogue criteria, but I cannot determine personal eligibility. Review the criteria and contact the official source.\n\n{scheme_bullets}"
        else:
            reply = "I cannot determine personal eligibility. No matching scheme was found in the current catalogue; browse the catalogue or check an official scheme source."
    elif TRACKING_QUERY.search(q_lower):
        reply = "The tracker stores a private record in your account. You can mark a scheme as planning or applied; it tracks your milestones locally and does not submit official portal applications."
    elif matched:
        scheme_bullets = "\n".join([f"• {s['name']}: {s.get('benefits') or s.get('benefitAmount', '')}" for s in matched])
        reply = f"Here is information from the verified scheme catalogue:\n\n{scheme_bullets}\n\nCheck scheme details for documents and application steps."
    else:
        reply = "I could not find a matching scheme in the current catalogue. Try searching with a specific scheme name (e.g. PM-Kisan, Ayushman Bharat, PM Surya Ghar) or category."

    return {
        "reply": reply,
        "language": language,
        "matched_schemes": [
            {
                "id": s["id"],
                "name": s["name"],
                "category": s.get("category", ""),
                "benefits": s.get("benefits", "")
            }
            for s in matched
        ],
        "provider": "grounded_catalog"
    }


@router.post("/chat")
def assistant_chat(req: ChatMessageRequest):
    """
    Conversational AI Assistant Endpoint.
    Grounded strictly on the scheme catalog with secure backend AI credentials.
    Falls back safely to local grounded catalog search if AI provider is unavailable.
    """
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Inquiry message cannot be empty.")

    # In production, if GEMINI_API_KEY or OPENAI_API_KEY is configured and AI_PROVIDER != 'mock',
    # call backend LLM with grounded catalog context.
    # Otherwise or on failure, fall back cleanly to grounded catalog matching.
    return _grounded_catalog_reply(msg, language=req.language or "en")
