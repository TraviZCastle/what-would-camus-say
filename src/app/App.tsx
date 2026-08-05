import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';

import { composeAnswer } from '../composition/compose-answer';
import type { ComposedAnswer } from '../composition/types';
import {
  EXAMPLE_QUESTIONS,
  MESSAGES,
  THEME_LABELS,
  THEME_QUESTIONS,
  localizeSafetyResponse,
} from '../i18n/messages';
import {
  applyDocumentLanguage,
  detectQuestionLanguage,
  getInitialLanguage,
  type AppLanguage,
} from '../i18n/language';
import { loadSearchIndex } from '../retrieval/client';
import { retrieveThoughtCards } from '../retrieval/retrieve';
import { normalizeText } from '../retrieval/tokenizer';
import type { RetrievalResult, SearchIndex } from '../retrieval/types';
import { routeSafety, type SafetyMatch } from '../safety/route-safety';
import { MethodPage } from './MethodPage';
import { RetrievalDebug } from './RetrievalDebug';

type RegularSubmittedResult = {
  kind: 'answer';
  language: AppLanguage;
  question: string;
  retrieval: RetrievalResult;
  answer: ComposedAnswer | null;
};

type SafetySubmittedResult = {
  kind: 'safety';
  language: AppLanguage;
  question: string;
  safety: SafetyMatch;
};

type SubmittedResult = RegularSubmittedResult | SafetySubmittedResult;
type FeedbackValue = 'helpful' | 'not-helpful';

function characterLength(value: string): number {
  return Array.from(value).length;
}

function validateQuestion(value: string, language: AppLanguage): string | null {
  const copy = MESSAGES[language].errors;
  const trimmed = value.trim();
  const length = characterLength(trimmed);
  if (length === 0) return copy.empty;
  if (length < 10) return copy.short;
  if (length > 300) return copy.long;

  const meaningfulCharacters = Array.from(normalizeText(trimmed).replace(/\s/g, ''));
  if (meaningfulCharacters.length < 4 || new Set(meaningfulCharacters).size < 2) {
    return copy.unclear;
  }
  return null;
}

export function App() {
  const [hash, setHash] = useState(
    typeof window === 'undefined' ? '' : window.location.hash,
  );
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  useEffect(() => applyDocumentLanguage(language), [language]);

  const showRetrievalDebug = import.meta.env.DEV && hash === '#retrieval-debug';

  if (showRetrievalDebug) return <RetrievalDebug />;
  if (hash === '#method') return <MethodPage language={language} />;
  return <ProductApp language={language} onLanguageChange={setLanguage} />;
}

type ProductAppProps = {
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
};

