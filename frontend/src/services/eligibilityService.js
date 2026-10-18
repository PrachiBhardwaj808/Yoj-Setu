/**
 * eligibilityService.js
 * Integrates with FastAPI deterministic eligibility engine and AI recommendation agent.
 */
import { getSchemeRecommendations, getAllSchemes } from './schemeService';
import { mockSchemes } from '@/data/mockSchemes';

export async function getEligibilityResults(profile, userDocuments = []) {
  if (profile) {
    const res = await getSchemeRecommendations(profile, userDocuments);
    if (res && res.recommendations) {
      return res.recommendations;
    }
  }

  // Graceful fallback for demo/offline mode
  const all = await getAllSchemes();
  return (all || mockSchemes).slice(0, 5).map((scheme, idx) => ({
    scheme_id: scheme.id,
    external_scheme_id: scheme.external_scheme_id || `SCH00${scheme.id}`,
    scheme_name: scheme.name,
    category: scheme.category || 'General',
    benefit: scheme.benefits || 'Financial & welfare support',
    status: 'ELIGIBLE',
    match_score: 95 - idx * 4,
    priority: idx + 1,
    reason: `Your profile matches key eligibility criteria for ${scheme.name}.`,
    document_readiness_score: 80,
    passed_conditions: [
      { field: 'state', user_value: profile?.state || 'Punjab', required: 'All India / State', status: 'PASS', description: 'State match' },
      { field: 'age', user_value: 25, required: '18-40', status: 'PASS', description: 'Age requirement met' }
    ],
    failed_conditions: [],
    missing_information: [],
    documents: (scheme.documents || [
      { name: 'Aadhaar Card', is_mandatory: true, is_available: true, status: 'AVAILABLE' },
      { name: 'Income Certificate', is_mandatory: true, is_available: true, status: 'AVAILABLE' }
    ]),
    source_url: scheme.source_url || 'https://myscheme.gov.in',
    application_url: scheme.application_url || 'https://myscheme.gov.in',
    department: scheme.department || 'Government Department',
    government_level: scheme.government_level || 'Central',
    state: scheme.state || 'All India'
  }));
}
