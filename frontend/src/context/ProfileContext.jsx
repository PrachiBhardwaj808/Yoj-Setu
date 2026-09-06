import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProfileContext = createContext(null);

const STORAGE_KEY = 'yojsetu_profile';

export const EMPTY_PROFILE = {
  // 1. Personal
  full_name: '',
  date_of_birth: '',
  age: '',
  gender: '',
  phone: '',
  email: '',

  // 2. Location
  state: '',
  district: '',
  block: '',
  village_city: '',
  pin_code: '',
  rural_urban: 'Rural',

  // 3. Work & Income
  occupation: '',
  employment_status: '',
  annual_personal_income: '',
  annual_household_income: '',
  land_ownership: '',
  land_holding: '',

  // 4. Social & Eligibility
  social_category: '',
  disability_status: 'No',
  disability_percentage: '',
  minority_status: 'No',
  bpl_status: 'No',
  tribal_status: 'No',

  // 5. Household
  marital_status: '',
  family_size: '4',
  children_count: '2',
  children_below_5: '0',
  senior_citizen_in_household: 'No',
  disability_in_household: 'No',
  pregnant_woman_in_household: 'No',
  housing_status: '',
  electricity_connection: 'Yes',
  cooking_fuel: 'LPG',

  // 6. Documents & Preferences
  has_aadhaar: 'Yes',
  has_bank_account: 'Yes',
  has_ration_card: 'Yes',
  has_income_certificate: 'Not sure',
  has_caste_certificate: 'Not applicable',
  has_disability_certificate: 'Not applicable',
  has_land_document: 'Not applicable',
  preferred_language: 'English',
  notification_preferences: 'SMS & Email',
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed.profile ? { ...EMPTY_PROFILE, ...parsed.profile } : EMPTY_PROFILE);
        setOnboardingStep(parsed.step ?? 1);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((updatedProfile, step) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: updatedProfile, step }));
  }, []);

  const updateProfile = useCallback((changes) => {
    setProfile(prev => {
      const updated = { ...prev, ...changes };
      persist(updated, onboardingStep);
      return updated;
    });
  }, [onboardingStep, persist]);

  const saveStep = useCallback((step) => {
    setOnboardingStep(step);
    persist(profile, step);
  }, [profile, persist]);

  const clearProfile = useCallback(() => {
    setProfile(EMPTY_PROFILE);
    setOnboardingStep(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Calculate completion percentage based on answered fields
  const filledFieldsCount = Object.values(profile).filter(
    v => v !== '' && v !== null && v !== undefined
  ).length;

  const completionPercent = Math.min(
    100,
    Math.round((filledFieldsCount / Object.keys(EMPTY_PROFILE).length) * 100)
  );

  const value = {
    profile,
    onboardingStep,
    completionPercent,
    updateProfile,
    saveStep,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