function ProductApp({ language, onLanguageChange }: ProductAppProps) {
  const [indexes, setIndexes] = useState<Partial<Record<AppLanguage, SearchIndex>>>({});
  const [indexErrors, setIndexErrors] = useState<Partial<Record<AppLanguage, string>>>(
    {},
  );
  const [question, setQuestion] = useState('');
  const [inputError, setInputError] = useState('');
  const [submitted, setSubmitted] = useState<SubmittedResult | null>(null);
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const openDrawerRef = useRef<HTMLButtonElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const copy = MESSAGES[language];
  const index = indexes[language] ?? null;
  const indexError = indexErrors[language] ?? '';

  useEffect(() => {
    let active = true;
    if (!indexes[language] && !indexErrors[language]) {
      loadSearchIndex(language)
        .then((loadedIndex) => {
          if (active) {
            setIndexes((current) => ({ ...current, [language]: loadedIndex }));
          }
        })
        .catch((error: unknown) => {
          if (active) {
            setIndexErrors((current) => ({
              ...current,
              [language]:
                error instanceof Error ? error.message : copy.errors.indexFailed,
            }));
          }
        });
    }
    return () => {
      active = false;
    };
  }, [copy.errors.indexFailed, indexErrors, indexes, language]);

  useEffect(() => {
    const otherLanguage: AppLanguage = language === 'zh' ? 'en' : 'zh';
    if (indexes[otherLanguage] || indexErrors[otherLanguage]) return;

    let active = true;
    const preload = () => {
      loadSearchIndex(otherLanguage)
        .then((loadedIndex) => {
          if (active) {
            setIndexes((current) => ({ ...current, [otherLanguage]: loadedIndex }));
          }
        })
        .catch(() => {
          // A failed background preload is retried when that language becomes active.
        });
    };

    const windowWithIdle = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = windowWithIdle.requestIdleCallback?.(preload);
    const timeoutId = idleId === undefined ? window.setTimeout(preload, 700) : undefined;

    return () => {
      active = false;
      if (idleId !== undefined) windowWithIdle.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [indexErrors, indexes, language]);

  useEffect(() => {
    if (submitted) resultHeadingRef.current?.focus();
  }, [submitted]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => questionRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        requestAnimationFrame(() => openDrawerRef.current?.focus());
      }
      if (event.key === 'Tab' && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), textarea:not(:disabled), summary, a[href]',
          ),
        ).filter((element) => element.offsetParent !== null);
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  function updateQuestion(value: string) {
    setQuestion(value);
    if (inputError) setInputError('');
    const detected = detectQuestionLanguage(value, language);
    if (detected !== language) onLanguageChange(detected);
  }

  function openDrawer(nextQuestion?: string) {
    if (nextQuestion !== undefined) updateQuestion(nextQuestion);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    requestAnimationFrame(() => openDrawerRef.current?.focus());
  }

  function chooseQuestion(value: string) {
    updateQuestion(value);
    requestAnimationFrame(() => questionRef.current?.focus());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedLanguage = detectQuestionLanguage(question, language);
    if (submittedLanguage !== language) {
      onLanguageChange(submittedLanguage);
    }
    const validationError = validateQuestion(question, submittedLanguage);
    if (validationError) {
      setInputError(validationError);
      questionRef.current?.focus();
      return;
    }

    const trimmedQuestion = question.trim();
    const safety = routeSafety(trimmedQuestion);
    if (safety) {
      setDrawerOpen(false);
      setFeedback(null);
      setSubmitted({
        kind: 'safety',
        language: submittedLanguage,
        question: trimmedQuestion,
        safety,
      });
      return;
    }

    const submittedIndex = indexes[submittedLanguage];
    if (!submittedIndex) {
      setInputError(indexErrors[submittedLanguage] || copy.errors.indexLoading);
      return;
    }

    const retrieval = retrieveThoughtCards(submittedIndex, trimmedQuestion);
    const answer = retrieval.mainCard
      ? composeAnswer(trimmedQuestion, retrieval.mainCard, submittedLanguage)
      : null;
    setDrawerOpen(false);
    setFeedback(null);
    setSubmitted({
      kind: 'answer',
      language: submittedLanguage,
      question: trimmedQuestion,
      retrieval,
      answer,
    });
  }

  function reset(nextQuestion = '') {
    setSubmitted(null);
    setQuestion(nextQuestion);
    setInputError('');
    setFeedback(null);
    if (nextQuestion) {
      const detected = detectQuestionLanguage(nextQuestion, language);
      if (detected !== language) onLanguageChange(detected);
    }
    setDrawerOpen(true);
  }

  function recordFeedback(value: FeedbackValue) {
    setFeedback(value);
    const cardId = submitted?.kind === 'answer' ? submitted.retrieval.mainCard?.id : null;
    if (!cardId) return;
    try {
      localStorage.setItem(`camus-feedback:${cardId}`, value);
    } catch {
      // Feedback remains available for this view even if local storage is unavailable.
    }
  }

  if (submitted) {
    return submitted.kind === 'safety' ? (
      <SafetyView
        submitted={submitted}
        resultHeadingRef={resultHeadingRef}
        onReset={reset}
      />
    ) : (
      <ResultView
        submitted={submitted}
        feedback={feedback}
        resultHeadingRef={resultHeadingRef}
        onFeedback={recordFeedback}
        onReset={reset}
      />
    );
  }

  return (
    <main className="hero-page">
      <section className="hero-stage" aria-labelledby="hero-title" inert={drawerOpen}>
        <img
          className="hero-portrait"
          src="/assets/camus-hero-v1.jpg"
          alt={copy.heroAlt}
        />
        <header className="hero-topbar">
          <strong>WWCS / 01</strong>
          <span>{copy.principles}</span>
        </header>

        <div className="hero-copy">
          <p className="hero-kicker">{copy.heroKicker}</p>
          <h1 id="hero-title">
            What would <em>Camus say?</em>
          </h1>
          <p className="hero-intro">{copy.heroIntro}</p>
          <button
            ref={openDrawerRef}
            className="hero-cta"
            type="button"
            onClick={() => openDrawer()}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <span>{copy.heroAction}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className="ember-system" aria-hidden="true">
          <span className="ember" />
          <span className="smoke smoke-one" />
          <span className="smoke smoke-two" />
          <span className="smoke smoke-three" />
        </div>

        <p className="hero-edition">
          {copy.edition}
          <strong>{copy.productNote}</strong>
        </p>
      </section>

      <button
        className="drawer-scrim"
        type="button"
        aria-label={copy.closePanel}
        data-open={drawerOpen}
        onClick={closeDrawer}
        tabIndex={-1}
      />
      <aside
        ref={drawerRef}
        className="question-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-title"
        data-open={drawerOpen}
        inert={!drawerOpen}
      >
        <header className="drawer-header">
          <span>{copy.drawerLabel}</span>
          <span className="auto-language" aria-live="polite">
            {language === 'zh' ? '自动识别：中文' : 'Auto-detected: English'}
          </span>
          <button
            className="drawer-close"
            type="button"
            onClick={closeDrawer}
            aria-label={copy.closePanel}
          >
            ×
          </button>
        </header>

        <div className="drawer-content">
          <h2 id="question-title">{copy.questionTitle}</h2>
          <p>{copy.questionIntro}</p>
          <form className="question-form" onSubmit={handleSubmit} noValidate>
            <label className="sr-only" htmlFor="question">
              {copy.questionLabel}
            </label>
            <textarea
              ref={questionRef}
              id="question"
              value={question}
              onChange={(event) => updateQuestion(event.target.value)}
              aria-describedby="question-help question-error"
              aria-invalid={Boolean(inputError)}
              placeholder={copy.placeholder}
              rows={6}
            />
            <div className="form-meta">
              <span id="question-help">{copy.countHint}</span>
              <span
                className={characterLength(question.trim()) > 300 ? 'count-error' : ''}
              >
                {characterLength(question.trim())}/300
              </span>
            </div>
            <p id="question-error" className="form-error" role="alert">
              {inputError || indexError}
            </p>
            <button
              className="primary-button"
              type="submit"
              disabled={!index && !indexError}
            >
              {index ? copy.start : indexError ? copy.loadFailed : copy.loading}
            </button>
          </form>

          <div className="examples" aria-label={copy.examplesLabel}>
            <p>{copy.examplesLabel}</p>
            <div>
              {EXAMPLE_QUESTIONS[language].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => chooseQuestion(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <details className="how-it-works">
            <summary>{copy.howTitle}</summary>
            <p>{copy.howBody}</p>
            <a href="#method">{copy.methodLink}</a>
          </details>
        </div>

        <p className="drawer-note">{copy.transparency}</p>
      </aside>
    </main>
  );
}

type ResultViewProps = {
  submitted: RegularSubmittedResult;
  feedback: FeedbackValue | null;
  resultHeadingRef: RefObject<HTMLHeadingElement | null>;
  onFeedback: (value: FeedbackValue) => void;
  onReset: (nextQuestion?: string) => void;
};

type SafetyViewProps = {
  submitted: SafetySubmittedResult;
  resultHeadingRef: RefObject<HTMLHeadingElement | null>;
  onReset: (nextQuestion?: string) => void;
};

function SafetyView({ submitted, resultHeadingRef, onReset }: SafetyViewProps) {
  const copy = MESSAGES[submitted.language];
  const response = localizeSafetyResponse(submitted.safety.response, submitted.language);

  return (
    <main className={`safety-shell safety-${response.urgency}`}>
      <header className="safety-header">
        <button className="text-button" type="button" onClick={() => onReset()}>
          {copy.back}
        </button>
        <p className="eyebrow">{copy.safetyKicker}</p>
        <h1 ref={resultHeadingRef} tabIndex={-1}>
          {response.title}
        </h1>
        <p>{response.acknowledgment}</p>
      </header>

      <section className="safety-actions" aria-labelledby="safety-actions-title">
        <p className="panel-number" aria-hidden="true">
          {copy.safetyNow}
        </p>
        <div>
          <h2 id="safety-actions-title">
            {response.urgency === 'crisis'
              ? copy.safetyCrisisTitle
              : copy.safetyBoundaryTitle}
          </h2>
          <ol>
            {response.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        </div>
      </section>

      <p className="safety-closing">{response.closing}</p>
      <p className="result-disclaimer">{copy.safetyDisclaimer}</p>
    </main>
  );
}

function ResultView({
  submitted,
  feedback,
  resultHeadingRef,
  onFeedback,
  onReset,
}: ResultViewProps) {
  const { retrieval, answer, language } = submitted;
  const copy = MESSAGES[language];
  const topCandidate = retrieval.debug.ranking[0];
  const labels = THEME_LABELS[language];

  return (
    <main className="result-shell">
      <header className="result-header">
        <button className="text-button" type="button" onClick={() => onReset()}>
          {copy.back}
        </button>
        <p className="eyebrow">{copy.resultKicker}</p>
        <h1 ref={resultHeadingRef} tabIndex={-1}>
          {copy.resultTitle}
        </h1>
        <p className="submitted-question">{submitted.question}</p>
      </header>

      {answer ? (
        <article className="answer-card" aria-label={copy.answerLabel}>
          {answer.sections.map((section, index) => (
            <section
              key={section.kind}
              className={`answer-section answer-section-${section.kind}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{section.label}</h2>
                <p>{section.text}</p>
              </div>
            </section>
          ))}
          <section className="sources-section" aria-labelledby="sources-title">
            <p className="panel-number" aria-hidden="true">
              06
            </p>
            <div>
              <h2 id="sources-title">{copy.sourceTitle}</h2>
              <ul>
                {answer.sources.map((source) => (
                  <li key={`${source.cardId}-${source.work}-${source.section ?? ''}`}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.work}
                      </a>
                    ) : (
                      source.work
                    )}
                    {source.section ? ` · ${source.section}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      ) : (
        <section className="no-result" aria-labelledby="no-result-title">
          <p className="panel-number" aria-hidden="true">
            —
          </p>
          <div>
            <h2 id="no-result-title">{copy.noResultTitle}</h2>
            <p>{copy.noResultBody}</p>
          </div>
        </section>
      )}

      <details className="explanation-details">
        <summary>{copy.whyTitle}</summary>
        {topCandidate ? (
          language === 'zh' ? (
            <p>
              问题与“{labels[topCandidate.card.theme]}”主题相关，命中了
              {Object.keys(topCandidate.fieldHits).join('、') || '思想内容'}字段
              {retrieval.debug.matchedSynonymTerms.length > 0
                ? `，并使用了受控扩展词：${retrieval.debug.matchedSynonymTerms.join('、')}`
                : ''}
              。
            </p>
          ) : (
            <p>
              The question relates to “{labels[topCandidate.card.theme]}” and matched the{' '}
              {Object.keys(topCandidate.fieldHits).join(', ') || 'thought content'} fields
              {retrieval.debug.matchedSynonymTerms.length > 0
                ? `, using controlled expansions for: ${retrieval.debug.matchedSynonymTerms.join(', ')}`
                : ''}
              .
            </p>
          )
        ) : (
          <p>{copy.whyNoResult}</p>
        )}
      </details>

      {retrieval.closestThemes.length > 0 ? (
        <section className="related-themes" aria-labelledby="related-title">
          <h2 id="related-title">{copy.relatedTitle}</h2>
          <div>
            {retrieval.closestThemes.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => onReset(THEME_QUESTIONS[language][theme])}
              >
                {labels[theme]}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {answer ? (
        <section className="feedback" aria-labelledby="feedback-title">
          <h2 id="feedback-title">{copy.feedbackTitle}</h2>
          <div>
            <button
              type="button"
              aria-pressed={feedback === 'helpful'}
              onClick={() => onFeedback('helpful')}
            >
              {copy.helpful}
            </button>
            <button
              type="button"
              aria-pressed={feedback === 'not-helpful'}
              onClick={() => onFeedback('not-helpful')}
            >
              {copy.notHelpful}
            </button>
          </div>
          {feedback ? <p role="status">{copy.saved}</p> : null}
        </section>
      ) : null}

      <p className="result-disclaimer">{copy.transparency}</p>
    </main>
  );
}
