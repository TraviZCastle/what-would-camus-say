import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';

import { composeAnswer } from '../composition/compose-answer';
import type { ComposedAnswer } from '../composition/types';
import { loadSearchIndex } from '../retrieval/client';
import { retrieveThoughtCards } from '../retrieval/retrieve';
import { normalizeText } from '../retrieval/tokenizer';
import type { RetrievalResult, SearchIndex } from '../retrieval/types';
import { routeSafety, type SafetyMatch } from '../safety/route-safety';
import type { ThemeId } from '../types/content';
import { RetrievalDebug } from './RetrievalDebug';

const PRODUCT_NOTE =
  '基于加缪作品与思想研究进行的系统推演，不代表加缪本人，也不是加缪原话。';

const EXAMPLE_QUESTIONS = [
  '每天重复上班，我不知道为什么还要继续。',
  '两个选择都有代价，我怎样判断自己愿意承担哪一种？',
  '面对明显的不公，我怎样反抗才不会复制同样的伤害？',
  '我总想等一切完成以后再开始生活，这有什么问题？',
  '一次失败以后，我觉得之前所有努力都失去了价值。',
  '关系里我总在照顾对方，怎样保留自己的边界？',
] as const;

const THEME_LABELS: Record<ThemeId, string> = {
  meaning: '意义',
  absurd: '荒诞',
  work: '工作',
  freedom: '自由',
  revolt: '反抗',
  limits: '限度',
  solidarity: '团结',
  hope: '希望',
  happiness: '幸福',
  mortality: '死亡意识',
  conscience: '良知',
  action: '行动',
};

const THEME_QUESTIONS: Record<ThemeId, string> = {
  meaning: '当原来的目标消失以后，我该怎样理解生活的价值？',
  absurd: '每天都在重复同样的生活，我为什么还要继续？',
  work: '我想离开现在的工作，但现实压力让我不敢行动。',
  freedom: '两个选择都有代价，我怎样承担自己的决定？',
  revolt: '面对不公平，我怎样拒绝又不扩大伤害？',
  limits: '坚持到什么程度会越过不应该牺牲的界线？',
  solidarity: '我感到没有人理解，怎样寻找不过度暴露自己的支持？',
  hope: '没有任何保证会变好，我还应该抱有希望吗？',
  happiness: '我总把生活推迟到以后，怎样重新感受当下？',
  mortality: '意识到生命有限以后，我不想再无限推迟重要的事。',
  conscience: '外界期待和我的良知冲突时，我该怎样判断？',
  action: '我害怕做错，眼下能先做哪一个低风险的步骤？',
};

type RegularSubmittedResult = {
  kind: 'answer';
  question: string;
  retrieval: RetrievalResult;
  answer: ComposedAnswer | null;
};

type SafetySubmittedResult = {
  kind: 'safety';
  question: string;
  safety: SafetyMatch;
};

type SubmittedResult = RegularSubmittedResult | SafetySubmittedResult;

type FeedbackValue = 'helpful' | 'not-helpful';

function characterLength(value: string): number {
  return Array.from(value).length;
}

function validateQuestion(value: string): string | null {
  const trimmed = value.trim();
  const length = characterLength(trimmed);
  if (length === 0) return '请先写下一个具体的现实问题。';
  if (length < 10) return '请至少写 10 个字符，补充你的处境、选择或冲突。';
  if (length > 300) return '问题请控制在 300 个字符以内，只保留最重要的处境与冲突。';

  const meaningfulCharacters = Array.from(normalizeText(trimmed).replace(/\s/g, ''));
  if (meaningfulCharacters.length < 4 || new Set(meaningfulCharacters).size < 2) {
    return '暂时无法理解这个问题，请换成一句完整、具体的描述。';
  }
  return null;
}

export function App() {
  const showRetrievalDebug =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    window.location.hash === '#retrieval-debug';

  return showRetrievalDebug ? <RetrievalDebug /> : <ProductApp />;
}

