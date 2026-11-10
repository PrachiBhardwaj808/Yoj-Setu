/**
 * profileUtils.js
 *
 * Canonical schema definitions and completion calculation algorithms
 * for citizen socioeconomic profiles.
 */

export const EMPTY_PROFILE = Object.freeze({
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
  rural_urban: '',

  // 3. Work & Income
  occupation: '',
  annual_personal_income: '',
  annual_household_income: '',
  land_ownership: '',
  land_holding: '',

  // 4. Social & Eligibility
  social_category: '',
  disability_status: '',
  disability_percentage: '',
  minority_status: '',
  bpl_status: '',
  tribal_status: 'No',

  // 5. Household
  marital_status: '',
  family_size: '',
  children_count: '',
  children_below_5: '',
  senior_citizen_in_household: 'No',
  disability_in_household: 'No',
  pregnant_woman_in_household: 'No',
  housing_status: '',
  electricity_connection: 'Yes',
  cooking_fuel: 'LPG',

  // 6. Documents & Preferences
  has_aadhaar: '',
  has_bank_account: '',
  has_ration_card: '',
  has_income_certificate: '',
  has_caste_certificate: 'Not applicable',
  has_disability_certificate: 'Not applicable',
  has_land_document: 'Not applicable',
  preferred_language: '',
  notification_preferences: '',
});

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
    isAnswered(profile.housing_status),

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
    isAnswered(profile.has_income_certificate),
    isAnswered(profile.preferred_language),
    isAnswered(profile.notification_preferences),
  ];

  let totalQuestions = coreChecks.length;
  let answeredQuestions = coreChecks.filter(Boolean).length;

  // Conditional: Farmer land ownership
  if (profile.occupation === 'Farmer') {
    totalQuestions += 2;
    if (isAnswered(profile.land_ownership)) {
      answeredQuestions += 1;
    }
    if (isAnswered(profile.land_holding)) {
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

const isAnswered = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'boolean';
};

export function getCompletedOnboardingSections(profile) {
  if (!profile) return Array(6).fill(false);

  const sections = [
    isAnswered(profile.full_name) &&
      (isAnswered(profile.date_of_birth) || isAnswered(profile.age)) &&
      isAnswered(profile.gender) &&
      isAnswered(profile.phone),

    isAnswered(profile.state) &&
      isAnswered(profile.district) &&
      isAnswered(profile.rural_urban),

    isAnswered(profile.occupation) &&
      isAnswered(profile.annual_household_income) &&
      (profile.occupation !== 'Farmer' ||
        (isAnswered(profile.land_ownership) && isAnswered(profile.land_holding))) &&
      (!['Salaried employee', 'Self-employed', 'Business owner'].includes(profile.occupation) ||
        isAnswered(profile.annual_personal_income)),

    isAnswered(profile.social_category) &&
      isAnswered(profile.disability_status) &&
      (profile.disability_status !== 'Yes' || isAnswered(profile.disability_percentage)) &&
      isAnswered(profile.bpl_status) &&
      isAnswered(profile.minority_status),

    isAnswered(profile.marital_status) &&
      isAnswered(profile.family_size) &&
      isAnswered(profile.children_count) &&
      isAnswered(profile.housing_status),

    isAnswered(profile.has_aadhaar) &&
      isAnswered(profile.has_bank_account) &&
      isAnswered(profile.has_ration_card) &&
      isAnswered(profile.has_income_certificate) &&
      isAnswered(profile.preferred_language) &&
      isAnswered(profile.notification_preferences),
  ];

  return sections;
}
