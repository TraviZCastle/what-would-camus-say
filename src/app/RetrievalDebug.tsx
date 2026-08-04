import { useEffect, useState, type FormEvent } from 'react';

import { loadSearchIndex } from '../retrieval/client';
import { retrieveThoughtCards } from '../retrieval/retrieve';
import type { RetrievalResult, SearchIndex } from '../retrieval/types';

export function RetrievalDebug() {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('每天上班都在做同样的事，为什么还要继续？');
  const [result, setResult] = useState<RetrievalResult | null>(null);

  useEffect(() => {
    let active = true;
    loadSearchIndex()
      .then((loadedIndex) => {
        if (active) setIndex(loadedIndex);
      })
      .catch((error: unknown) => {
        if (active)
          setLoadError(error instanceof Error ? error.message : '检索索引加载失败');
      });
    return () => {
      active = false;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!index) return;
    setResult(retrieveThoughtCards(index, query));
  }

  return (
    <main className="debug-shell">
      <header className="debug-header">
        <p className="eyebrow">仅开发环境可见</p>
        <h1>BM25 检索调试</h1>
        <p>问题只在浏览器内处理。调试页展示分词、扩展词、字段命中和排名。</p>
      </header>

      <form className="debug-form" onSubmit={handleSubmit}>
        <label htmlFor="debug-query">测试问题</label>
        <textarea
          id="debug-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          rows={4}
        />
        <button type="submit" disabled={!index || query.trim().length === 0}>
          {index ? '运行本地检索' : '正在加载索引…'}
        </button>
        {loadError ? <p role="alert">{loadError}</p> : null}
      </form>

      {result ? (
        <section className="debug-results" aria-live="polite">
          <div className="debug-summary">
            <span>
              {result.noResult ? '无足够贴切结果' : `置信度：${result.confidence}`}
            </span>
            <span>标准化：{result.debug.normalizedQuery}</span>
            <span>分词：{result.debug.originalTokens.join(' / ') || '无'}</span>
            <span>扩展：{result.debug.matchedSynonymTerms.join(' / ') || '无'}</span>
          </div>

          <ol className="debug-ranking" aria-label="BM25 排名">
            {result.debug.ranking.slice(0, 8).map((candidate) => (
              <li key={candidate.card.id}>
                <div>
                  <strong>{candidate.card.title}</strong>
                  <code>{candidate.card.id}</code>
                </div>
                <span>{candidate.score.toFixed(2)}</span>
                <p>
                  {Object.entries(candidate.fieldHits)
                    .map(([field, hits]) => `${field}: ${hits?.join(', ')}`)
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
