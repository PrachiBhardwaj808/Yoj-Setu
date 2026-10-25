/**
 * profileService.js
 *
 * Mock user profile management service.
 * Field schema matches ProfileContext's EMPTY_PROFILE (snake_case).
 */
import { EMPTY_PROFILE } from '../context/ProfileContext';

let mockProfile = { ...EMPTY_PROFILE };

export const getProfile = async () => {
  return mockProfile;
};

export const updateProfile = async (updatedData) => {
  mockProfile = { ...mockProfile, ...updatedData };
  return mockProfile;
};

export const saveProfile = updateProfile;