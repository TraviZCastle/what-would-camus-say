import type { SafetyResponse, ThemeId } from '../types/content';
import type { AppLanguage } from './language';

export const MESSAGES = {
  zh: {
    heroKicker: '给此刻的一次思想推演',
    heroIntro:
      '把一个现实困境带到清醒、限度与行动之间，得到一次有来源、有边界的思想推演。',
    heroAction: '描述你的困境',
    heroAlt: '一幅黑白编辑肖像：阿尔贝·加缪身穿深色大衣，嘴边有一支燃烧的香烟',
    principles: '清醒 · 限度 · 行动',
    edition: '双语本地版 / 2026 年 8 月',
    productNote: '不是加缪原话——这是一项可追溯的系统推演。',
    drawerLabel: '开始 / 01',
    closePanel: '关闭问题面板',
    questionTitle: '你正在面对什么？',
    questionIntro: '具体描述你的处境、选择或冲突。问题只在这个浏览器中处理。',
    questionLabel: '现实问题',
    placeholder: '例如：每天重复上班，我不知道为什么还要继续。',
    countHint: '10–300 个字符',
    start: '开始思想推演 →',
    loading: '正在准备思想索引…',
    loadFailed: '索引加载失败',
    examplesLabel: '也可以从这里开始',
    howTitle: '它如何工作',
    howBody: '安全检查优先；随后在浏览器内检索已审核卡片，并用固定结构拼装回答。',
    methodLink: '查看完整方法、来源与隐私说明 →',
    transparency:
      '基于加缪作品与思想研究进行的系统推演，不代表加缪本人，也不是加缪原话。',
    back: '← 重新提问',
    resultKicker: '一次独立的思想推演',
    resultTitle: '从加缪思想看',
    answerLabel: '思想推演结果',
    sourceTitle: '思想来源',
    noResultTitle: '暂未找到足够贴切的思想依据',
    noResultBody: '请补充更具体的处境、你正在权衡的选择，或最难接受的冲突。',
    whyTitle: '为什么找到这些思想',
    whyNoResult: '当前问题没有命中足够具体的主题词、场景或张力。',
    relatedTitle: '相关主题',
    feedbackTitle: '这次推演有帮助吗？',
    helpful: '有帮助',
    notHelpful: '没有帮助',
    saved: '已保存在这个浏览器中，不包含你的问题文本。',
    safetyKicker: '安全优先 · 此次未执行哲学检索',
    safetyNow: '现在',
    safetyCrisisTitle: '请立即做这些事',
    safetyBoundaryTitle: '建议这样处理',
    safetyDisclaimer:
      '本页只提供安全分流信息，不提供医疗、法律或财务专业服务；如有即时危险，请联系当地紧急服务。',
    errors: {
      empty: '请先写下一个具体的现实问题。',
      short: '请至少写 10 个字符，补充你的处境、选择或冲突。',
      long: '问题请控制在 300 个字符以内，只保留最重要的处境与冲突。',
      unclear: '暂时无法理解这个问题，请换成一句完整、具体的描述。',
      indexLoading: '思想索引仍在加载，请稍后再试。',
      indexFailed: '思想索引加载失败，请刷新页面。',
    },
  },
  en: {
    heroKicker: 'A thought for the present',
    heroIntro:
      'Bring a real dilemma into the space between clarity, limits, and action. Receive a traceable thought exercise with explicit boundaries.',
    heroAction: 'Describe your dilemma',
    heroAlt:
      'A black-and-white editorial portrait of Albert Camus in a dark overcoat with a lit cigarette',
    principles: 'Clarity · Measure · Action',
    edition: 'Bilingual local edition / August 2026',
    productNote: "Not Camus's words — a traceable interpretation.",
    drawerLabel: 'Begin / 01',
    closePanel: 'Close question panel',
    questionTitle: 'What are you facing?',
    questionIntro:
      'Describe the situation, choice, or conflict in concrete terms. Your question stays in this browser.',
    questionLabel: 'Real-life dilemma',
    placeholder:
      'For example: Every day at work feels the same, and I no longer know why I should continue.',
    countHint: '10–300 characters',
    start: 'Begin the thought exercise →',
    loading: 'Preparing the thought index…',
    loadFailed: 'Index failed to load',
    examplesLabel: 'Or begin with one of these',
    howTitle: 'How it works',
    howBody:
      'Safety is checked first. Approved cards are then retrieved and assembled locally with a fixed structure.',
    methodLink: 'Read the full method, sources, and privacy note →',
    transparency:
      "A systematic interpretation grounded in Camus's works and scholarship. It does not represent Camus and does not use his words.",
    back: '← Ask another question',
    resultKicker: 'One independent thought exercise',
    resultTitle: 'Through a Camusian lens',
    answerLabel: 'Thought exercise result',
    sourceTitle: 'Sources',
    noResultTitle: 'No sufficiently relevant basis was found',
    noResultBody:
      'Add more detail about the situation, the choices you are weighing, or the conflict that is hardest to accept.',
    whyTitle: 'Why these ideas were found',
    whyNoResult:
      'The question did not match a sufficiently specific theme, situation, or tension.',
    relatedTitle: 'Related themes',
    feedbackTitle: 'Was this thought exercise useful?',
    helpful: 'Helpful',
    notHelpful: 'Not helpful',
    saved: 'Saved in this browser without your question text.',
    safetyKicker: 'Safety first · Philosophical retrieval was not run',
    safetyNow: 'Now',
    safetyCrisisTitle: 'Please do these things now',
    safetyBoundaryTitle: 'A safer way to proceed',
    safetyDisclaimer:
      'This page provides safety routing only, not medical, legal, or financial services. Contact local emergency services if there is immediate danger.',
    errors: {
      empty: 'Describe one concrete real-life question first.',
      short: 'Use at least 10 characters and add the situation, choice, or conflict.',
      long: 'Keep the question within 300 characters and retain only the central situation and conflict.',
      unclear:
        'This does not yet read as a concrete question. Try one complete sentence.',
      indexLoading: 'The thought index is still loading. Please try again in a moment.',
      indexFailed: 'The thought index failed to load. Please refresh the page.',
    },
  },
} as const;

