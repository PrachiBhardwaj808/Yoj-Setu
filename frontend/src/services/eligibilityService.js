/**
 * eligibilityService.js
 * Mock AI eligibility matching.
 * FUTURE: Replace with GET /eligibility/recommendations
 */
import { mockSchemes } from '@/data/mockSchemes';

const MOCK_MATCHES = [
  { schemeId: 2, score: 94, reasons: ['You are a registered farmer', 'Landholding under 2 hectares'] },
  { schemeId: 3, score: 88, reasons: ['Family income qualifies', 'Not in existing insurance database'] },
  { schemeId: 9, score: 81, reasons: ['Age 15–59 with valid ID', 'Skill development eligible'] },
  { schemeId: 10, score: 76, reasons: ['Rural household member', 'No existing employment record'] },
  { schemeId: 5, score: 72, reasons: ['Bank account linked', 'Age within 18–40 bracket'] },
];

export async function getEligibilityResults(_profile) {
  await new Promise(r => setTimeout(r, 1200));
  return MOCK_MATCHES.map(m => ({
    ...m,
    scheme: mockSchemes.find(s => s.id === m.schemeId),
  })).filter(m => m.scheme);
}