function ProductApp() {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [indexError, setIndexError] = useState('');
  const [question, setQuestion] = useState('');
  const [inputError, setInputError] = useState('');
  const [submitted, setSubmitted] = useState<SubmittedResult | null>(null);
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    loadSearchIndex()
      .then((loadedIndex) => {
        if (active) setIndex(loadedIndex);
      })
      .catch((error: unknown) => {
        if (active) {
          setIndexError(
            error instanceof Error ? error.message : '思想索引加载失败，请刷新页面。',
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (submitted) resultHeadingRef.current?.focus();
  }, [submitted]);

  function chooseQuestion(value: string) {
    setQuestion(value);
    setInputError('');
    requestAnimationFrame(() => questionRef.current?.focus());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateQuestion(question);
    if (validationError) {
      setInputError(validationError);
      questionRef.current?.focus();
      return;
    }
    const trimmedQuestion = question.trim();
    const safety = routeSafety(trimmedQuestion);
    if (safety) {
      setFeedback(null);
      setSubmitted({ kind: 'safety', question: trimmedQuestion, safety });
      return;
    }

    if (!index) {
      setInputError(indexError || '思想索引仍在加载，请稍后再试。');
      return;
    }

    const retrieval = retrieveThoughtCards(index, trimmedQuestion);
    const answer = retrieval.mainCard
      ? composeAnswer(trimmedQuestion, retrieval.mainCard)
      : null;
    setFeedback(null);
    setSubmitted({ kind: 'answer', question: trimmedQuestion, retrieval, answer });
  }

  function reset(nextQuestion = '') {
    setSubmitted(null);
    setQuestion(nextQuestion);
    setInputError('');
    setFeedback(null);
    requestAnimationFrame(() => questionRef.current?.focus());
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
    <main className="shell product-shell">
      <div className="sun" aria-hidden="true" />
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">从加缪思想看</p>
        <h1 id="page-title">
          What Would
          <span>Camus Say?</span>
        </h1>
        <p className="lead">描述一个现实困境，获得一次有来源、有边界的思想推演。</p>
        <p className="transparency-note">{PRODUCT_NOTE}</p>
      </section>

      <section className="question-panel" aria-labelledby="question-title">
        <div>
          <p className="panel-number" aria-hidden="true">
            01
          </p>
          <h2 id="question-title">你正在面对什么？</h2>
          <p>写下具体处境、选择或冲突。每次提交都是一次独立推演。</p>
        </div>

        <form className="question-form" onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor="question">
            现实问题
          </label>
          <textarea
            ref={questionRef}
            id="question"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              if (inputError) setInputError('');
            }}
            aria-describedby="question-help question-error"
            aria-invalid={Boolean(inputError)}
            placeholder="例如：每天重复上班，我不知道为什么还要继续。"
            rows={6}
          />
          <div className="form-meta">
            <span id="question-help">10–300 个字符</span>
            <span className={characterLength(question.trim()) > 300 ? 'count-error' : ''}>
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
            {index ? '开始思想推演' : indexError ? '索引加载失败' : '正在准备思想索引…'}
          </button>
        </form>

        <div className="examples" aria-label="示例问题">
          <p>也可以从这里开始</p>
          <div>
            {EXAMPLE_QUESTIONS.map((example) => (
              <button key={example} type="button" onClick={() => chooseQuestion(example)}>
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <span>清醒</span>
        <span aria-hidden="true">·</span>
        <span>限度</span>
        <span aria-hidden="true">·</span>
        <span>行动</span>
      </footer>
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
  const { response } = submitted.safety;

  return (
    <main className={`safety-shell safety-${response.urgency}`}>
      <header className="safety-header">
        <button className="text-button" type="button" onClick={() => onReset()}>
          ← 返回首页
        </button>
        <p className="eyebrow">安全优先 · 此次未执行哲学检索</p>
        <h1 ref={resultHeadingRef} tabIndex={-1}>
          {response.title}
        </h1>
        <p>{response.acknowledgment}</p>
      </header>

      <section className="safety-actions" aria-labelledby="safety-actions-title">
        <p className="panel-number" aria-hidden="true">
          现在
        </p>
        <div>
          <h2 id="safety-actions-title">
            {response.urgency === 'crisis' ? '请立即做这些事' : '建议这样处理'}
          </h2>
          <ol>
            {response.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        </div>
      </section>

      <p className="safety-closing">{response.closing}</p>
      <p className="result-disclaimer">
        本页只提供安全分流信息，不提供医疗、法律或财务专业服务；如有即时危险，请联系当地紧急服务。
      </p>
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
  const { retrieval, answer } = submitted;
  const topCandidate = retrieval.debug.ranking[0];

  return (
    <main className="result-shell">
      <header className="result-header">
        <button className="text-button" type="button" onClick={() => onReset()}>
          ← 重新提问
        </button>
        <p className="eyebrow">一次独立的思想推演</p>
        <h1 ref={resultHeadingRef} tabIndex={-1}>
          从加缪思想看
        </h1>
        <p className="submitted-question">{submitted.question}</p>
      </header>

      {answer ? (
        <article className="answer-card" aria-label="思想推演结果">
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
              <h2 id="sources-title">思想来源</h2>
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
            <h2 id="no-result-title">暂未找到足够贴切的思想依据</h2>
            <p>请补充更具体的处境、你正在权衡的选择，或最难接受的冲突。</p>
          </div>
        </section>
      )}

      <details className="explanation-details">
        <summary>为什么找到这些思想</summary>
        {topCandidate ? (
          <p>
            问题与“{THEME_LABELS[topCandidate.card.theme]}”主题相关，命中了
            {Object.keys(topCandidate.fieldHits).join('、') || '思想内容'}字段
            {retrieval.debug.matchedSynonymTerms.length > 0
              ? `，并使用了受控扩展词：${retrieval.debug.matchedSynonymTerms.join('、')}`
              : ''}
            。
          </p>
        ) : (
          <p>当前问题没有命中足够具体的主题词、场景或张力。</p>
        )}
      </details>

      {retrieval.closestThemes.length > 0 ? (
        <section className="related-themes" aria-labelledby="related-title">
          <h2 id="related-title">相关主题</h2>
          <div>
            {retrieval.closestThemes.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => onReset(THEME_QUESTIONS[theme])}
              >
                {THEME_LABELS[theme]}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {answer ? (
        <section className="feedback" aria-labelledby="feedback-title">
          <h2 id="feedback-title">这次推演有帮助吗？</h2>
          <div>
            <button
              type="button"
              aria-pressed={feedback === 'helpful'}
              onClick={() => onFeedback('helpful')}
            >
              有帮助
            </button>
            <button
              type="button"
              aria-pressed={feedback === 'not-helpful'}
              onClick={() => onFeedback('not-helpful')}
            >
              没有帮助
            </button>
          </div>
          {feedback ? (
            <p role="status">已保存在这个浏览器中，不包含你的问题文本。</p>
          ) : null}
        </section>
      ) : null}

      <p className="result-disclaimer">{PRODUCT_NOTE}</p>
    </main>
  );
}
