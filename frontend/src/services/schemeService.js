import api from './api.js';
import { mockSchemes } from '../data/mockSchemes.js';
import {
  findSchemeByReference,
  normalizeScheme,
  normalizeSchemes,
} from '../utils/schemeUtils.js';

export const getAllSchemes = async (params = {}) => {
  let response;
  try {
    response = await api.get('/schemes', { params });
  } catch (err) {
    console.warn('Backend schemes endpoint unavailable, using local cache:', err);
    return mockSchemes;
  }

  if (!Array.isArray(response.data)) {
    throw new Error('Backend schemes endpoint returned an invalid catalogue.');
  }
  return normalizeSchemes(response.data);
};

export const getSchemeById = async (id) => {
  if (id === null || id === undefined || String(id).trim() === '') return undefined;
  const requestedId = String(id);

  if (/^\d+$/.test(requestedId)) {
    try {
      const response = await api.get(`/schemes/${requestedId}`);
      if (response.data) return normalizeScheme(response.data);
    } catch (err) {
      if (err.response?.status === 404) return undefined;
      console.warn(`Backend scheme ${requestedId} endpoint unavailable, checking exact catalogue match:`, err);
    }

    const catalogue = await getAllSchemes();
    return findSchemeByReference(requestedId, catalogue) || undefined;
  }

  const catalogue = await getAllSchemes();
  const matchedScheme = findSchemeByReference(requestedId, catalogue);
  if (!matchedScheme) return undefined;

  if (/^\d+$/.test(String(matchedScheme.id)) && matchedScheme.external_scheme_id) {
    try {
      const response = await api.get(`/schemes/${matchedScheme.id}`);
      if (response.data) return normalizeScheme(response.data);
    } catch (err) {
      if (err.response?.status === 404) return undefined;
      console.warn(`Backend scheme ${matchedScheme.id} endpoint unavailable, using exact catalogue match:`, err);
    }
  }

  return matchedScheme;
};

export const getSchemeRecommendations = async (userProfile, userDocuments = [], category = null) => {
  try {
    const res = await api.post('/schemes/recommend', {
      user_profile: userProfile,
      user_documents: userDocuments,
      category: category,
      limit: 20
    });
    if (res.data && res.data.recommendations) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend recommendation endpoint failed, generating local engine fallback:', err);
  }
  return null;
};