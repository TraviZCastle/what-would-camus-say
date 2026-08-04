import sourceCatalogJson from '../../content/sources/sources.json';
import { SourceCatalogSchema } from '../content/schema';

const sources = SourceCatalogSchema.parse(sourceCatalogJson);

export function MethodPage() {
  return (
    <main className="method-shell">
      <header className="method-header">
        <a className="text-button" href="#">
          ← 返回提问
        </a>
        <p className="eyebrow">方法、来源与边界</p>
        <h1>这不是在模仿加缪</h1>
        <p>
          What Would Camus Say
          是一个本地运行的思想检索工具。它把现实问题与经过审核的思想卡片建立联系，再用固定结构拼装答案；它不会调用模型自由写作，也不代表加缪本人。
        </p>
      </header>

      <section className="method-section" aria-labelledby="method-process-title">
        <p className="panel-number" aria-hidden="true">
          01
        </p>
        <div>
          <h2 id="method-process-title">一次回答如何形成</h2>
          <ol className="method-steps">
            <li>
              <strong>先检查安全边界</strong>
              <span>危机与专业结论请求在检索前被独立分流，不会被哲学化处理。</span>
            </li>
            <li>
              <strong>再做浏览器内检索</strong>
              <span>中文标准化、受控同义词扩展和字段加权 BM25 都在你的设备上执行。</span>
            </li>
            <li>
              <strong>最后确定性拼装</strong>
              <span>观点、边界、现实一步与反问只能来自已审核卡片字段和固定连接句。</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-content-title">
        <p className="panel-number" aria-hidden="true">
          02
        </p>
        <div>
          <h2 id="method-content-title">思想卡片与审核</h2>
          <p>
            每张卡片分别记录原则、解释、必要边界、可能误读、适用情境、回答组件和来源。卡片必须通过结构校验、来源核对、极端误读检查与人工状态审核，才会进入检索索引。
          </p>
          <p>
            当前回答不收录直接引语，也不使用“加缪说过”式转述。界面中的文字是基于卡片的系统推演，不是作者原话。
          </p>
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-privacy-title">
        <p className="panel-number" aria-hidden="true">
          03
        </p>
        <div>
          <h2 id="method-privacy-title">你的问题如何处理</h2>
          <p>
            问题默认不保存，不写入网址，不发送给服务器、分析服务或错误监控。检索索引加载完成后，查询、分流与回答都只在当前浏览器内完成。
          </p>
          <p>
            “有帮助 / 没有帮助”只按思想卡片 ID 保存在这个浏览器的 localStorage
            中，不包含问题文本。
          </p>
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-boundary-title">
        <p className="panel-number" aria-hidden="true">
          04
        </p>
        <div>
          <h2 id="method-boundary-title">现实安全与专业边界</h2>
          <p>
            本产品不提供医疗诊断、处方、法律意见或确定性的财务结论。涉及自伤、暴力、未成年人危险、急性医疗危险或正在发生的诈骗胁迫时，应优先联系当地紧急服务、可信赖的人或有资质的专业人士。
          </p>
        </div>
      </section>

      <section
        className="method-section method-sources"
        aria-labelledby="method-sources-title"
      >
        <p className="panel-number" aria-hidden="true">
          05
        </p>
        <div>
          <h2 id="method-sources-title">来源目录</h2>
          <p>
            原始作品用于核对思想脉络，研究资料用于二级校验。产品只保存原创概述和主题定位，不打包作品正文或现代译文。
          </p>
          <ul>
            {sources.map((source) => (
              <li key={source.id}>
                <div>
                  <strong>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.work}
                      </a>
                    ) : (
                      source.work
                    )}
                  </strong>
                  <span>
                    {source.author} ·{' '}
                    {source.sourceType === 'primary' ? '原始作品' : '研究资料'}
                  </span>
                </div>
                <p>{source.usage}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="method-footer">
        <a href="#">返回并写下一个现实问题</a>
        <span>
          基于加缪作品与思想研究进行的系统推演，不代表加缪本人，也不是加缪原话。
        </span>
      </footer>
    </main>
  );
}
