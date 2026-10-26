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

export function calculateProfileCompletion(profile) {
  if (!profile) return 0;

  const isAnswered = (val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'number') return !isNaN(val);
    if (typeof val === 'boolean') return true;
    return false;
  };

  const coreChecks = [
    // 1. Personal
    isAnswered(profile.full_name),
    isAnswered(profile.date_of_birth) || isAnswered(profile.age),
    isAnswered(profile.gender),
    isAnswered(profile.phone),

    // 2. Location
    isAnswered(profile.state),
    isAnswered(profile.district),
    isAnswered(profile.rural_urban),

    // 3. Work & Income
    isAnswered(profile.occupation),
    isAnswered(profile.annual_household_income),

    // 4. Social & Eligibility
    isAnswered(profile.social_category),
    isAnswered(profile.disability_status),
    isAnswered(profile.bpl_status),
    isAnswered(profile.minority_status),

    // 5. Household
    isAnswered(profile.marital_status),
    isAnswered(profile.family_size),
    isAnswered(profile.children_count),

    // 6. Documents & Preferences
    isAnswered(profile.has_aadhaar),
    isAnswered(profile.has_bank_account),
    isAnswered(profile.has_ration_card),
    isAnswered(profile.preferred_language),
    isAnswered(profile.notification_preferences),
  ];

  let totalQuestions = coreChecks.length;
  let answeredQuestions = coreChecks.filter(Boolean).length;

  // Conditional: Farmer land ownership
  if (profile.occupation === 'Farmer') {
    totalQuestions += 1;
    if (isAnswered(profile.land_ownership)) {
      answeredQuestions += 1;
    }
  }

  // Conditional: Personal income for salaried / self-employed / business owners
  if (['Salaried employee', 'Self-employed', 'Business owner'].includes(profile.occupation)) {
    totalQuestions += 1;
    if (isAnswered(profile.annual_personal_income)) {
      answeredQuestions += 1;
    }
  }

  // Conditional: Disability percentage if disabled
  if (profile.disability_status === 'Yes') {
    totalQuestions += 1;
    if (isAnswered(profile.disability_percentage)) {
      answeredQuestions += 1;
    }
  }

  if (totalQuestions === 0) return 0;
  return Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100));
}

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
  const completionPercent = calculateProfileCompletion(profile);

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