export const EXAMPLE_QUESTIONS: Record<AppLanguage, readonly string[]> = {
  zh: [
    '每天重复上班，我不知道为什么还要继续。',
    '两个选择都有代价，我怎样判断自己愿意承担哪一种？',
    '面对明显的不公，我怎样反抗才不会复制同样的伤害？',
    '我总想等一切完成以后再开始生活，这有什么问题？',
  ],
  en: [
    'Every day at work feels the same. Why should I continue?',
    'Both choices carry a cost. How do I decide which one I can accept?',
    'How can I resist an injustice without reproducing the same harm?',
    'I keep postponing life until everything is finished. What am I missing?',
  ],
};

export const THEME_LABELS: Record<AppLanguage, Record<ThemeId, string>> = {
  zh: {
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
  },
  en: {
    meaning: 'Meaning',
    absurd: 'The absurd',
    work: 'Work',
    freedom: 'Freedom',
    revolt: 'Revolt',
    limits: 'Limits',
    solidarity: 'Solidarity',
    hope: 'Hope',
    happiness: 'Happiness',
    mortality: 'Mortality',
    conscience: 'Conscience',
    action: 'Action',
  },
};

export const THEME_QUESTIONS: Record<AppLanguage, Record<ThemeId, string>> = {
  zh: {
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
  },
  en: {
    meaning: 'When an old goal disappears, how should I understand the value of my life?',
    absurd: 'Every day repeats itself. Why should I keep going?',
    work: 'I want to leave my job, but material pressure makes me afraid to act.',
    freedom: 'Both choices carry a cost. How do I take responsibility for my decision?',
    revolt: 'How can I refuse an injustice without increasing the harm?',
    limits: 'At what point does persistence cross a line that should not be sacrificed?',
    solidarity:
      'I feel unseen. How can I seek support without exposing more than I can bear?',
    hope: 'Nothing guarantees that things will improve. Is hope still honest?',
    happiness: 'I keep postponing life. How can I return to the present?',
    mortality:
      'Knowing that life is finite, I no longer want to postpone what matters indefinitely.',
    conscience:
      'How should I judge when external expectations conflict with my conscience?',
    action: 'I am afraid of being wrong. What low-risk step can I take now?',
  },
};

