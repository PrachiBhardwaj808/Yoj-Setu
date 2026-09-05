/**
 * chatService.js
 * Mock AI chat responses.
 * FUTURE: Replace sendMessage() with POST /chat/message
 */

const MOCK_RESPONSES = [
  { pattern: /kisan|farmer|farm|agriculture/i, reply: 'PM Kisan Samman Nidhi gives ₹6,000 per year directly to your bank account. If you are a registered farmer with land under 2 hectares, you likely qualify. Would you like me to check your eligibility?' },
  { pattern: /health|hospital|insurance|ayushman/i, reply: 'Ayushman Bharat PM-JAY provides up to ₹5,00,000 per year in health insurance coverage. Treatment at any empanelled government or private hospital is free. Shall I help you apply?' },
  { pattern: /housing|house|ghar|awas/i, reply: 'PM Awas Yojana offers housing subsidies of up to ₹2.67 lakh for urban families. PM Surya Ghar Muft Bijli additionally provides up to ₹78,000 for solar panels. Would you like details on both?' },
  { pattern: /scholarship|education|study|college/i, reply: 'PM Scholarship for Higher Education provides ₹36,000 per year for eligible students. You need minimum 80% marks and family income below ₹8 lakh. Should I check your profile for eligibility?' },
  { pattern: /pension|atal|apY/i, reply: 'Atal Pension Yojana guarantees ₹1,000 to ₹5,000 per month pension for workers in the unorganized sector. You can enroll if you are between 18–40 years old with a bank account.' },
  { pattern: /loan|mudra|business/i, reply: 'Mudra Loan Scheme provides collateral-free loans up to ₹10 lakh for small business owners. Three tiers: Shishu (up to ₹50K), Kishore (₹50K–5L), Tarun (₹5L–10L). Want to know which tier fits your need?' },
  { pattern: /scheme|yojana|benefit/i, reply: 'There are 500+ Central and State government schemes available. Based on your profile, I can recommend the most relevant ones. Would you like me to run a full eligibility check?' },
];

const DEFAULT_RESPONSE = "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!";

export async function sendMessage(text) {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
  const match = MOCK_RESPONSES.find(r => r.pattern.test(text));
  return match?.reply ?? DEFAULT_RESPONSE;
}

export const SUGGESTED_QUESTIONS = [
  'What farming schemes am I eligible for?',
  'How do I apply for Ayushman Bharat?',
  'What is PM Awas Yojana subsidy?',
  'Can I get a Mudra business loan?',
  'How to track my application status?',
];
