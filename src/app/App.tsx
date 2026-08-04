import { RetrievalDebug } from './RetrievalDebug';

const PRODUCT_NOTE =
  '基于加缪作品与思想研究进行的系统推演，不代表加缪本人，也不是加缪原话。';

export function App() {
  const showRetrievalDebug =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    window.location.hash === '#retrieval-debug';

  if (showRetrievalDebug) return <RetrievalDebug />;

  return (
    <main className="shell">
      <div className="sun" aria-hidden="true" />
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">一个仍在搭建中的思想工具</p>
        <h1 id="page-title">
          What Would
          <span>Camus Say?</span>
        </h1>
        <p className="lead">从加缪思想出发，重新审视那些没有简单答案的现实困境。</p>
        <div className="status" role="status" aria-label="项目状态">
          <span className="status-mark" aria-hidden="true" />
          <span>Phase 0 · 项目骨架</span>
        </div>
      </section>

      <aside className="notice" aria-label="产品边界说明">
        <p>{PRODUCT_NOTE}</p>
        <p className="phase-note">问题输入与思想推演将在后续阶段开放。</p>
      </aside>

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