const ENGLISH_SAFETY_RESPONSES: Record<
  string,
  Omit<SafetyResponse, 'key' | 'category' | 'urgency'>
> = {
  'crisis-self-harm': {
    title: 'Put your immediate safety first',
    acknowledgment:
      'What you describe may mean that you are at immediate risk of harming yourself. A philosophical exercise is not the right response to this moment.',
    actions: [
      'If harm may happen within minutes or hours, contact local emergency services now or go to the nearest emergency department.',
      'Contact a trusted person and ask them to stay with you. If possible, move to a safer place where other people are present.',
      'Move medication, tools, or anything you could use to hurt yourself out of reach, or ask someone nearby to hold them for you.',
    ],
    closing:
      'You do not have to manage this moment alone. Get real-world company and professional help first.',
  },
  'crisis-violence': {
    title: 'Move away from the immediate danger',
    acknowledgment:
      'What you describe involves violence that may be happening now or soon. Reducing contact and getting real-world help comes first.',
    actions: [
      'If you can leave safely, go to a populated place with a clear exit and do not confront the person alone.',
      'Contact local emergency services and state your location, whether anyone is injured, and whether a weapon is present.',
      'Tell a trusted person where you are. If you fear you may hurt someone, move away from both the person and any weapon.',
    ],
    closing:
      'Interrupt the danger and let people with real-world response capacity intervene.',
  },
  'crisis-minor-danger': {
    title: "A minor's immediate safety comes first",
    acknowledgment:
      'What you describe may involve a child or young person in danger. Do not rely on an online response alone.',
    actions: [
      'If danger is happening now, contact local emergency services, police, or the appropriate child-protection service.',
      'Without increasing the risk, keep the minor with a trusted adult in a safer setting.',
      'Record the time, place, and facts for responders, but do not delay getting help in order to gather evidence.',
    ],
    closing:
      'Bring in people who have a legal duty and the practical ability to act as soon as possible.',
  },
  'crisis-fraud-coercion': {
    title: 'Stop transfers and further disclosure',
    acknowledgment:
      'What you describe may involve active fraud, extortion, or financial coercion. Interrupting the account risk matters more than analyzing motives.',
    actions: [
      'Stop transferring money and do not share passwords, verification codes, identity images, or remote-control access.',
      'Contact your bank or payment provider through an independently verified official channel and request a hold, freeze, or account protection.',
      'Preserve messages and transaction records, then contact local police or an anti-fraud service. Contact emergency services for any physical threat.',
    ],
    closing:
      'Do not let manufactured urgency keep you acting. Verify through an independent official channel.',
  },
  'crisis-medical-emergency': {
    title: 'This may need immediate medical attention',
    acknowledgment:
      'The symptoms you describe may be an acute medical emergency. A webpage cannot assess the severity and should not delay care.',
    actions: [
      'Contact local emergency medical services now and clearly state the symptoms, location, and when they began.',
      'Ask someone nearby to stay with you and help responders enter. Do not drive yourself unless an emergency operator directs you to do so.',
      "Follow the emergency operator's instructions and do not wait for another online response.",
    ],
    closing:
      'Get emergency medical help first; this page cannot diagnose or replace on-site care.',
  },
  'boundary-professional-advice': {
    title: 'This requires a qualified professional judgment',
    acknowledgment:
      'This tool can help clarify a situation and its value conflict, but it cannot provide a diagnosis, prescription, or guaranteed legal or financial conclusion.',
    actions: [
      'Record the key facts, dates, and questions, then take them to a qualified doctor, lawyer, or licensed financial professional.',
      'Before receiving qualified advice, do not stop medication, sign major documents, or take high-risk financial action solely because of web content.',
    ],
    closing:
      'A responsible professional opinion should explain its evidence, limits, and uncertainty. Treat any guaranteed outcome with caution.',
  },
};

export function localizeSafetyResponse(
  response: SafetyResponse,
  language: AppLanguage,
): SafetyResponse {
  if (language === 'zh') return response;
  const localized = ENGLISH_SAFETY_RESPONSES[response.key];
  return localized ? { ...response, ...localized } : response;
}
