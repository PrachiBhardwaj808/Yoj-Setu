import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { calculateSafetyQuizScore, SAFETY_QUIZ_QUESTIONS } from '@/data/safetyCentreData';
import './SafetyCentrePage.css';

const SAFETY_STEPS = [1, 2, 3, 4, 5];

function ShieldIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

function StepIcon({ step }) {
  const paths = {
    1: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    2: <><path d="M10 13a5 5 0 0 0 7.07 0l2-2A5 5 0 0 0 12 3.93l-1.15 1.14" /><path d="M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.15-1.14" /></>,
    3: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18m-13 5h4" /></>,
    4: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" /></>,
    5: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" className="safety-step-icon" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[step]}
    </svg>
  );
}

function ResourceIcon({ type }) {
  const content = {
    portal: <><path d="M4 4h16v16H4z" /><path d="M8 8h8m-8 4h8m-8 4h5" /></>,
    i4c: <><path d="M12 3 3 8l9 5 9-5-9-5z" /><path d="M5 10v6l7 4 7-4v-6m-7 3v7" /></>,
    consumer: <><path d="M12 21s8-4 8-10V5l-8-3-8 3v6c0 6 8 10 8 10z" /><path d="M9 12h6m-3-3v6" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" className="resource-icon" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {content[type]}
    </svg>
  );
}

function ExternalArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export default function SafetyCentrePage() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = SAFETY_QUIZ_QUESTIONS[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const answeredCount = SAFETY_QUIZ_QUESTIONS.filter((question) => answers[question.id] !== undefined).length;
  const score = calculateSafetyQuizScore(answers);
  const progressLabel = t('safetyCentre.questionProgress')
    .replace('{current}', String(currentIndex + 1))
    .replace('{total}', String(SAFETY_QUIZ_QUESTIONS.length));
  const scoreMessage = score === SAFETY_QUIZ_QUESTIONS.length
    ? 'safetyCentre.resultExcellent'
    : score >= 4
      ? 'safetyCentre.resultGood'
      : 'safetyCentre.resultReview';

  function selectAnswer(answerIndex) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answerIndex,
    }));
  }

  function retryQuiz() {
    setAnswers({});
    setCurrentIndex(0);
    setIsComplete(false);
  }

  return (
    <div className="safety-page">
      <header className="safety-hero">
        <div className="safety-hero-content">
          <div className="safety-hero-icon"><ShieldIcon /></div>
          <div className="safety-hero-copy">
            <p className="safety-eyebrow">{t('nav.safetyCentre')}</p>
            <h1>{t('safetyCentre.heroTitle')}</h1>
            <p className="safety-hero-subtitle">{t('safetyCentre.heroSubtitle')}</p>
            <a className="safety-primary-button" href="#safety-quiz">
              {t('safetyCentre.takeQuiz')}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </header>

      <section className="safety-section" id="safety-quiz" aria-labelledby="safety-quiz-title">
        <div className="safety-section-heading">
          <div>
            <p className="safety-section-kicker">01</p>
            <h2 id="safety-quiz-title">{t('safetyCentre.quizTitle')}</h2>
            <p>{t('safetyCentre.quizDescription')}</p>
          </div>
        </div>

        <div className="safety-quiz-card">
          <div
            className="safety-progress-track"
            role="progressbar"
            aria-label={t('safetyCentre.quizProgressLabel')}
            aria-valuemin={0}
            aria-valuemax={SAFETY_QUIZ_QUESTIONS.length}
            aria-valuenow={answeredCount}
          >
            <span style={{ width: `${(answeredCount / SAFETY_QUIZ_QUESTIONS.length) * 100}%` }} />
          </div>

          {isComplete ? (
            <div className="safety-result" role="status" aria-live="polite">
              <div className="safety-result-icon"><ShieldIcon /></div>
              <p className="safety-section-kicker">{t('safetyCentre.quizComplete')}</p>
              <h3>
                {t('safetyCentre.scoreLine')
                  .replace('{score}', String(score))
                  .replace('{total}', String(SAFETY_QUIZ_QUESTIONS.length))}
              </h3>
              <p>{t(scoreMessage)}</p>
              <button className="safety-secondary-button" type="button" onClick={retryQuiz}>
                {t('safetyCentre.retry')}
              </button>
            </div>
          ) : (
            <>
              <div className="safety-quiz-meta">
                <span>{progressLabel}</span>
                <span>{answeredCount} / {SAFETY_QUIZ_QUESTIONS.length}</span>
              </div>
              <h3 className="safety-question">{t(currentQuestion.questionKey)}</h3>
              <div className="safety-answer-list" role="group" aria-labelledby="safety-quiz-title">
                {[0, 1, 2, 3].map((answerIndex) => {
                  const isCorrect = answerIndex === currentQuestion.correctAnswer;
                  const isSelected = selectedAnswer === answerIndex;
                  const answerClass = [
                    'safety-answer',
                    isSelected ? 'is-selected' : '',
                    selectedAnswer !== undefined && isCorrect ? 'is-correct' : '',
                    isSelected && !isCorrect ? 'is-incorrect' : '',
                  ].filter(Boolean).join(' ');

                  return (
                    <button
                      className={answerClass}
                      type="button"
                      key={`${currentQuestion.id}-${answerIndex}`}
                      onClick={() => selectAnswer(answerIndex)}
                      aria-pressed={isSelected}
                    >
                      <span className="safety-answer-letter" aria-hidden="true">{String.fromCharCode(65 + answerIndex)}</span>
                      <span className="safety-answer-copy">
                        <span>{t(`${currentQuestion.optionPrefix}${answerIndex + 1}`)}</span>
                        {selectedAnswer !== undefined && isCorrect && (
                          <span className="safety-answer-tag">{t('safetyCentre.correctAnswer')}</span>
                        )}
                      </span>
                      {selectedAnswer !== undefined && isCorrect && <span className="safety-answer-check" aria-hidden="true">✓</span>}
                      {isSelected && !isCorrect && <span className="safety-answer-check" aria-hidden="true">×</span>}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== undefined && (
                <div
                  className={`safety-feedback ${selectedAnswer === currentQuestion.correctAnswer ? 'is-correct' : 'is-incorrect'}`}
                  role="status"
                  aria-live="polite"
                >
                  <strong>
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? t('safetyCentre.correctFeedback')
                      : t('safetyCentre.incorrectFeedback')}
                  </strong>
                  <p>{t(currentQuestion.explanationKey)}</p>
                </div>
              )}

              <div className="safety-quiz-footer">
                <button
                  className="safety-secondary-button"
                  type="button"
                  onClick={() => setCurrentIndex((index) => index - 1)}
                  disabled={currentIndex === 0}
                >
                  {t('safetyCentre.previous')}
                </button>
                {currentIndex === SAFETY_QUIZ_QUESTIONS.length - 1 && answeredCount < SAFETY_QUIZ_QUESTIONS.length && (
                  <p className="safety-answer-hint">{t('safetyCentre.answerAll')}</p>
                )}
                <button
                  className="safety-primary-button"
                  type="button"
                  onClick={() => {
                    if (currentIndex === SAFETY_QUIZ_QUESTIONS.length - 1) {
                      setIsComplete(true);
                    } else {
                      setCurrentIndex((index) => index + 1);
                    }
                  }}
                  disabled={currentIndex === SAFETY_QUIZ_QUESTIONS.length - 1 && answeredCount < SAFETY_QUIZ_QUESTIONS.length}
                >
                  {currentIndex === SAFETY_QUIZ_QUESTIONS.length - 1
                    ? t('safetyCentre.showResults')
                    : t('safetyCentre.next')}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="safety-section" aria-labelledby="safety-steps-title">
        <div className="safety-section-heading">
          <div>
            <p className="safety-section-kicker">02</p>
            <h2 id="safety-steps-title">{t('safetyCentre.stepTitle')}</h2>
          </div>
        </div>
        <div className="safety-steps-grid">
          {SAFETY_STEPS.map((step) => (
            <article className="safety-step-card" key={step}>
              <span className="safety-step-number">{String(step).padStart(2, '0')}</span>
              <div className="safety-step-icon-wrap"><StepIcon step={step} /></div>
              <h3>{t(`safetyCentre.step${step}Title`)}</h3>
              <p>{t(`safetyCentre.step${step}Body`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="safety-section safety-resources-section" aria-labelledby="safety-resources-title">
        <div className="safety-section-heading">
          <div>
            <p className="safety-section-kicker">03</p>
            <h2 id="safety-resources-title">{t('safetyCentre.resourcesTitle')}</h2>
            <p>{t('safetyCentre.resourcesDescription')}</p>
          </div>
        </div>
        <div className="safety-resources-grid">
          <article className="safety-resource-card cyber-resource">
            <div className="safety-resource-icon-wrap"><ResourceIcon type="portal" /></div>
            <h3>{t('safetyCentre.cyberPortalName')}</h3>
            <p>{t('safetyCentre.cyberPortalDescription')}</p>
            <a
              className="safety-resource-link"
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('safetyCentre.cyberPortalLinkLabel')}
            >
              {t('safetyCentre.cyberPortalButton')} <ExternalArrow />
            </a>
            <div className="safety-helpline">
              <span className="safety-helpline-number">1930</span>
              <span>{t('safetyCentre.cyber1930Description')}</span>
              <a href="tel:1930" aria-label={t('safetyCentre.call1930Label')}>{t('safetyCentre.call1930Label')}</a>
            </div>
          </article>

          <article className="safety-resource-card i4c-resource">
            <div className="safety-resource-icon-wrap"><ResourceIcon type="i4c" /></div>
            <h3>{t('safetyCentre.i4cName')}</h3>
            <p>{t('safetyCentre.i4cDescription')}</p>
            <a
              className="safety-resource-link"
              href="https://i4c.mha.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('safetyCentre.i4cLinkLabel')}
            >
              {t('safetyCentre.i4cButton')} <ExternalArrow />
            </a>
          </article>

          <article className="safety-resource-card consumer-resource">
            <div className="safety-resource-icon-wrap"><ResourceIcon type="consumer" /></div>
            <h3>{t('safetyCentre.consumerName')}</h3>
            <p>{t('safetyCentre.consumerDescription')}</p>
            <a
              className="safety-resource-link"
              href="https://consumerhelpline.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('safetyCentre.consumerLinkLabel')}
            >
              {t('safetyCentre.consumerButton')} <ExternalArrow />
            </a>
            <div className="safety-helpline">
              <span className="safety-helpline-number">1915</span>
              <span>{t('safetyCentre.consumer1915Description')}</span>
              <a href="tel:+918800001915" aria-label={t('safetyCentre.call1915Label')}>{t('safetyCentre.call1915Label')}</a>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
