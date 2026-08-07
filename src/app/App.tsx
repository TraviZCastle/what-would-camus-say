import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';

import { composeAnswer } from '../composition/compose-answer';
import type { ComposedAnswer } from '../composition/types';
import { selectDirectQuote, translateDirectQuote } from '../content/direct-quotes';
import { EXAMPLE_QUESTIONS, MESSAGES, localizeSafetyResponse } from '../i18n/messages';
import {
  applyDocumentLanguage,
  detectQuestionLanguage,
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
  safety: SafetyMatch;
};

type SubmittedResult = RegularSubmittedResult | SafetySubmittedResult;

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
  const [language, setLanguage] = useState<AppLanguage>('en');

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
  const [questionPageOpen, setQuestionPageOpen] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const openQuestionPageRef = useRef<HTMLButtonElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const copy = MESSAGES[language];
  const inputCopy = MESSAGES.en;
  const questionLanguage = detectQuestionLanguage(question, 'en');
  const index = indexes[questionLanguage] ?? null;
  const indexError = indexErrors[questionLanguage] ?? '';

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
    loadSearchIndex(otherLanguage)
      .then((loadedIndex) => {
        if (active) {
          setIndexes((current) => ({ ...current, [otherLanguage]: loadedIndex }));
        }
      })
      .catch(() => {
        // A failed background preload is retried if that language is submitted.
      });

    return () => {
      active = false;
    };
  }, [indexErrors, indexes, language]);

  useEffect(() => {
    if (submitted) resultHeadingRef.current?.focus();
  }, [submitted]);

  useEffect(() => {
    if (!questionPageOpen) return;
    const frame = requestAnimationFrame(() => questionRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setQuestionPageOpen(false);
        requestAnimationFrame(() => openQuestionPageRef.current?.focus());
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [questionPageOpen]);

  function updateQuestion(value: string) {
    setQuestion(value);
    if (inputError) setInputError('');
  }

  function openQuestionPage(nextQuestion?: string) {
    if (nextQuestion !== undefined) updateQuestion(nextQuestion);
    setQuestionPageOpen(true);
  }

  function closeQuestionPage() {
    setQuestionPageOpen(false);
    requestAnimationFrame(() => openQuestionPageRef.current?.focus());
  }

  function chooseQuestion(value: string) {
    updateQuestion(value);
    requestAnimationFrame(() => questionRef.current?.focus());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedLanguage = detectQuestionLanguage(question, 'en');
    const validationError = validateQuestion(question, 'en');
    if (validationError) {
      setInputError(validationError);
      questionRef.current?.focus();
      return;
    }

    const trimmedQuestion = question.trim();
    const safety = routeSafety(trimmedQuestion);
    if (safety) {
      onLanguageChange(submittedLanguage);
      setQuestionPageOpen(false);
      setSubmitted({
        kind: 'safety',
        language: submittedLanguage,
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
    onLanguageChange(submittedLanguage);
    setQuestionPageOpen(false);
    setSubmitted({
      kind: 'answer',
      language: submittedLanguage,
      question: trimmedQuestion,
      retrieval,
      answer,
    });
  }

  function reset(nextQuestion = '') {
    onLanguageChange('en');
    setSubmitted(null);
    setQuestion(nextQuestion);
    setInputError('');
    setQuestionPageOpen(true);
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
        resultHeadingRef={resultHeadingRef}
        onReset={reset}
      />
    );
  }

  if (questionPageOpen) {
    return (
      <main className="question-page" aria-labelledby="question-title">
        <img
          className="question-page-portrait"
          src="/assets/camus-hero-v1.jpg"
          alt=""
          aria-hidden="true"
        />
        <div className="question-page-shade" aria-hidden="true" />

        <header className="question-page-topbar">
          <button type="button" onClick={closeQuestionPage}>
            {inputCopy.questionBack}
          </button>
          <strong>What Would Camus Say?</strong>
        </header>

        <section className="question-page-content">
          <p className="question-page-kicker">{inputCopy.questionKicker}</p>
          <h1 id="question-title">{inputCopy.questionTitle}</h1>
          <p className="question-page-intro">{inputCopy.questionIntro}</p>

          <form className="question-form" onSubmit={handleSubmit} noValidate>
            <label className="sr-only" htmlFor="question">
              {inputCopy.questionLabel}
            </label>
            <textarea
              ref={questionRef}
              id="question"
              value={question}
              onChange={(event) => updateQuestion(event.target.value)}
              aria-describedby="question-help question-error"
              aria-invalid={Boolean(inputError)}
              placeholder={inputCopy.placeholder}
              rows={5}
            />
            <div className="question-page-meta">
              <span id="question-help">{inputCopy.questionPrivacy}</span>
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
              <span>
                {index
                  ? inputCopy.start
                  : indexError
                    ? inputCopy.loadFailed
                    : inputCopy.loading}
              </span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <div className="question-page-examples" aria-label={inputCopy.examplesLabel}>
            <p>{inputCopy.examplesLabel}</p>
            <div>
              {EXAMPLE_QUESTIONS.en.map((example, indexNumber) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => chooseQuestion(example)}
                >
                  <span aria-hidden="true">0{indexNumber + 1}</span>
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="hero-page">
      <section className="hero-stage" aria-labelledby="hero-title">
        <img
          className="hero-portrait"
          src="/assets/camus-hero-v1.jpg"
          alt={copy.heroAlt}
        />
        <header className="hero-topbar">
          <strong>What Would Camus Say?</strong>
          <blockquote>
            <p>“{copy.headerQuote}”</p>
            <cite>{copy.headerQuoteSource}</cite>
          </blockquote>
        </header>

        <div className="hero-copy">
          <p className="hero-kicker">{copy.heroKicker}</p>
          <h1 id="hero-title">
            What would <em>Camus say?</em>
          </h1>
          <p className="hero-intro">{copy.heroIntro}</p>
          <button
            ref={openQuestionPageRef}
            className="hero-cta"
            type="button"
            onClick={() => openQuestionPage()}
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
      </section>
    </main>
  );
}

type ResultViewProps = {
  submitted: RegularSubmittedResult;
  resultHeadingRef: RefObject<HTMLHeadingElement | null>;
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

function ResultView({ submitted, resultHeadingRef, onReset }: ResultViewProps) {
  const { answer, language } = submitted;
  const copy = MESSAGES[language];
  const proseParagraphs = answer
    ? answer.sections
        .filter((section) => section.kind !== 'reflection')
        .map((section) => section.text)
    : [];
  const directQuote = submitted.retrieval.mainCard
    ? selectDirectQuote(submitted.retrieval.mainCard, submitted.question)
    : null;
  const translatedQuote = directQuote
    ? translateDirectQuote(directQuote, language)
    : null;

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

      <figure className="result-portrait">
        <img src="/assets/camus-hero-v1.jpg" alt={copy.heroAlt} />
      </figure>

      {answer ? (
        <article className="answer-card answer-editorial" aria-label={copy.answerLabel}>
          <div className="answer-prose">
            {proseParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph}`}>{paragraph}</p>
            ))}
          </div>

          {directQuote ? (
            <blockquote className="answer-pullquote">
              <p className="quote-source-text" lang={directQuote.sourceLanguage}>
                {directQuote.sourceText}
              </p>
              {translatedQuote && translatedQuote !== directQuote.sourceText ? (
                <p className="quote-translation">{translatedQuote}</p>
              ) : null}
              <footer>
                <cite>Albert Camus · {directQuote.source.work}</cite>
              </footer>
            </blockquote>
          ) : null}
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
    </main>
  );
}
