export const SAFETY_QUIZ_QUESTIONS = [
  { id: 'upfront-payment', questionKey: 'safetyCentre.question1', optionPrefix: 'safetyCentre.q1Option', explanationKey: 'safetyCentre.q1Explanation', correctAnswer: 1 },
  { id: 'otp-request', questionKey: 'safetyCentre.question2', optionPrefix: 'safetyCentre.q2Option', explanationKey: 'safetyCentre.q2Explanation', correctAnswer: 2 },
  { id: 'suspicious-website', questionKey: 'safetyCentre.question3', optionPrefix: 'safetyCentre.q3Option', explanationKey: 'safetyCentre.q3Explanation', correctAnswer: 2 },
  { id: 'guaranteed-selection', questionKey: 'safetyCentre.question4', optionPrefix: 'safetyCentre.q4Option', explanationKey: 'safetyCentre.q4Explanation', correctAnswer: 1 },
  { id: 'document-request', questionKey: 'safetyCentre.question5', optionPrefix: 'safetyCentre.q5Option', explanationKey: 'safetyCentre.q5Explanation', correctAnswer: 2 },
  { id: 'urgent-payment-demand', questionKey: 'safetyCentre.question6', optionPrefix: 'safetyCentre.q6Option', explanationKey: 'safetyCentre.q6Explanation', correctAnswer: 2 },
];

export function calculateSafetyQuizScore(answers) {
  return SAFETY_QUIZ_QUESTIONS.reduce(
    (score, question) => score + (answers[question.id] === question.correctAnswer ? 1 : 0),
    0
  );
}
