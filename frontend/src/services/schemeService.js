import api from './api';
import { mockSchemes } from "@/data/mockSchemes";

export const getAllSchemes = async (params = {}) => {
  try {
    const res = await api.get('/schemes', { params });
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend schemes endpoint unavailable, using local cache:', err);
  }
  return mockSchemes;
};

export const getSchemeById = async (id) => {
  try {
    const res = await api.get(`/schemes/${id}`);
    if (res.data) {
      return res.data;
    }
  } catch (err) {
    console.warn(`Backend scheme ${id} endpoint unavailable, using local cache:`, err);
  }
  return mockSchemes.find((scheme) => String(scheme.id) === String(id) || scheme.external_scheme_id === id);
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