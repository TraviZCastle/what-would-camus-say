import sourceCatalogJson from '../../content/sources/sources.json';
import { SourceCatalogSchema } from '../content/schema';
import type { AppLanguage } from '../i18n/language';

const sources = SourceCatalogSchema.parse(sourceCatalogJson);

const ENGLISH_SOURCE_COPY: Record<string, { work: string; usage: string }> = {
  'camus-myth-sisyphus-fr': {
    work: 'The Myth of Sisyphus',
    usage:
      'Used to verify the treatment of the absurd, lucidity, freedom, passion, and the Sisyphus image. The source text is not bundled.',
  },
  'camus-rebel-fr': {
    work: 'The Rebel',
    usage:
      'Used to verify revolt, common dignity, limits, means and ends, and the refusal of nihilistic violence.',
  },
  'camus-plague-fr': {
    work: 'The Plague',
    usage:
      'Used to verify common work, witness, responsibility, and limited solidarity in disaster without treating a character as the author.',
  },
  'camus-nuptials-fr': {
    work: 'Nuptials',
    usage:
      'Used to verify the present, sensory life, nature, and forms of happiness that do not appeal to another world.',
  },
  'camus-summer-fr': {
    work: 'Summer',
    usage: 'Used to verify the return to present beauty without denying prior suffering.',
  },
  'camus-neither-victims-executioners-fr': {
    work: 'Neither Victims nor Executioners',
    usage:
      'Used to verify the refusal to justify killing through abstract justice, the restraint of political violence, and continued dialogue.',
  },
  'camus-letters-german-friend-fr': {
    work: 'Letters to a German Friend',
    usage:
      'Used to verify justice, limits, responsibility, and common humanity under historical conflict.',
  },
  'sep-camus-2021': {
    work: 'Albert Camus — Stanford Encyclopedia of Philosophy',
    usage:
      'A secondary check on the textual context of absurd reasoning, revolt, common value, solidarity, and political limits.',
  },
  'iep-camus': {
    work: 'Albert Camus — Internet Encyclopedia of Philosophy',
    usage:
      "A secondary check on the development of Camus's thought, the absurd, revolt, humane limits, and the works catalog.",
  },
};

const COPY = {
  zh: {
    back: '← 返回提问',
    eyebrow: '方法、来源与边界',
    title: '这不是在模仿加缪',
    intro:
      'What Would Camus Say 是一个本地运行的双语思想检索工具。它把现实问题与经过审核的思想卡片建立联系，再用固定结构拼装答案；它不会调用模型自由写作，也不代表加缪本人。',
    processTitle: '一次回答如何形成',
    steps: [
      [
        '先检查安全边界',
        '抽象的自杀哲学讨论可以进入思想检索；明确的个人意图、计划与即时危险仍优先分流。',
      ],
      [
        '自动判断问题语言',
        '输入界面保持英文；提交后自动选择中文或英文索引，并只在结果页使用问题语言。',
      ],
      [
        '再做浏览器内检索',
        '中英文标准化、受控同义词扩展和字段加权 BM25 都在你的设备上执行。',
      ],
      [
        '最后确定性拼装',
        '观点、边界、现实一步与反问只能来自已审核卡片字段和固定连接句。',
      ],
    ],
    contentTitle: '思想卡片与审核',
    content: [
      '每张卡片分别记录原则、解释、必要边界、可能误读、适用情境、回答组件和来源。中英文索引共享同一批准卡片 ID 与思想边界。',
      '回答正文不收录直接引语，也不使用“加缪说过”式转述。结果末尾的短引句只来自独立审核的引文库，所用版本与译者保留在数据层，页面仅显示作品名；其余正文仍是基于卡片的系统推演。',
    ],
    privacyTitle: '你的问题如何处理',
    privacy: [
      '问题默认不保存，不写入网址，不发送给服务器、分析服务或错误监控。查询、分流与回答都只在当前浏览器内完成。',
    ],
    boundaryTitle: '现实安全与专业边界',
    boundary:
      '本产品不提供医疗诊断、处方、法律意见或确定性的财务结论。涉及自伤、暴力、未成年人危险、急性医疗危险或正在发生的诈骗胁迫时，应优先联系当地紧急服务、可信赖的人或有资质的专业人士。',
    sourcesTitle: '来源目录',
    sourcesIntro:
      '原始作品用于核对思想脉络，研究资料用于二级校验。产品只保存原创概述和主题定位，不打包作品正文或现代译文。',
    primary: '原始作品',
    scholarship: '研究资料',
    footer: '返回并写下一个现实问题',
    note: '回答正文是系统推演，不代表加缪本人；结尾短引句来自独立审核的作品引文库。',
  },
  en: {
    back: '← Return to the question',
    eyebrow: 'Method, sources, and limits',
    title: 'This is not an imitation of Camus',
    intro:
      'What Would Camus Say is a bilingual thought-retrieval tool that runs locally. It connects a real question to approved cards, then assembles a fixed response. It does not ask a model to write freely and does not represent Camus.',
    processTitle: 'How one response is formed',
    steps: [
      [
        'Safety comes first',
        'Abstract philosophical questions about suicide can be retrieved; explicit personal intent, plans, or immediate danger are routed first.',
      ],
      [
        'The question language is detected',
        'The input interface stays in English. Submission selects the Chinese or English index, and only the result adopts the question language.',
      ],
      [
        'Retrieval runs in the browser',
        'Language-specific normalization, controlled synonyms, and field-weighted BM25 all run on your device.',
      ],
      [
        'The answer is assembled deterministically',
        'The perspective, limit, practical step, and question can only come from approved card boundaries and fixed connections.',
      ],
    ],
    contentTitle: 'Thought cards and review',
    content: [
      'Each card records a principle, explanation, necessary limit, common misreadings, situations, response blocks, and sources. The Chinese and English indexes share the same approved card IDs and philosophical boundaries.',
      'The answer prose contains no direct quotations and never uses “Camus said” attribution. Its closing quotation comes only from the separately reviewed library; edition and translator metadata stay in the catalog while the result names only the work.',
    ],
    privacyTitle: 'How your question is handled',
    privacy: [
      'The question is not saved, written into the URL, or sent to a server, analytics service, or error monitor. Retrieval, routing, and composition happen in this browser.',
    ],
    boundaryTitle: 'Safety and professional limits',
    boundary:
      'This product does not provide medical diagnosis, prescriptions, legal advice, or guaranteed financial conclusions. For self-harm, violence, danger to a minor, acute medical danger, or active fraud and coercion, contact local emergency services, a trusted person, or a qualified professional first.',
    sourcesTitle: 'Source catalog',
    sourcesIntro:
      'Primary works establish the intellectual context; research sources provide a secondary check. The product stores original summaries and topic locations, not full texts or modern translations.',
    primary: 'Primary work',
    scholarship: 'Scholarship',
    footer: 'Return and describe a real-life question',
    note: 'The answer prose is an interpretation, not Camus speaking; the closing line comes from the separately reviewed quotation library.',
  },
} as const;

export function MethodPage({ language }: { language: AppLanguage }) {
  const copy = COPY[language];

  return (
    <main className="method-shell">
      <header className="method-header">
        <a className="text-button" href="#">
          {copy.back}
        </a>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      <section className="method-section" aria-labelledby="method-process-title">
        <p className="panel-number" aria-hidden="true">
          01
        </p>
        <div>
          <h2 id="method-process-title">{copy.processTitle}</h2>
          <ol className="method-steps">
            {copy.steps.map(([title, body]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-content-title">
        <p className="panel-number" aria-hidden="true">
          02
        </p>
        <div>
          <h2 id="method-content-title">{copy.contentTitle}</h2>
          {copy.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-privacy-title">
        <p className="panel-number" aria-hidden="true">
          03
        </p>
        <div>
          <h2 id="method-privacy-title">{copy.privacyTitle}</h2>
          {copy.privacy.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-boundary-title">
        <p className="panel-number" aria-hidden="true">
          04
        </p>
        <div>
          <h2 id="method-boundary-title">{copy.boundaryTitle}</h2>
          <p>{copy.boundary}</p>
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
          <h2 id="method-sources-title">{copy.sourcesTitle}</h2>
          <p>{copy.sourcesIntro}</p>
          <ul>
            {sources.map((source) => {
              const localized =
                language === 'en' ? ENGLISH_SOURCE_COPY[source.id] : undefined;
              const work = localized?.work ?? source.work;
              return (
                <li key={source.id}>
                  <div>
                    <strong>
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {work}
                        </a>
                      ) : (
                        work
                      )}
                    </strong>
                    <span>
                      {source.author} ·{' '}
                      {source.sourceType === 'primary' ? copy.primary : copy.scholarship}
                    </span>
                  </div>
                  <p>{localized?.usage ?? source.usage}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <footer className="method-footer">
        <a href="#">{copy.footer}</a>
        <span>{copy.note}</span>
      </footer>
    </main>
  );
}
