import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ThoughtCardCollectionSchema } from '../src/content/schema';
import type { SourceRef, ThemeId, ThoughtCard } from '../src/types/content';

type ThemeProfile = {
  label: string;
  sourceContext: string;
  sharedTension: string;
  boundary: string;
  misreading: string;
  sources: SourceRef[];
  negativeSignals: string[];
  safetyTags: string[];
};

type BatchDraft = {
  theme: ThemeId;
  slug: string;
  title: string;
  secondaryThemes: [ThemeId, ThemeId];
  principle: string;
  situation: string;
  shortcut: string;
  focus: string;
  tensions: [string, string];
  misreading: string;
  keywords: [string, string, string];
  aliases: [string, string];
  relatedSituation: string;
  perspective: string;
  action: string;
  reflection: string;
  boundary?: string;
};

const mythSource: SourceRef = {
  work: '《西西弗神话》',
  section: '荒诞推理、荒诞的自由与西西弗神话',
  language: 'fr',
  sourceType: 'primary',
};
const rebelSource: SourceRef = {
  work: '《反抗者》',
  section: '反抗者、历史的反抗与中午的思想',
  language: 'fr',
  sourceType: 'primary',
};
const plagueSource: SourceRef = {
  work: '《鼠疫》',
  section: '共同劳动、见证与责任主题',
  language: 'fr',
  sourceType: 'primary',
};
const nuptialsSource: SourceRef = {
  work: '《婚礼集》',
  section: '当下、感官生活与自然主题',
  language: 'fr',
  sourceType: 'primary',
};
const summerSource: SourceRef = {
  work: '《夏天集》',
  section: '限度、重返现实与当下之美主题',
  language: 'fr',
  sourceType: 'primary',
};
const neitherSource: SourceRef = {
  work: '《既非受害者，也非刽子手》',
  section: '拒绝杀戮、节制与对话主题',
  language: 'fr',
  sourceType: 'primary',
};
const lettersSource: SourceRef = {
  work: '《致一个德国朋友的信》',
  section: '正义、责任与共同人性主题',
  language: 'fr',
  sourceType: 'primary',
};

const profiles = {
  meaning: {
    label: '意义',
    sourceContext: '荒诞推理对终极解释与具体生活价值的区分',
    sharedTension: '终极答案与具体价值',
    boundary:
      '承认终极答案缺席，不等于否定具体关系、工作与行动中的价值，也不能用来处理即时自伤危险。',
    misreading: '没有终极意义就可以否定一切具体价值',
    sources: [mythSource],
    negativeSignals: ['想自杀', '不想活了', '准备自残'],
    safetyTags: ['meaning', 'self-harm-boundary'],
  },
  absurd: {
    label: '荒诞',
    sourceContext: '人要求清晰而世界不提供相称回答的持续张力',
    sharedTension: '清晰要求与世界沉默',
    boundary: '清醒面对矛盾不等于赞美痛苦、拒绝改善处境或认为所有选择都同样无所谓。',
    misreading: '既然生活荒诞，行动和判断都不再重要',
    sources: [mythSource],
    negativeSignals: ['马上要自杀', '准备跳楼', '正在伤害自己'],
    safetyTags: ['absurd', 'self-harm-boundary'],
  },
  work: {
    label: '工作',
    sourceContext: '荒诞自由与现实处境中仍可辨认的有限选择',
    sharedTension: '现实约束与有限自由',
    boundary:
      '辨认工作中的选择空间不能抹去经济压力、结构性不公、照护责任或身体健康的现实限制。',
    misreading: '工作困境完全是个人态度或意志造成的',
    sources: [mythSource],
    negativeSignals: ['胸口剧痛', '无法呼吸', '正在被打'],
    safetyTags: ['work', 'medical-boundary'],
  },
  freedom: {
    label: '自由',
    sourceContext: '无终极保证时的有限自由及其现实后果',
    sharedTension: '自由与后果',
    boundary:
      '自由不是全能，也不要求一个人独自承担胁迫、歧视或结构性不公造成的全部后果。',
    misreading: '真正自由就应该不受任何关系和后果限制',
    sources: [mythSource, rebelSource],
    negativeSignals: ['被迫转账', '被锁在房间', '持刀威胁'],
    safetyTags: ['freedom', 'coercion-boundary'],
  },
  revolt: {
    label: '反抗',
    sourceContext: '反抗对共同价值的肯定以及对暴力手段的限制',
    sharedTension: '拒绝不公与保存共同价值',
    boundary: '限制报复性伤害不等于要求受害者沉默、原谅或放弃取证、申诉和有组织的抵抗。',
    misreading: '反抗越激烈越正当，手段不需要另行审查',
    sources: [rebelSource, neitherSource],
    negativeSignals: ['我要杀人', '带刀去找他', '准备袭击'],
    safetyTags: ['revolt', 'violence-boundary'],
  },
  limits: {
    label: '限度',
    sourceContext: '反抗中的节制、共同尊严与目的手段关系',
    sharedTension: '坚持行动与不越过界线',
    boundary:
      '限度不是消极服从，也不把所有冲突变成个人自律问题；即时危险需要现实安全与专业支持。',
    misreading: '有节制就意味着退让、软弱或什么都不做',
    sources: [rebelSource],
    negativeSignals: ['大量出血', '正在施暴', '孩子正在被伤害'],
    safetyTags: ['limits', 'harm-boundary'],
  },
  solidarity: {
    label: '团结',
    sourceContext: '共同处境中的见证、有限互助与持续劳动',
    sharedTension: '个人处境与共同责任',
    boundary:
      '团结不要求抹平差异、公开全部经历或让一个人承担所有责任，也不能替代紧急和专业服务。',
    misreading: '团结要求无条件牺牲自己并与群体保持一致',
    sources: [plagueSource, rebelSource],
    negativeSignals: ['孩子失踪', '正在被打', '失去意识'],
    safetyTags: ['solidarity', 'harm-boundary'],
  },
  hope: {
    label: '希望',
    sourceContext: '不诉诸虚假保证而仍继续生活和行动的清醒态度',
    sharedTension: '希望与现实诚实',
    boundary:
      '不依赖保证不等于否定合理期待、治疗支持或长期计划，更不能把绝望中的危险信号浪漫化。',
    misreading: '清醒就必须放弃一切希望和未来计划',
    sources: [mythSource, summerSource],
    negativeSignals: ['想死', '写好了遗书', '吞了很多药想死'],
    safetyTags: ['hope', 'self-harm-boundary'],
  },
  happiness: {
    label: '幸福',
    sourceContext: '感官生活、当下经验与不否认苦难的幸福',
    sharedTension: '当下幸福与现实苦难',
    boundary:
      '重视当下不要求否认创伤、贫困或责任，也不把短暂愉悦当成解决所有问题的方法。',
    misreading: '只要享受当下就不必面对责任和痛苦',
    sources: [nuptialsSource, summerSource],
    negativeSignals: ['严重过敏', '无法呼吸', '被迫转账'],
    safetyTags: ['happiness', 'reality-boundary'],
  },
  mortality: {
    label: '死亡意识',
    sourceContext: '有限生命对当下时间和具体选择的照亮',
    sharedTension: '生命有限与如何使用时间',
    boundary:
      '死亡意识不能被用来鼓励冒险、自伤或轻视哀痛；出现即时危险时必须先进入安全分流。',
    misreading: '生命有限就应该立刻冒险或放弃长期责任',
    sources: [mythSource, summerSource],
    negativeSignals: ['结束生命', '准备割腕', '从楼上跳下去'],
    safetyTags: ['mortality', 'self-harm-boundary'],
  },
  conscience: {
    label: '良知',
    sourceContext: '在历史行动中保留判断、限度与共同人性',
    sharedTension: '个人判断与外部要求',
    boundary:
      '坚持良知不保证个人永远正确，也不要求在暴力、胁迫或重大违法风险中独自对抗。',
    misreading: '只要主观确信自己正确，任何手段都可以接受',
    sources: [rebelSource, lettersSource],
    negativeSignals: ['威胁要杀我', '被迫转账', '正在被打'],
    safetyTags: ['conscience', 'coercion-boundary'],
  },
  action: {
    label: '行动',
    sourceContext: '没有终极保证时仍保持限度的具体行动',
    sharedTension: '不确定性与现实行动',
    boundary:
      '有限行动不是冲动，也不能替代医疗、法律或安全处置；风险越高，越需要可逆步骤和现实支持。',
    misreading: '只要开始行动，方向、手段和后果就不必再检查',
    sources: [rebelSource, plagueSource],
    negativeSignals: ['准备报复', '胸口剧痛', '孩子被绑架'],
    safetyTags: ['action', 'risk-boundary'],
  },
} satisfies Record<ThemeId, ThemeProfile>;

const meaningDrafts: BatchDraft[] = [
  {
    theme: 'meaning',
    slug: 'achievement-after-emptiness',
    title: '成就完成后不急着给生活判空',
    secondaryThemes: ['absurd', 'action'],
    principle:
      '一个目标完成后出现空洞，并不能证明此前努力或此后生活都没有价值；它首先暴露了目标无法承担终极解释的事实。',
    situation: '长期追逐的考试、项目或职位终于完成却感到空洞',
    shortcut: '把目标结束直接解释为全部生活失去价值',
    focus: '目标曾承载的具体价值和此刻仍可照料的生活部分',
    tensions: ['成就与空洞', '目标结束与生活继续'],
    misreading: '过去的努力没有带来永久满足，所以全都白费',
    keywords: ['成就空虚', '目标完成', '成功以后'],
    aliases: ['终于成功却不开心', '完成大事后很空'],
    relatedSituation: '毕业、晋升或长期项目结束后失去方向',
    perspective:
      '一个目标不能给生活终极担保，不等于它在具体时间里没有真实价值；空洞可以成为重新辨认价值的起点。',
    action: '分别写下这个目标已经结束的功能，以及它过去保护或培养的两项具体价值。',
    reflection: '如果不要求下一个目标填满全部生活，你仍想保留此前努力中的什么？',
  },
  {
    theme: 'meaning',
    slug: 'social-metrics-worth',
    title: '不让外部排名垄断生活价值',
    secondaryThemes: ['freedom', 'conscience'],
    principle:
      '可量化的排名能够描述部分结果，却不能提供一个人全部生活价值的终极尺度；把两者等同会遮蔽无法排名的具体关系与行动。',
    situation: '收入、粉丝、成绩或职位排名持续影响自我判断',
    shortcut: '把外部数字当成生活是否值得的完整证明',
    focus: '数字能说明的结果与数字无法代替的个人判断',
    tensions: ['外部评价与自我判断', '可量化结果与具体价值'],
    misreading: '不以排名定义自己就可以完全无视现实反馈',
    keywords: ['排名焦虑', '收入比较', '社会评价'],
    aliases: ['别人都比我成功', '数字决定我的价值'],
    relatedSituation: '社交媒体或绩效榜单引发持续自我否定',
    perspective:
      '排名可以成为事实的一部分，却不该被提升为生活的终极裁判；你仍需判断哪些价值值得由自己承担。',
    action: '选出一个最近困扰你的数字，再列出它能说明和不能说明的内容各两项。',
    reflection: '当排名暂时退到背景，你最不愿放弃的是哪一种具体生活价值？',
  },
  {
    theme: 'meaning',
    slug: 'belief-change-grief',
    title: '允许旧信念失效后的哀悼',
    secondaryThemes: ['hope', 'mortality'],
    principle:
      '旧信念失效会带来真实失落，但不必立刻用另一套绝对答案填补；诚实地停留在问题中也保留了重新判断的可能。',
    situation: '长期依赖的信念、身份或人生脚本突然不再可信',
    shortcut: '急着寻找一个同样绝对的新答案消除不确定',
    focus: '失去旧解释的哀悼与仍然存在的具体经验',
    tensions: ['旧信念与新判断', '失落与继续生活'],
    misreading: '不立刻找到新信念就意味着永远没有方向',
    keywords: ['信念动摇', '身份失落', '人生脚本'],
    aliases: ['以前相信的都不成立了', '不知道还能相信什么'],
    relatedSituation: '离开熟悉群体或价值体系后感到悬空',
    perspective:
      '信念失效留下的空白不必马上被填满；保持诚实能够让你区分真正失去的东西和仍在继续的生活。',
    action: '写下旧信念曾经提供的三种功能，并判断其中哪些仍可用更有限的方式保留。',
    reflection: '你怀念的是那个答案本身，还是它曾经给你的安全、归属或方向？',
  },
  {
    theme: 'meaning',
    slug: 'need-final-explanation',
    title: '在没有最终解释时保留判断',
    secondaryThemes: ['absurd', 'freedom'],
    principle:
      '现实问题未必拥有可以一次封闭的最终解释；承认解释有限，反而能阻止人为了确定感接受未经检验的答案。',
    situation: '反复追问一段经历为什么发生，却得不到完整解释',
    shortcut: '认为只有找到唯一原因才能继续生活',
    focus: '解释的有限性与仍可作出的现实判断',
    tensions: ['最终解释与有限理解', '确定感与诚实'],
    misreading: '没有唯一解释就不需要查明事实或责任',
    keywords: ['为什么发生', '找不到原因', '必须想明白'],
    aliases: ['没有答案就过不去', '一定要知道为什么'],
    relatedSituation: '关系结束或失败之后持续寻找单一原因',
    perspective:
      '你可以继续查明事实，却不必把生活暂停到唯一解释出现；有限理解也足以支持下一步判断。',
    action: '把已经确认的事实、仍不知道的部分和不依赖完整解释也能做的决定分成三栏。',
    reflection: '你现在寻找的是更准确的理解，还是一个能够取消不确定性的答案？',
  },
  {
    theme: 'meaning',
    slug: 'small-commitments-value',
    title: '让价值回到可承担的小承诺',
    secondaryThemes: ['action', 'solidarity'],
    principle:
      '具体价值不需要先被证明为永恒；对一件事持续、诚实而有限的照料，可以在没有终极担保时仍构成生活的方向。',
    situation: '宏大目标失效后，觉得日常小事都不值得认真',
    shortcut: '只承认能够改变一生或世界的行动有价值',
    focus: '有限承诺所保护的具体人、关系和工作',
    tensions: ['宏大目标与日常承诺', '有限作用与真实价值'],
    misreading: '重视小事就是放弃改变更大的问题',
    keywords: ['小事价值', '日常承诺', '具体意义'],
    aliases: ['做这些小事有什么用', '不伟大就不值得'],
    relatedSituation: '照料、学习或社区工作看不到宏大结果',
    perspective:
      '价值未必来自规模；一项有限承诺只要诚实地保护了具体事物，就不必借永恒结果证明自己。',
    action: '选一项你愿意在未来七天可靠完成的小承诺，并写明它具体保护什么。',
    reflection: '哪一件看似普通的事，一旦无人照料就会让你觉得生活少了重要部分？',
  },
  {
    theme: 'meaning',
    slug: 'recognition-and-legacy',
    title: '不把被记住当成存在证明',
    secondaryThemes: ['mortality', 'happiness'],
    principle:
      '渴望留下痕迹可以推动创造，但他人的长期记忆无法成为生活价值的可靠担保；价值仍要回到创造发生时的真实经验与责任。',
    situation: '担心自己的工作无人记得，因此怀疑一切努力',
    shortcut: '把是否被广泛记住当作存在是否值得的唯一标准',
    focus: '留下痕迹的愿望与当下创造的具体价值',
    tensions: ['被记住与当下生活', '公众认可与具体创造'],
    misreading: '不追求永恒名声就不需要认真完成作品',
    keywords: ['被遗忘', '留下痕迹', '人生遗产'],
    aliases: ['没人记得我怎么办', '努力最后都会消失'],
    relatedSituation: '创作或长期工作缺少关注与认可',
    perspective:
      '被记住无法由你控制，但创造时是否诚实、是否照料了具体的人与事，仍属于可以判断的范围。',
    action: '写下这项工作即使不被广泛记住，也已经对谁或什么产生了具体影响。',
    reflection: '如果名声不再提供担保，你仍愿意把哪一部分工作做得诚实？',
  },
];

const absurdDrafts: BatchDraft[] = [
  {
    theme: 'absurd',
    slug: 'bureaucracy-repetition',
    title: '在无尽手续里保留清醒',
    secondaryThemes: ['work', 'action'],
    principle:
      '重复而缺乏回应的制度过程会放大荒诞感；清醒不是假装流程合理，而是在承认限制后仍辨认可验证的下一步。',
    situation: '反复提交材料、等待回复或面对互相推诿的流程',
    shortcut: '在全面服从和彻底放弃之间来回摆动',
    focus: '流程的真实限制与仍可留下记录的行动',
    tensions: ['程序重复与个人时间', '无力感与有限行动'],
    misreading: '承认制度荒诞就没有必要继续申诉或留证',
    keywords: ['官僚流程', '反复提交', '互相推诿'],
    aliases: ['手续没完没了', '一直让我重新提交'],
    relatedSituation: '公共服务、报销或组织审批长期没有明确进展',
    perspective:
      '流程没有给出相称回应时，荒诞感是真实的；你仍可以拒绝把全部注意力交给它，并保留可核对的行动。',
    action: '整理一次完整时间线，只保留下一次联系所需的事实、材料和明确请求。',
    reflection: '除了等待对方改变，你还能控制哪一项记录、期限或求助渠道？',
  },
  {
    theme: 'absurd',
    slug: 'plans-disrupted',
    title: '计划被打断时不制造虚假控制',
    secondaryThemes: ['freedom', 'hope'],
    principle:
      '世界不会因为计划合理就保证配合；承认偶然性不是放弃计划，而是不把计划误认为对未来的所有权。',
    situation: '精心安排的旅行、工作或关系计划被突发事件打断',
    shortcut: '把失控理解为个人失败或生活故意针对自己',
    focus: '计划提供的方向与现实保留的偶然性',
    tensions: ['计划与偶然', '控制愿望与现实变化'],
    misreading: '未来不可控，所以任何准备都没有价值',
    keywords: ['计划打乱', '突发变化', '失去控制'],
    aliases: ['事情完全不按计划', '为什么总有意外'],
    relatedSituation: '航班取消、项目中断或他人改变决定',
    perspective:
      '计划可以组织行动，却不能取消偶然；此刻的清醒是把已经失去的控制与仍可调整的部分分开。',
    action: '写下已经不可恢复、可以重新安排和今天必须处理的事项各一项。',
    reflection: '你最难接受的是计划本身失败，还是自己无法保证未来按预期发生？',
  },
  {
    theme: 'absurd',
    slug: 'contradictory-self',
    title: '容纳自己没有被一次解释完',
    secondaryThemes: ['meaning', 'conscience'],
    principle:
      '人会同时拥有相互冲突的愿望，试图用一个整齐标签彻底解释自己，可能制造比矛盾本身更大的自欺。',
    situation: '既想靠近又想离开，或既重视稳定又渴望变化',
    shortcut: '要求自己立刻证明哪一个愿望才是真实自我',
    focus: '冲突愿望各自在保护的需要与代价',
    tensions: ['靠近与离开', '稳定与变化'],
    misreading: '承认矛盾就可以无限拖延所有决定',
    keywords: ['内心矛盾', '反复摇摆', '真实自我'],
    aliases: ['我到底想要什么', '两个我在打架'],
    relatedSituation: '关系、职业或居住选择中持续反复',
    perspective:
      '你不必用一个标签消灭矛盾；先看见每个愿望在保护什么，判断会比追问哪个才是真我更具体。',
    action: '为两个冲突愿望分别写下它想保护的东西和可能造成的代价。',
    reflection: '这两个愿望分别在保护你免于失去什么？',
  },
  {
    theme: 'absurd',
    slug: 'care-routine',
    title: '在照护重复中拒绝虚假崇高',
    secondaryThemes: ['solidarity', 'limits'],
    principle:
      '重复照护可以既有价值又令人疲惫；承认单调、怨气和限度，不会自动取消照护行为中的具体团结。',
    situation: '长期照顾家人、孩子或需要支持的人而日复一日重复',
    shortcut: '在把照护神圣化和把它视为毫无价值之间二选一',
    focus: '照护的具体价值与照护者真实存在的限度',
    tensions: ['照护责任与个人耗损', '具体价值与重复疲惫'],
    misreading: '照护有价值就应该毫无怨言地无限承担',
    keywords: ['照护重复', '照顾家人', '照护疲惫'],
    aliases: ['每天都在照顾别人', '照护生活没有尽头'],
    relatedSituation: '长期家务与照顾责任缺少替代和休息',
    perspective:
      '重复不会自动抹去照护的价值，也不能把疲惫变成你的道德过错；两者需要同时被看见。',
    action: '列出一项必须继续的照护任务和一项可以转交、降低标准或暂停的任务。',
    reflection: '你希望继续保护谁，同时又有哪些限度需要被共同承担？',
  },
  {
    theme: 'absurd',
    slug: 'failure-repetition',
    title: '重复失败不等于同一判决',
    secondaryThemes: ['action', 'hope'],
    principle:
      '同类失败反复发生会制造宿命感，但每次处境、信息和行动仍可能不同；清醒要求比较事实，而不是让重复替未来宣判。',
    situation: '多次求职、考试、投稿或尝试都没有得到结果',
    shortcut: '把重复失败解释为未来必然继续失败',
    focus: '重复模式中真正相同与已经改变的条件',
    tensions: ['重复失败与再次行动', '经验判断与宿命结论'],
    misreading: '拒绝宿命感就是无视已经出现的失败模式',
    keywords: ['反复失败', '又没成功', '注定失败'],
    aliases: ['每次结果都一样', '再试也没有用'],
    relatedSituation: '长期申请被拒或技能练习停滞',
    perspective:
      '重复值得被认真分析，却不足以成为宿命；你需要找出模式，而不是让模式替所有未来发言。',
    action: '比较最近两次尝试，写下一个保持不变的条件和一个可以改变的变量。',
    reflection: '你是在依据可验证的模式调整行动，还是让过去替尚未发生的结果下结论？',
  },
  {
    theme: 'absurd',
    slug: 'humor-and-lucidity',
    title: '让幽默服务于清醒而非逃避',
    secondaryThemes: ['happiness', 'conscience'],
    principle:
      '面对矛盾时的幽默可以松动虚假庄严，但若它持续遮住伤害和责任，也会成为另一种不愿直视现实的方式。',
    situation: '总用玩笑处理自己的压力、失败或关系冲突',
    shortcut: '认为只要能笑出来，问题就不需要再被认真对待',
    focus: '幽默带来的距离与问题仍要求的诚实回应',
    tensions: ['轻盈与诚实', '自嘲与自我遮蔽'],
    misreading: '保持清醒就必须严肃、沉重并拒绝一切幽默',
    keywords: ['自嘲', '用玩笑逃避', '黑色幽默'],
    aliases: ['笑一笑就过去了', '我总拿自己开玩笑'],
    relatedSituation: '朋友无法判断玩笑背后是否需要支持',
    perspective:
      '幽默可以让你与困境保持距离，却不必替代判断；真正的轻盈仍能说清哪里需要改变。',
    action: '把最近一个反复出现的玩笑改写成一句不带玩笑的事实描述。',
    reflection: '当笑声停下时，这件事还有哪一部分需要被你或他人认真听见？',
  },
];

const workDrafts: BatchDraft[] = [
  {
    theme: 'work',
    slug: 'burnout-signals',
    title: '把倦怠当作信息而非品格判决',
    secondaryThemes: ['limits', 'action'],
    principle:
      '持续倦怠能够说明工作安排与人的限度发生冲突，却不能单独证明一个人懒惰、失败或必须立即离职。',
    situation: '长期疲惫、注意力下降并开始厌恶原本能够完成的工作',
    shortcut: '把耗尽归结为意志薄弱或把辞职当成唯一答案',
    focus: '可观察的耗损来源与不同风险等级的调整空间',
    tensions: ['责任与恢复', '坚持与身体限度'],
    misreading: '承认倦怠就可以把所有责任交给情绪决定',
    keywords: ['职业倦怠', '工作耗尽', '上班疲惫'],
    aliases: ['一想到工作就累', '是不是我太懒'],
    relatedSituation: '工作效率下降并伴随长期睡眠或情绪问题',
    perspective:
      '倦怠首先是一组需要核对的现实信号，不是人格判决；清醒要求看见工作设计、资源和限度之间的关系。',
    action: '记录一周内最消耗你的三个具体环节，并选一个可以协商或缩减的环节。',
    reflection: '你真正缺少的是努力，还是恢复、资源或对工作边界的控制？',
    boundary: '若出现急性身体症状或持续功能受损，应优先寻求合格的医疗支持。',
  },
  {
    theme: 'work',
    slug: 'career-status-identity',
    title: '不让职位吞没全部自我判断',
    secondaryThemes: ['meaning', 'freedom'],
    principle:
      '职业角色组织了时间与责任，却不能穷尽一个人的存在；把职位当成全部自我，会让任何变化都像整个人被取消。',
    situation: '职位变化、降级或离开知名公司后怀疑自己是谁',
    shortcut: '把职业标签与全部个人价值绑定',
    focus: '角色承担的功能与角色之外仍可实践的价值',
    tensions: ['职业角色与完整自我', '社会身份与个人判断'],
    misreading: '职业不是全部，所以工作质量和承诺都不重要',
    keywords: ['职业身份', '职位焦虑', '离职失落'],
    aliases: ['没有这个头衔我是谁', '工作就是我的全部'],
    relatedSituation: '转行、退休或组织调整后出现身份空白',
    perspective:
      '职位是真实处境的一部分，但不是终极定义；你可以继续承担工作，同时拒绝让它垄断所有自我判断。',
    action: '列出三个不依赖当前职位也能被你实践的能力、关系或价值。',
    reflection: '如果头衔暂时消失，你最希望别人仍能从哪些行动认出你？',
  },
  {
    theme: 'work',
    slug: 'unemployment-and-worth',
    title: '失业不替一个人的价值作结论',
    secondaryThemes: ['meaning', 'solidarity'],
    principle:
      '失去工作会带来真实的经济与身份压力，但市场暂时没有提供岗位，不等于一个人的能力、尊严和具体关系同时失效。',
    situation: '失业或求职很久没有结果，开始全面否定自己',
    shortcut: '把劳动市场的结果解释为完整的人格评价',
    focus: '现实经济风险与不由招聘结果决定的个人价值',
    tensions: ['经济需要与个人尊严', '市场评价与自我判断'],
    misreading: '维护尊严就可以忽视收入和求职策略的现实问题',
    keywords: ['失业', '求职失败', '没有工作'],
    aliases: ['找不到工作就是没用', '失业后抬不起头'],
    relatedSituation: '裁员后同时面对经济压力和社交退缩',
    perspective:
      '失业需要现实计划，却不拥有替你整个人下结论的权力；把两者分开，行动才不会被羞耻完全占据。',
    action: '把眼前任务分为现金流、求职改进和支持联系三类，各安排一个可完成步骤。',
    reflection: '招聘结果没有看见的哪些能力，仍需要由你的实际行动继续证明？',
  },
  {
    theme: 'work',
    slug: 'ethical-conflict-job',
    title: '在职业要求与良知之间画线',
    secondaryThemes: ['conscience', 'limits'],
    principle:
      '职业服从不能自动免除个人对手段与伤害的判断；真正的困难是找出哪条界线一旦越过，就改变了工作的道德性质。',
    situation: '被要求隐瞒事实、误导客户或执行自己认为有害的方案',
    shortcut: '在无条件服从和不计后果地退出之间二选一',
    focus: '职业责任、个人良知和可能受影响的人',
    tensions: ['组织命令与个人良知', '生计与道德界线'],
    misreading: '只要主观不舒服就足以断定同事都在作恶',
    keywords: ['职业伦理', '老板要求撒谎', '工作良知'],
    aliases: ['这份工作违背原则', '服从命令还是拒绝'],
    relatedSituation: '担心拒绝不当要求会失去收入或遭到报复',
    perspective:
      '职位可以分配任务，却不能替你取消判断；你需要说明具体伤害、不可越过的界线和现实风险。',
    action: '先保存与事实相关的记录，并用一句话写清你不能执行的具体行为及理由。',
    reflection: '哪一种行为一旦由你完成，就会使你无法再说自己只是在履行职责？',
    boundary: '若涉及违法、报复或现实威胁，应通过合格的法律与安全渠道寻求支持。',
  },
  {
    theme: 'work',
    slug: 'invisible-care-labor',
    title: '看见没有头衔的劳动',
    secondaryThemes: ['solidarity', 'happiness'],
    principle:
      '劳动的现实价值并不只由工资和头衔决定；维持家庭、社区与关系的重复工作，也应被看见、分配和设置限度。',
    situation: '承担大量家务、情绪支持或照护，却常被视为没有工作',
    shortcut: '因为劳动没有收入就否认它的时间与价值',
    focus: '不可见劳动创造的具体条件和应被共同承担的成本',
    tensions: ['无偿劳动与社会认可', '照护价值与个人时间'],
    misreading: '照护有价值就应该由最擅长的人无限承担',
    keywords: ['无偿劳动', '家务', '照护工作'],
    aliases: ['我明明很忙却被说没工作', '没人看见我的付出'],
    relatedSituation: '家庭分工长期失衡并引发怨气',
    perspective:
      '没有工资不等于没有劳动；清醒需要把时间、责任和受益者具体化，才能讨论公平分配。',
    action: '记录一周内重复发生的无偿任务和耗时，选择一项提出明确分工请求。',
    reflection: '这些劳动让谁的生活得以正常运行，又为什么默认由你承担？',
  },
  {
    theme: 'work',
    slug: 'endless-promotion',
    title: '让晋升重新成为手段',
    secondaryThemes: ['meaning', 'limits'],
    principle:
      '晋升和增长可以改善处境，却不能无限推迟生活；当下一层级只服务于再下一层级，工作目标就可能吞没它原本要支持的生活。',
    situation: '每次晋升后立刻追逐下一目标，始终无法感到足够',
    shortcut: '把继续上升当成无需解释的唯一方向',
    focus: '职业增长服务的具体生活与它正在索取的代价',
    tensions: ['进取与足够', '职业增长与当下生活'],
    misreading: '反思晋升就等于拒绝进步和专业成长',
    keywords: ['晋升焦虑', '永远不够', '职业野心'],
    aliases: ['升职后还是空', '不能停下来休息'],
    relatedSituation: '长期把关系、健康与兴趣推迟到下一次成功以后',
    perspective:
      '增长需要回答它服务什么；如果晋升只为了继续晋升，它就不再自动拥有支配全部时间的理由。',
    action: '为下一个职业目标写出一项具体收益、一项代价和一个不会为它牺牲的生活部分。',
    reflection: '你追求下一层级，是为了支持怎样的生活，还是为了避免面对已经拥有的生活？',
  },
];

const freedomDrafts: BatchDraft[] = [
  {
    theme: 'freedom',
    slug: 'family-expectations',
    title: '把家人期待与自己的同意分开',
    secondaryThemes: ['conscience', 'limits'],
    principle:
      '亲近关系会形成真实责任，却不能自动替一个人完成终身选择；自由始于分清关心、期待、胁迫和自己的同意。',
    situation: '家人强烈期待自己选择某个职业、伴侣或生活方式',
    shortcut: '在完全服从和彻底断绝关系之间二选一',
    focus: '关系责任与仍需由自己承担的决定',
    tensions: ['家庭期待与个人选择', '关系维持与自我判断'],
    misreading: '自主决定就不需要考虑家人的现实影响',
    keywords: ['家庭期待', '父母安排', '替我决定'],
    aliases: ['不按家里说的就是不孝吗', '家人不接受我的选择'],
    relatedSituation: '成年后的职业、婚恋或居住决定受到家庭压力',
    perspective:
      '家人的期待可以进入你的考虑，却不能以关系之名替你承担后果；最终同意仍需要由你说清。',
    action: '把家人的关切、他们的偏好和你的不可让渡决定分别写成三栏。',
    reflection: '哪些后果需要你亲自承担，因此也必须保留由你判断的空间？',
    boundary: '若期待已经变成威胁、控制财产或限制人身自由，应优先寻求现实支持。',
  },
  {
    theme: 'freedom',
    slug: 'relocation-costs',
    title: '把迁移的获得与失去同时带进选择',
    secondaryThemes: ['mortality', 'solidarity'],
    principle:
      '搬迁能够打开新的生活，也会切断熟悉支持；自由不是只看离开的解放感，而是清醒承担获得与失去的完整后果。',
    situation: '考虑搬到另一座城市或国家，却担心离开关系与稳定',
    shortcut: '把迁移想象成彻底重启，或把留下一概解释为怯懦',
    focus: '新机会、现实成本与可以重建的支持关系',
    tensions: ['离开与留下', '机会与归属'],
    misreading: '真正勇敢的人就应该毫不犹豫地远走',
    keywords: ['搬家选择', '去外地', '离开家乡'],
    aliases: ['要不要换城市', '想走又舍不得'],
    relatedSituation: '留学、外派或伴侣异地带来的迁移决定',
    perspective:
      '迁移既不是自动解放，也不是对旧生活的背叛；更诚实的自由会同时计算机会、失去和重建支持的责任。',
    action: '为离开和留下各写一项不可逆代价，再找出一个可在决定前试行的准备步骤。',
    reflection: '你想离开的究竟是一个地点，还是在那个地点形成的某种生活方式？',
  },
  {
    theme: 'freedom',
    slug: 'relationship-leaving',
    title: '离开关系也要面对现实后果',
    secondaryThemes: ['limits', 'conscience'],
    principle:
      '结束关系可能是必要的自由行动，但自由不取消对共同财务、照护安排、承诺和安全后果的诚实处理。',
    situation: '想结束一段不再适合的关系，却害怕伤害对方或承担变化',
    shortcut: '把留下等同善良，或把离开等同彻底摆脱责任',
    focus: '个人边界与仍需妥善处理的共同后果',
    tensions: ['离开与责任', '个人边界与共同承诺'],
    misreading: '只要关系让我不快乐，就可以忽略对方的知情与现实安排',
    keywords: ['结束关系', '想分手', '离开伴侣'],
    aliases: ['不爱了要不要走', '留下只是怕伤害他'],
    relatedSituation: '共同居住、财务或照护责任让关系结束更复杂',
    perspective:
      '你可以承认关系已到限度，同时不把自由误写成没有后果；离开方式也表达你要维护的价值。',
    action: '先区分必须立即保护的边界、需要协商的共同事项和可以稍后处理的情绪问题。',
    reflection: '如果离开是必要的，你希望离开的方式仍保留怎样的诚实与限度？',
    boundary: '如果关系中存在暴力或控制，应先制定安全计划，不要求面对面协商。',
  },
  {
    theme: 'freedom',
    slug: 'fear-of-regret',
    title: '不把后悔风险变成行动禁令',
    secondaryThemes: ['action', 'hope'],
    principle:
      '任何重要选择都可能带来后悔；要求决定预先消除全部后悔，等于要求未来提供它无法给出的保证。',
    situation: '两个选项都可能失去重要东西，因此长期无法决定',
    shortcut: '等待一个能够保证永不后悔的信号',
    focus: '可承担的后果与可以修正的决定部分',
    tensions: ['选择与后悔', '行动与保证'],
    misreading: '既然无法避免后悔，就可以随便选择',
    keywords: ['害怕后悔', '选择困难', '不敢决定'],
    aliases: ['怎么选都怕错', '想要绝对正确的决定'],
    relatedSituation: '工作、关系或教育选择长期拖延',
    perspective:
      '你无法提前取消所有后悔，却可以比较哪种后果更符合愿意承担的责任，以及哪些部分仍可修正。',
    action: '为每个选项写下最可能后悔的原因，并标出其中可逆与不可逆的部分。',
    reflection: '你想避免的是某个具体损失，还是任何选择都不可能提供的绝对无悔？',
  },
  {
    theme: 'freedom',
    slug: 'saying-no-to-role',
    title: '对固定角色说不而不否定关系',
    secondaryThemes: ['revolt', 'solidarity'],
    principle:
      '拒绝一个被固定分配的角色，可以是在维护共同关系中的平等；说不针对的是不再可接受的安排，不必否定所有关系价值。',
    situation: '总被视为懂事的人、解决问题的人或必须让步的人',
    shortcut: '认为只有继续扮演角色才能维持关系',
    focus: '角色带来的秩序与它长期压缩的个人选择',
    tensions: ['关系角色与个人自由', '维持秩序与重新协商'],
    misreading: '拒绝旧角色就可以不说明新的责任分配',
    keywords: ['家庭角色', '总是让步', '懂事的人'],
    aliases: ['为什么总是我负责', '不想再当和事佬'],
    relatedSituation: '家庭或团队把情绪劳动固定交给一个人',
    perspective: '对角色说不未必是拒绝关系，而可能是在要求关系不再依赖你的单方面牺牲。',
    action: '选择一个最常被默认的任务，用具体句子说明你不再独自承担以及希望如何分配。',
    reflection: '这个角色保护了关系的什么，又长期让谁付出了没有被讨论的代价？',
  },
  {
    theme: 'freedom',
    slug: 'limited-options',
    title: '在选择很少时仍辨认有限自由',
    secondaryThemes: ['work', 'action'],
    principle:
      '贫困、疾病、歧视或照护责任会真实缩小选择；有限自由不是否认这些条件，而是避免把受限处境写成任何行动都不可能。',
    situation: '经济、身体或家庭条件让可选方案非常有限',
    shortcut: '把有限选择说成完全没有选择，或把责任全部推回个人',
    focus: '真实不可控条件与仍可争取、协商或准备的部分',
    tensions: ['受限处境与有限选择', '结构约束与个人行动'],
    misreading: '只要强调自由，就说明困境都是自己造成的',
    keywords: ['选择很少', '现实限制', '没有办法'],
    aliases: ['我根本没得选', '条件不允许改变'],
    relatedSituation: '收入、残障、签证或照护责任限制生活决定',
    perspective:
      '承认选择很少，是对现实的诚实；继续辨认可争取的部分，则防止限制替你取消全部行动。',
    action: '把限制分为暂时不可控、需要外部支持和能够独立调整三类，各写一项。',
    reflection: '在不否认现实限制的前提下，哪一个最小决定仍然属于你？',
    boundary: '需要专业、公共或无障碍支持的部分，不应被改写成个人意志不足。',
  },
];

const revoltDrafts: BatchDraft[] = [
  {
    theme: 'revolt',
    slug: 'workplace-injustice',
    title: '让职场不公的拒绝留下证据',
    secondaryThemes: ['work', 'action'],
    principle:
      '对职场不公说不，需要把愤怒转化为可说明的界线、事实和共同诉求；否则拒绝容易被孤立成个人冲突。',
    situation: '遭遇不透明分配、差别待遇或反复被剥夺应有资源',
    shortcut: '只在情绪爆发和继续忍受之间选择',
    focus: '被越过的具体界线与能够被共同核对的事实',
    tensions: ['愤怒与有效表达', '个人遭遇与共同规则'],
    misreading: '留下证据和使用程序就是向不公低头',
    keywords: ['职场不公', '差别待遇', '投诉申诉'],
    aliases: ['公司对我不公平', '想举报又怕报复'],
    relatedSituation: '绩效、晋升或资源分配长期缺少透明规则',
    perspective:
      '愤怒指出界线可能被越过；把界线、事实和受影响的人说清，能让反抗不只依赖情绪强度。',
    action: '建立一份只含日期、事件、规则和影响的记录，并确认一个低风险咨询渠道。',
    reflection: '你要拒绝的具体行为是什么，它违反了哪条应对任何人都成立的界线？',
    boundary: '担心报复或违法风险时，应先通过合格劳动法律或组织支持渠道评估安全。',
  },
  {
    theme: 'revolt',
    slug: 'online-outrage',
    title: '不让公开愤怒复制羞辱',
    secondaryThemes: ['limits', 'conscience'],
    principle:
      '公开表达愤怒可以揭示不公，但当表达依赖围攻、去人格化或未经核实的指控时，它可能复制自己反对的羞辱。',
    situation: '看到不公事件后想立即转发、点名或号召围攻',
    shortcut: '把传播速度和攻击强度当成正义程度',
    focus: '揭示问题的责任与避免扩大未经核实的伤害',
    tensions: ['公共表达与个体伤害', '及时回应与事实核验'],
    misreading: '有传播风险就应该对所有不公保持沉默',
    keywords: ['网络愤怒', '公开点名', '舆论围攻'],
    aliases: ['要不要挂人', '不转发就是冷漠吗'],
    relatedSituation: '社交媒体争议中信息不完整但情绪迅速升级',
    perspective:
      '表达不公不需要把人变成围攻材料；反抗的限度也体现在事实、对象和伤害范围的控制上。',
    action: '在发布前核对原始来源，并删去无法证实的身份信息和号召性羞辱。',
    reflection: '你的表达是在让问题更清楚，还是主要让某个人承受无法控制的惩罚？',
  },
  {
    theme: 'revolt',
    slug: 'institutional-complaint',
    title: '把申诉写成可共同承认的界线',
    secondaryThemes: ['action', 'solidarity'],
    principle:
      '申诉不只是陈列不满；它需要说明何种行为不可接受、保护什么共同价值，以及希望制度承担哪项具体责任。',
    situation: '准备向学校、平台、机构或社区提出正式申诉',
    shortcut: '把所有受挫经历堆成无法回应的全面控诉',
    focus: '最核心的事实、共同规则和可以执行的改正请求',
    tensions: ['个人经历与制度语言', '全面否定与具体改变'],
    misreading: '使用制度语言就必须删掉个人受到的真实伤害',
    keywords: ['正式申诉', '机构投诉', '要求改正'],
    aliases: ['投诉怎么写', '怎样让机构回应'],
    relatedSituation: '多次沟通无果后需要整理正式材料',
    perspective:
      '反抗通过一条清楚界线获得公共意义；申诉越能连接事实、规则和具体请求，越不容易被缩减为个人情绪。',
    action: '用四段写清事件、证据、被越过的规则和你要求的可执行改正。',
    reflection: '如果机构只能先改一件事，哪项改变最能保护你和后来的人？',
  },
  {
    theme: 'revolt',
    slug: 'witness-discrimination',
    title: '作为见证者拒绝把风险再交给受害者',
    secondaryThemes: ['solidarity', 'conscience'],
    principle:
      '见证歧视意味着承认某条共同界线被越过；团结要求先询问受影响者需要什么，而不是用自己的正义感替对方增加风险。',
    situation: '看到同事、同学或陌生人遭受歧视和羞辱',
    shortcut: '要么保持沉默，要么未经询问就公开替对方发言',
    focus: '共同界线、当事人意愿与见证者可承担的行动',
    tensions: ['见证责任与当事人自主', '公开发声与现实风险'],
    misreading: '尊重当事人意愿就可以完全不记录或不提供支持',
    keywords: ['目睹歧视', '旁观者', '替人发声'],
    aliases: ['看到不公平要不要管', '怎样支持被歧视的人'],
    relatedSituation: '组织中权力差距让公开发声可能带来报复',
    perspective:
      '你可以拒绝沉默，同时不占用当事人的位置；团结从确认需要、保存事实和分担风险开始。',
    action: '私下询问当事人希望获得哪种支持，并在同意范围内保存你亲眼见到的事实。',
    reflection: '你的行动会把风险从当事人身上分担下来，还是让对方再次失去控制？',
  },
  {
    theme: 'revolt',
    slug: 'protest-strategy',
    title: '用手段检验抗议要维护的价值',
    secondaryThemes: ['limits', 'action'],
    principle:
      '抗议的目标不能自动使所有手段正当；行动需要在现实效果、参与者安全和不把无关者变成工具之间接受检验。',
    situation: '参与公共行动时，对更激烈手段是否必要产生分歧',
    shortcut: '把克制等同投降，或把秩序本身当成最高价值',
    focus: '行动目标、手段影响和参与者共同承认的限度',
    tensions: ['行动强度与共同限度', '公共效果与个体安全'],
    misreading: '审查手段就是要求抗议完全不造成任何不便',
    keywords: ['抗议策略', '行动升级', '公共行动'],
    aliases: ['激烈一点才有用吗', '怎样抗争不伤害无关者'],
    relatedSituation: '群体内部对阻断、曝光或对抗方式意见不一',
    perspective:
      '行动的正当性既来自拒绝什么，也来自它在当下如何对待人；限度让目标不被自己的手段掏空。',
    action: '为拟议行动列出目标、直接承受代价的人和一个伤害更低的替代方案。',
    reflection: '这个手段是否仍体现你希望未来制度普遍尊重的价值？',
    boundary: '涉及暴力计划或即时危险时，应停止哲学讨论并优先联系现实安全支持。',
  },
  {
    theme: 'revolt',
    slug: 'family-control',
    title: '在亲密关系里拒绝控制',
    secondaryThemes: ['freedom', 'limits'],
    principle:
      '亲密与照料不能为持续控制提供正当性；对控制说不，是在肯定双方都不应被降为满足他人需要的工具。',
    situation: '家人或伴侣以关心为由检查、限制或替自己决定',
    shortcut: '把控制解释为爱，或认为只有彻底敌对才能拒绝',
    focus: '关心可以表达的方式与不可越过的个人边界',
    tensions: ['关心与控制', '亲密关系与个人边界'],
    misreading: '设边界就证明自己不爱或不需要任何关系',
    keywords: ['关系控制', '以爱为名', '个人边界'],
    aliases: ['他是关心还是控制', '家人总替我决定'],
    relatedSituation: '通讯、财务、社交或行动被亲近者持续监控',
    perspective:
      '关心需要承认对方仍是能够判断的人；当关系取消你的知情、拒绝或行动空间时，一条共同界线已经被越过。',
    action: '选一个最具体的控制行为，说明你不接受什么以及接下来会采取的保护措施。',
    reflection: '这段关系的关心是否仍为你保留了拒绝和独立判断的空间？',
    boundary: '若存在暴力、跟踪、财产控制或人身限制，应先联系可信赖的人和专业安全支持。',
  },
];

const limitsDrafts: BatchDraft[] = [
  {
    theme: 'limits',
    slug: 'caregiver-exhaustion',
    title: '照护责任也需要停止条件',
    secondaryThemes: ['solidarity', 'work'],
    principle:
      '照护的价值不因设置限度而消失；如果责任只能依靠一个人持续耗尽，它本身就需要重新分配和外部支持。',
    situation: '长期照顾家人而无法休息，开始出现明显耗尽',
    shortcut: '把休息和求助理解为抛弃需要照护的人',
    focus: '照护对象的需要与照护者持续行动的条件',
    tensions: ['照护责任与自我保存', '持续帮助与能力限度'],
    misreading: '设置限度就是把责任完全推给别人',
    keywords: ['照护耗竭', '照顾病人', '不能休息'],
    aliases: ['只有我能照顾他', '休息让我有罪恶感'],
    relatedSituation: '照护安排长期缺少轮换、喘息和专业资源',
    perspective: '限度不是撤回关心，而是承认照护要持续就不能建立在一个人的崩溃上。',
    action: '列出一项必须有人接替的任务，并向一个具体的人或机构提出有时间范围的请求。',
    reflection: '如果你继续以现在的方式耗尽，最终会保护还是破坏这段照护关系？',
    boundary: '紧急医疗和专业照护需求应交给合格服务，不由个人意志替代。',
  },
  {
    theme: 'limits',
    slug: 'activism-burnout',
    title: '不让正义目标耗尽每一个参与者',
    secondaryThemes: ['revolt', 'solidarity'],
    principle:
      '公共行动需要持续性；如果正义目标要求参与者无限工作、压抑需要并接受内部伤害，它就可能复制自己反对的逻辑。',
    situation: '长期参与公益或行动组织，感到疲惫却不敢退出任务',
    shortcut: '把休息视为背叛，把耗尽视为投入程度的证明',
    focus: '公共目标与参与者作为具体人的共同尊严',
    tensions: ['公共责任与个人限度', '持续行动与组织耗损'],
    misreading: '反对耗尽就可以在关键责任前随时消失',
    keywords: ['行动者倦怠', '公益耗尽', '正义疲惫'],
    aliases: ['休息是不是背叛', '做公益做到撑不住'],
    relatedSituation: '组织内部以使命感要求成员长期无偿超负荷',
    perspective:
      '行动若要维护人的尊严，也必须在内部承认参与者的限度；持续性不是软弱，而是对目标的现实责任。',
    action: '提出一次任务轮换或明确停工时段，并说明这如何保护工作的连续性。',
    reflection: '这个组织是否正用未来正义为当下成员的耗尽开脱？',
  },
  {
    theme: 'limits',
    slug: 'perfectionism',
    title: '让完成不再服从无限完美',
    secondaryThemes: ['work', 'action'],
    principle:
      '追求质量需要标准，但当标准无法被满足、检查或停止时，它就不再服务作品，而开始支配行动。',
    situation: '反复修改、迟迟不能交付，任何瑕疵都像不可接受的失败',
    shortcut: '把有限完成理解为对质量和责任的背叛',
    focus: '作品用途、现实标准与继续修改的边际价值',
    tensions: ['质量与完成', '责任心与无限控制'],
    misreading: '接受限度就是鼓励敷衍和降低所有标准',
    keywords: ['完美主义', '无法完成', '反复修改'],
    aliases: ['总觉得还不够好', '不完美就不能交'],
    relatedSituation: '学习、创作或工作因无限检查而停滞',
    perspective:
      '限度让标准重新服务于作品的现实用途；没有停止条件的完美要求，最终会取消作品与世界相遇的机会。',
    action: '为当前版本写下三个可验证的完成标准和一个明确停止修改的时间。',
    reflection: '继续修改现在是在改善作品，还是在推迟作品接受现实检验？',
  },
  {
    theme: 'limits',
    slug: 'helping-friend',
    title: '帮助朋友不等于接管朋友的人生',
    secondaryThemes: ['solidarity', 'freedom'],
    principle:
      '团结可以提供陪伴和具体帮助，却不能取消对方的判断或把帮助者变成唯一支持来源；限度保护双方的主体性。',
    situation: '朋友长期依赖自己处理情绪、决定或危机，自己逐渐耗尽',
    shortcut: '认为拒绝任何请求都会造成不可挽回的伤害',
    focus: '可以承担的支持与需要转交的专业或共同责任',
    tensions: ['帮助与接管', '陪伴与个人限度'],
    misreading: '设置边界就应该立即切断所有支持',
    keywords: ['朋友依赖', '帮助边界', '情绪支持'],
    aliases: ['他什么都只找我', '不帮他我很内疚'],
    relatedSituation: '一段友谊变成单向、随时待命的照护关系',
    perspective:
      '支持朋友不要求你成为唯一答案；明确能力范围和引入更多支持，反而能让关系不建立在耗尽上。',
    action: '说明你能提供的时间和方式，并建议一个可以共同联系的其他支持来源。',
    reflection: '你现在的帮助是在增强对方的行动能力，还是让双方越来越无法离开这套安排？',
    boundary: '涉及即时自伤、暴力或医疗危险时，应立即联系紧急和专业支持。',
  },
  {
    theme: 'limits',
    slug: 'ambition-and-health',
    title: '不让目标以身体为无限抵押',
    secondaryThemes: ['work', 'mortality'],
    principle:
      '目标可以要求付出，却不能因此获得无限索取身体、睡眠与关系的权利；手段正在摧毁行动者时，目标本身也需要复查。',
    situation: '为了升学、创业或晋升长期牺牲睡眠和身体状态',
    shortcut: '把健康损耗当成成功必需且值得炫耀的代价',
    focus: '目标的现实价值与行动者不可无限替换的身体',
    tensions: ['野心与身体限度', '未来收益与当下损耗'],
    misreading: '重视身体就不应该承担任何困难或短期压力',
    keywords: ['透支身体', '拼命工作', '睡眠不足'],
    aliases: ['成功就得拿命拼吗', '现在不拼以后后悔'],
    relatedSituation: '长期高压让身体、关系与判断能力明显恶化',
    perspective:
      '目标需要由活着且能够判断的人完成；把身体当成无限抵押，会让手段逐渐取消目标原本服务的生活。',
    action: '设定一项不可继续牺牲的身体底线，并为本周安排一次可执行的减负。',
    reflection: '这个目标原本要支持怎样的生活，而你现在的手段是否正在毁坏它？',
    boundary: '出现急性症状时应先寻求医疗帮助，不以哲学讨论替代诊断。',
  },
  {
    theme: 'limits',
    slug: 'debate-dehumanization',
    title: '争论不能把对方降成标签',
    secondaryThemes: ['revolt', 'conscience'],
    principle:
      '坚持立场不需要取消对方作为人的复杂性；当争论只剩标签、羞辱与集体归罪时，手段已经损害了共同判断的条件。',
    situation: '公共或私人争论越来越依赖标签、讽刺和人格贬低',
    shortcut: '认为立场正确就可以不受表达方式约束',
    focus: '需要明确反对的主张与不应被取消的人格界线',
    tensions: ['立场坚定与人格尊重', '批判主张与羞辱个人'],
    misreading: '不去人格化就不能尖锐批评错误与伤害',
    keywords: ['争论羞辱', '贴标签', '网络骂战'],
    aliases: ['他不配被尊重吗', '立场对就能随便骂吗'],
    relatedSituation: '政治、伦理或家庭争论让关系和事实判断一起崩坏',
    perspective:
      '你可以明确拒绝一种主张，同时不把人缩减成一个标签；这条限度保护的也是你自己的判断。',
    action: '把准备说的人格评价改写成对具体主张、行为和后果的批评。',
    reflection: '你希望改变或阻止的究竟是什么行为，而不是证明对方是哪一种人？',
  },
];

const solidarityDrafts: BatchDraft[] = [
  {
    theme: 'solidarity',
    slug: 'asking-for-help',
    title: '把求助写成具体的共同任务',
    secondaryThemes: ['action', 'limits'],
    principle:
      '求助不是承认自己没有价值，而是承认某些处境本来就需要共同承担；具体请求比笼统期待更容易形成真实团结。',
    situation: '明明已经超出能力，却因为羞耻或怕麻烦别人而不求助',
    shortcut: '把独自承担当成尊严，把需要帮助当成失败',
    focus: '真实需要、可分担任务和他人选择参与的空间',
    tensions: ['独立与互助', '羞耻与共同承担'],
    misreading: '团结意味着别人有义务满足所有请求',
    keywords: ['开口求助', '不好意思麻烦', '独自承担'],
    aliases: ['我不敢找人帮忙', '求助是不是没用'],
    relatedSituation: '工作、照护或生活压力已经无法独自处理',
    perspective:
      '团结不是读心；把需要变成有限、清楚且可拒绝的请求，能让共同承担真正开始。',
    action: '选择一个最需要分担的任务，向一个具体的人提出包含时间和范围的请求。',
    reflection: '你拒绝求助是在保护独立，还是在让别人无法知道怎样与你并肩？',
  },
  {
    theme: 'solidarity',
    slug: 'supporting-grief',
    title: '陪伴哀痛而不替对方解释',
    secondaryThemes: ['mortality', 'limits'],
    principle:
      '面对他人的哀痛，团结不要求提供意义解释；能够承认损失、保持在场并完成具体帮助，本身就是有限的共同承担。',
    situation: '朋友经历失去，自己不知道说什么才不会显得空洞',
    shortcut: '急着用道理、希望或比较来消除对方的痛苦',
    focus: '对损失的承认与不占用对方经验的陪伴',
    tensions: ['陪伴与解释', '在场与无力感'],
    misreading: '不解释就只能沉默，什么实际帮助都不能做',
    keywords: ['陪伴哀伤', '朋友失去亲人', '不知道怎么安慰'],
    aliases: ['说什么都不对', '怎样陪失去亲人的人'],
    relatedSituation: '对方的哀痛持续很久且生活任务受到影响',
    perspective:
      '你不必为损失制造意义；诚实承认自己无法替代对方承受，并提供具体在场，已经是一种团结。',
    action: '提出一个不要求对方解释感受的具体帮助，例如送餐、陪同或处理一项事务。',
    reflection: '此刻对方更需要一个答案，还是一个不会催促其恢复的人？',
  },
  {
    theme: 'solidarity',
    slug: 'community-disaster',
    title: '在公共困境中承担有限一份',
    secondaryThemes: ['action', 'hope'],
    principle:
      '公共灾难不会因为个人力量有限就取消具体责任；团结是把能力放进共同劳动，而不是把自己想象成唯一救援者。',
    situation: '面对灾害、公共卫生或社区困境，既焦虑又觉得个人无用',
    shortcut: '在救世冲动和完全退出之间摆动',
    focus: '可靠的小任务、专业分工与共同工作的持续性',
    tensions: ['巨大问题与个人作用', '紧迫感与持续协作'],
    misreading: '任何善意行动都可以忽略专业协调和安全规则',
    keywords: ['公共灾难', '社区互助', '个人无力'],
    aliases: ['我能帮上什么', '问题太大做什么都没用'],
    relatedSituation: '信息混乱时想捐助、志愿或转发求助',
    perspective:
      '你不需要承担全部灾难；找到真实需要、服从可靠协调并完成一小部分，是比无边界热情更稳固的团结。',
    action: '选择一个可信组织，确认其当前明确需要，再只承诺一项自己能可靠完成的任务。',
    reflection: '哪一种帮助既回应真实需要，也不会把额外协调成本留给受助者？',
    boundary: '紧急现场应遵从专业指挥，不自行进入危险区域。',
  },
  {
    theme: 'solidarity',
    slug: 'workplace-mutual-support',
    title: '把同事互助从私下忍耐变成共同规则',
    secondaryThemes: ['work', 'revolt'],
    principle:
      '同事之间的善意可以缓解压力，但如果互助长期替制度缺口买单，就需要把共同处境转化为透明规则与集体要求。',
    situation: '团队总靠少数人私下加班、补位和安抚维持运转',
    shortcut: '把所有问题留给个人善意或指责不愿牺牲的人',
    focus: '共同工作所需的制度条件与公平分配',
    tensions: ['个人善意与制度责任', '团队互助与隐形耗损'],
    misreading: '要求规则就不再需要同事间的临时帮助',
    keywords: ['同事互助', '团队补位', '制度缺口'],
    aliases: ['总是我们私下救火', '好心同事被耗尽'],
    relatedSituation: '人手不足、排班混乱或责任不清长期被个人承担',
    perspective:
      '团结不仅是继续补位，也包括让共同耗损被看见，并要求组织承担本应承担的责任。',
    action: '和至少一位同事核对共同问题，整理为一个可量化影响和一项明确改进请求。',
    reflection: '你们的互助是在增强共同能力，还是在让不合理安排更容易持续？',
  },
  {
    theme: 'solidarity',
    slug: 'relationship-distance',
    title: '距离可以成为关系中的团结',
    secondaryThemes: ['limits', 'freedom'],
    principle:
      '团结不等于持续靠近；当距离能够阻止控制、怨恨或相互耗损时，有限退开也可能是在保护关系中的共同尊严。',
    situation: '一段关系因过度介入和频繁冲突需要暂时拉开距离',
    shortcut: '把距离等同抛弃，或把亲密等同随时可进入对方生活',
    focus: '关系需要的联系与双方仍应保留的独立空间',
    tensions: ['亲密与距离', '联系与个人边界'],
    misreading: '保持距离就可以消失、不说明安排或惩罚对方',
    keywords: ['关系距离', '暂时分开', '亲密边界'],
    aliases: ['需要空间是不是不爱了', '想少联系一段时间'],
    relatedSituation: '家人、朋友或伴侣因高频介入而反复冲突',
    perspective:
      '距离不必是否定关系；如果它有清楚范围、时间和尊重，可能让双方重新成为能够判断的人。',
    action: '说明你需要的距离包括什么、不包括什么，以及何时重新评估。',
    reflection: '这段距离是在保护双方重新相处的条件，还是被用来控制对方的反应？',
  },
  {
    theme: 'solidarity',
    slug: 'cooperate-across-disagreement',
    title: '在分歧中保留有限合作',
    secondaryThemes: ['conscience', 'limits'],
    principle:
      '团结不要求完整共识；只要共同任务和不可越过的界线清楚，人们可以在保留重大分歧时完成有限合作。',
    situation: '需要和价值观不同的人共同完成社区、家庭或工作任务',
    shortcut: '认为合作就是认可对方全部立场，或分歧必然取消合作',
    focus: '共同任务、保留分歧和合作的明确限度',
    tensions: ['分歧与合作', '共同目标与独立判断'],
    misreading: '只要有共同任务就应该忽略所有伤害性立场',
    keywords: ['分歧合作', '价值观不同', '有限共识'],
    aliases: ['不同意还能合作吗', '合作是不是妥协原则'],
    relatedSituation: '家庭照护、社区事务或团队项目需要跨立场协作',
    perspective:
      '你不必先消除全部分歧；清楚限定共同任务和不可接受的手段，可以让合作不等于投降。',
    action: '用书面方式确认共同目标、各自责任和一条双方都不能越过的界线。',
    reflection: '这项合作需要你暂时搁置什么，又有哪些原则不能因此被取消？',
  },
];

const hopeDrafts: BatchDraft[] = [
  {
    theme: 'hope',
    slug: 'future-rescue',
    title: '不把生活全部推迟到获救以后',
    secondaryThemes: ['happiness', 'action'],
    principle:
      '期待未来改善可以支持行动，但把全部生活推迟到某个转折点，会让希望取代对当下事实与可用时间的照料。',
    situation: '总想着等换工作、赚够钱或关系稳定以后才开始生活',
    shortcut: '把未来条件当作当前生活价值的唯一许可',
    focus: '合理准备与今天仍能经验和承担的生活',
    tensions: ['未来改善与当下生活', '计划与推迟'],
    misreading: '重视当下就不需要储蓄、准备或长期目标',
    keywords: ['推迟生活', '等以后再说', '未来会更好'],
    aliases: ['等成功了再生活', '现在只是过渡期'],
    relatedSituation: '多年把休息、关系和兴趣推迟到下一个里程碑',
    perspective:
      '未来值得准备，却不能替今天提供存在许可；清醒的希望会同时保留计划和一小部分当下生活。',
    action: '从被推迟的生活里选一件低成本的事，在本周安排一个不以目标完成为前提的版本。',
    reflection: '如果转折点继续延后，你不愿再把生活中的哪一部分交给等待？',
  },
  {
    theme: 'hope',
    slug: 'recovery-uncertainty',
    title: '让恢复期待与不确定性共存',
    secondaryThemes: ['limits', 'mortality'],
    principle:
      '面对恢复过程，拒绝虚假保证并不等于预判失败；希望可以表现为遵循现实支持、观察变化并保留对不确定性的诚实。',
    situation: '经历疾病、受伤或长期低谷，不知道何时能够恢复',
    shortcut: '在保证一定康复和断言永远不会好之间摆动',
    focus: '专业信息、可观察进展与无法提前保证的结果',
    tensions: ['恢复期待与结果不确定', '耐心与现实评估'],
    misreading: '没有保证就不值得继续接受支持或执行计划',
    keywords: ['恢复不确定', '什么时候会好', '康复希望'],
    aliases: ['会不会永远这样', '不敢再抱希望'],
    relatedSituation: '康复速度反复、计划需要多次调整',
    perspective:
      '你不必用保证维持希望；让行动依据专业信息和实际变化，而不是依据对未来的强迫确定。',
    action: '记录一个可由专业人员复查的变化指标，并准备下次咨询要确认的两个问题。',
    reflection: '除了要求结果保证，什么现实证据能帮助你判断下一段路？',
    boundary: '本卡不提供医疗诊断或恢复预测，急性危险应立即联系医疗服务。',
  },
  {
    theme: 'hope',
    slug: 'job-search-rejection',
    title: '在求职拒绝中保持有证据的希望',
    secondaryThemes: ['work', 'action'],
    principle:
      '求职希望不应建立在下一次必然成功的保证上，而应建立在可改进的材料、可扩展的渠道和能够承受的行动节奏上。',
    situation: '连续收到拒信，开始在盲目乐观和彻底放弃之间摇摆',
    shortcut: '靠下一次一定成功安慰自己，或让拒绝替未来全部作结论',
    focus: '可获得反馈、真实机会和可持续的求职行动',
    tensions: ['期待与拒绝', '继续尝试与策略调整'],
    misreading: '保持希望就是无视市场情况重复同一做法',
    keywords: ['求职拒信', '找工作失望', '继续投递'],
    aliases: ['又被拒了还要试吗', '找工作没有希望'],
    relatedSituation: '投递很多但面试率低，经济压力逐渐增加',
    perspective:
      '希望不是承诺下一封邮件会成功，而是拒绝让拒绝取消分析、调整和继续行动的能力。',
    action: '统计最近二十次申请的阶段分布，只选转化最弱的一环做一次具体修改。',
    reflection: '你现在需要增加尝试次数，还是需要改变一个已经重复失效的环节？',
  },
  {
    theme: 'hope',
    slug: 'public-future-anxiety',
    title: '面对公共未来不把希望交给口号',
    secondaryThemes: ['solidarity', 'action'],
    principle:
      '面对气候、战争或社会不确定性，希望若只依赖乐观口号会迅速耗尽；更可靠的是承认事实并加入有限的共同工作。',
    situation: '长期关注公共危机，对未来感到焦虑和个人无力',
    shortcut: '在相信一切会自动变好和认为任何行动都没用之间摆动',
    focus: '可靠事实、共同组织和个人能够持续承担的一部分',
    tensions: ['公共危机与个人生活', '未来焦虑与有限行动'],
    misreading: '个人作用有限就说明所有公共参与都只是自我安慰',
    keywords: ['未来焦虑', '公共危机', '气候无力'],
    aliases: ['世界会越来越坏吗', '个人能改变什么'],
    relatedSituation: '新闻摄入过量并影响日常功能与行动',
    perspective:
      '希望不必预测胜利；它可以是对事实保持清醒，同时不退出能够共同减少伤害的工作。',
    action: '限制一次无边界的信息摄入，并选择一个可信组织的一项可持续参与。',
    reflection: '哪一种行动即使不能保证结局，也仍符合你希望共同维护的价值？',
  },
  {
    theme: 'hope',
    slug: 'relationship-promises',
    title: '让关系希望接受行动检验',
    secondaryThemes: ['conscience', 'limits'],
    principle:
      '关系中的希望不能只由承诺强度支撑；它需要通过可观察的改变、明确边界和持续责任接受现实检验。',
    situation: '对方多次承诺会改变，但相同伤害仍反复发生',
    shortcut: '把新的承诺本身当成已经发生的改变',
    focus: '语言承诺、可观察行动和自己不能继续接受的界线',
    tensions: ['承诺与行动', '希望与自我保护'],
    misreading: '要求行动证据就意味着不给人改变机会',
    keywords: ['承诺改变', '关系反复', '再给机会'],
    aliases: ['他说这次一定会改', '还要不要相信他'],
    relatedSituation: '道歉、和好和再次伤害形成循环',
    perspective:
      '希望可以保留，但不应免除现实检验；改变要由持续行动承担，而不是由你反复降低界线承担。',
    action: '把期待改写为一个可观察行为、明确时间范围和未发生时的保护措施。',
    reflection: '你相信的是已经出现的改变，还是一个让你暂时不用面对选择的承诺？',
    boundary: '若存在暴力或控制，应优先制定安全计划，不以等待改变取代现实求助。',
  },
  {
    theme: 'hope',
    slug: 'long-project',
    title: '让长期工作不依赖胜利保证',
    secondaryThemes: ['work', 'meaning'],
    principle:
      '长期项目的价值不能只由最终胜利证明；过程中的诚实工作、共同学习和具体改善，可以在结果未定时仍成立。',
    situation: '投入多年做研究、创作或公共项目，却看不到确定结果',
    shortcut: '要求最终成功为过去与现在的全部投入担保',
    focus: '项目尚未实现的目标与已经产生的具体价值',
    tensions: ['长期投入与结果不定', '目标成果与过程价值'],
    misreading: '过程有价值就不需要评估项目是否仍值得继续',
    keywords: ['长期项目', '看不到结果', '坚持希望'],
    aliases: ['做了这么久还没成功', '没有保证还要继续吗'],
    relatedSituation: '论文、创业、创作或社会项目进展缓慢',
    perspective:
      '你可以继续要求成果，同时不把全部价值抵押给结局；清醒也包括定期判断项目是否仍值得承担。',
    action: '为下一阶段设一个可验证里程碑，并同时记录项目已经产生的一项具体价值。',
    reflection: '如果最终结果仍不保证，你愿意继续承担的理由是什么，又到哪里应该复查？',
  },
];

const happinessDrafts: BatchDraft[] = [
  {
    theme: 'happiness',
    slug: 'stop-postponing',
    title: '给当下生活一小块不被推迟的时间',
    secondaryThemes: ['hope', 'action'],
    principle:
      '幸福不需要等待所有问题解决后才获得许可；有限的当下经验可以与未完成的责任和困难同时存在。',
    situation: '长期把休息、兴趣和相聚推迟到任务全部完成以后',
    shortcut: '认为只有清空所有责任才配拥有轻松',
    focus: '尚未完成的任务与今天仍可经验的生活',
    tensions: ['责任与当下生活', '完成以后与此刻经验'],
    misreading: '允许当下幸福就可以逃避未完成的责任',
    keywords: ['推迟幸福', '任务做不完', '不敢休息'],
    aliases: ['忙完再生活', '现在没资格开心'],
    relatedSituation: '待办事项长期增长，让生活始终像临时过渡',
    perspective:
      '责任未完成不意味着当下生活必须被完全取消；幸福可以是一段有限而诚实的经验，不是对问题的否认。',
    action: '在本周安排三十分钟不以提高效率为目的的感官或关系活动。',
    reflection: '哪一种生活经验已经被你反复推迟，却并不需要等所有问题消失？',
  },
  {
    theme: 'happiness',
    slug: 'joy-without-guilt',
    title: '不因世界有苦难而否认全部喜悦',
    secondaryThemes: ['solidarity', 'limits'],
    principle:
      '意识到他人的苦难不要求取消自己的全部喜悦；真正的团结反对遗忘，却不把持续自我惩罚当成帮助他人的方式。',
    situation: '看到公共苦难或亲友困境后，为自己的快乐感到内疚',
    shortcut: '把快乐理解为对他人痛苦的背叛',
    focus: '对苦难的记忆、现实责任与个人仍可经验的喜悦',
    tensions: ['个人喜悦与他人苦难', '记得现实与允许生活'],
    misreading: '允许快乐就可以停止关注或帮助受苦的人',
    keywords: ['快乐内疚', '苦难与幸福', '不敢开心'],
    aliases: ['别人很苦我怎么能快乐', '开心是不是自私'],
    relatedSituation: '照护、哀痛或公共事件期间压抑所有愉悦',
    perspective:
      '喜悦不必以遗忘为代价；你可以继续承担具体责任，同时不把自我惩罚误认为团结。',
    action: '确认一项你愿意继续承担的帮助，再允许自己完成一件不伤害任何人的愉快小事。',
    reflection: '你的内疚正在帮助谁，还是只让生活中又多了一个被剥夺的人？',
  },
  {
    theme: 'happiness',
    slug: 'consumer-achievement',
    title: '区分快感、占有与可持续幸福',
    secondaryThemes: ['meaning', 'limits'],
    principle:
      '消费和成就能够带来真实快感，却很难独自承担持续幸福；当下一次获得总被用来修补同一种空缺，值得重新辨认需要。',
    situation: '购物、升级设备或达成目标后很快又感到不足',
    shortcut: '用下一次获得延后对孤独、疲惫或无方向的判断',
    focus: '短暂快感与反复出现的具体需要',
    tensions: ['获得与足够', '快感与持续满足'],
    misreading: '反思消费就意味着物质享受都不真实或不正当',
    keywords: ['消费空虚', '买了还想买', '成就不满足'],
    aliases: ['拥有以后还是不开心', '为什么总觉得不够'],
    relatedSituation: '压力大时反复消费或追逐外部奖励',
    perspective:
      '快感可以被承认，却不必被要求解释全部生活；反复不足可能在提示另一个没有被照料的需要。',
    action: '下一次购买或追逐奖励前，先写下你希望它改变的感受，并等待二十四小时。',
    reflection: '你真正想获得的是这个物品或成就，还是它暂时承诺的安全、认可或变化？',
  },
  {
    theme: 'happiness',
    slug: 'sensory-routine',
    title: '让感官把注意力带回现实',
    secondaryThemes: ['absurd', 'action'],
    principle:
      '感官经验不会解决终极问题，却能让人重新接触正在发生的现实；这种当下性不是逃避，而是拒绝让抽象焦虑占据全部生活。',
    situation: '长期沉浸在担忧和计划里，几乎感受不到日常环境',
    shortcut: '认为只有想通问题才有资格停下来感受当下',
    focus: '抽象焦虑与此刻可被感知的具体世界',
    tensions: ['思虑与感知', '未来焦虑与当下经验'],
    misreading: '关注感官就足以替代对现实问题的处理',
    keywords: ['感受当下', '感官生活', '注意现实'],
    aliases: ['脑子停不下来', '怎样回到当下'],
    relatedSituation: '休息时仍不断预演未来任务和失败',
    perspective:
      '你不必先解决所有问题才接触世界；一段具体感知可以让注意力从抽象控制回到现实。',
    action: '用十分钟只记录看到、听到和触到的事物，不评价它们是否有用。',
    reflection: '当你暂时停止解释，眼前有什么具体事物仍在要求你的注意？',
  },
  {
    theme: 'happiness',
    slug: 'shared-joy',
    title: '共同喜悦不需要制造永恒承诺',
    secondaryThemes: ['solidarity', 'mortality'],
    principle:
      '一段相聚的价值不因它会结束而失效；共同喜悦可以在承认时间有限时被认真经验，而不必被夸大为永恒保证。',
    situation: '因为聚会、旅行或关系终会结束，提前感到失落而无法投入',
    shortcut: '要求美好经验必须持续，才允许自己相信它有价值',
    focus: '经验的有限时间与它在当下形成的真实联系',
    tensions: ['相聚与告别', '有限时间与真实价值'],
    misreading: '接受结束就不需要为关系的持续承担责任',
    keywords: ['相聚会结束', '提前失落', '共同快乐'],
    aliases: ['想到告别就不敢开心', '不能永远还有意义吗'],
    relatedSituation: '短期相聚、异地重逢或阶段性共同生活',
    perspective:
      '结束不会追溯性地取消当下；不要求永恒，反而能让你更完整地参与正在发生的共同经验。',
    action: '把注意力放回这次相聚中你想真实完成的一件事，而不是反复预演告别。',
    reflection: '如果不要求它永远持续，你想怎样认真对待眼前这段共同时间？',
  },
  {
    theme: 'happiness',
    slug: 'rest-without-productivity',
    title: '休息不必证明下一轮效率',
    secondaryThemes: ['work', 'limits'],
    principle:
      '休息可以支持工作，却不只因提高效率才正当；把每段恢复都工具化，会让生活再次完全服从生产目标。',
    situation: '只有相信休息能提高效率时才允许自己停下',
    shortcut: '把无产出的时间视为浪费或道德失败',
    focus: '恢复的现实需要与不被工作目的完全占有的时间',
    tensions: ['休息与生产', '生活经验与工具价值'],
    misreading: '休息有自身价值就可以长期逃避必要责任',
    keywords: ['休息内疚', '效率焦虑', '无所事事'],
    aliases: ['休息也要有用吗', '一停下来就觉得浪费'],
    relatedSituation: '周末、假期或病后恢复仍被绩效思维占据',
    perspective: '休息不必向生产目标提交完整证明；有限时间也可以仅仅属于恢复和生活本身。',
    action: '安排一段明确起止、没有优化目标的休息，并在结束后只记录真实感受。',
    reflection: '如果休息不能提高你的效率，它是否仍保护了一个不该被工作吞没的人？',
  },
];

const mortalityDrafts: BatchDraft[] = [
  {
    theme: 'mortality',
    slug: 'delayed-conversation',
    title: '把重要谈话从无限以后带回现在',
    secondaryThemes: ['action', 'conscience'],
    principle:
      '生命有限不要求仓促说完一切，却提醒人不要把重要的道歉、感谢和界线无限推迟到一个并不保证到来的以后。',
    situation: '一直想和重要的人谈一件事，却总等更合适的时机',
    shortcut: '把完美时机当作开始谈话的必要条件',
    focus: '谈话的真实风险与时间不会自动提供的保证',
    tensions: ['等待时机与有限时间', '表达风险与继续沉默'],
    misreading: '时间有限就应该不顾对方处境立刻倾倒全部内容',
    keywords: ['重要谈话', '一直没说', '来不及表达'],
    aliases: ['以后再告诉他', '总等不到合适时机'],
    relatedSituation: '道歉、感谢、告别或设边界长期被推迟',
    perspective:
      '有限时间让推迟也成为一种选择；你不必一次完成所有内容，但可以停止把开始完全交给未来。',
    action: '写下最需要表达的一句话，并先询问对方近期是否有合适时间谈十分钟。',
    reflection: '如果时机永远不完美，你最不愿因继续沉默而失去什么？',
  },
  {
    theme: 'mortality',
    slug: 'aging-parent',
    title: '在父母老去时区分爱与控制',
    secondaryThemes: ['solidarity', 'limits'],
    principle:
      '亲人老去让时间变得具体；认真面对有限性，既包括陪伴和安排，也包括尊重对方仍有的判断与自己的照护限度。',
    situation: '看到父母变老，既害怕失去又想替他们决定一切',
    shortcut: '用控制消除自己的恐惧，或因害怕而回避所有安排',
    focus: '有限时间、对方自主和家庭能够共同承担的照护',
    tensions: ['陪伴与控制', '失去恐惧与现实安排'],
    misreading: '尊重自主就不需要讨论照护、财务和医疗安排',
    keywords: ['父母老去', '养老焦虑', '害怕失去亲人'],
    aliases: ['爸妈变老我很害怕', '想替父母安排一切'],
    relatedSituation: '家庭需要开始讨论照护分工与未来意愿',
    perspective:
      '死亡意识不只带来恐惧，也让仍能共同决定的时间显得具体；爱不必通过取消对方判断来证明。',
    action:
      '选择一个低压力话题，先询问父母自己的意愿，再记录需要家庭共同准备的一项事务。',
    reflection: '你现在的安排是在回应对方的需要，还是主要在缓解自己对失去的恐惧？',
    boundary: '医疗、照护与法律安排需要相应专业人士参与，不能由本卡替代。',
  },
  {
    theme: 'mortality',
    slug: 'birthday-time',
    title: '让年龄成为时间线索而非价值判决',
    secondaryThemes: ['meaning', 'freedom'],
    principle:
      '年龄会显示时间有限，却不能单独决定一个人是否太晚、失败或应该按统一时间表生活；它提供条件，不提供完整判决。',
    situation: '生日或年龄节点引发强烈焦虑，觉得自己落后于所有人',
    shortcut: '把社会时间表当成生命价值的统一标准',
    focus: '真实时间条件与不必服从的比较尺度',
    tensions: ['年龄事实与社会时间表', '有限时间与自主选择'],
    misreading: '拒绝年龄羞耻就可以无视身体、财务和责任的现实变化',
    keywords: ['年龄焦虑', '生日恐慌', '人生太晚'],
    aliases: ['这个年纪还没成功', '是不是已经来不及了'],
    relatedSituation: '三十、四十或退休节点触发职业和关系比较',
    perspective:
      '年龄使时间具体，但社会排名不能替你决定时间如何使用；清醒需要同时看见条件和自己的价值。',
    action: '写下一个随年龄真实变化的条件和一个只是来自比较的期限，并分别处理。',
    reflection: '如果不再按别人的时间表计算，你希望有限时间优先留给什么？',
  },
  {
    theme: 'mortality',
    slug: 'grief-memory',
    title: '记忆逝者而不要求哀痛停止',
    secondaryThemes: ['solidarity', 'happiness'],
    principle:
      '哀痛不必被解释成需要尽快完成的任务；记忆可以与重新生活并存，后来的喜悦也不会追溯性地取消失去的重要性。',
    situation: '失去亲友后担心自己恢复生活等于遗忘或背叛',
    shortcut: '把持续痛苦当成维持关系真实性的唯一方式',
    focus: '记忆、失去和活着的人仍在继续的时间',
    tensions: ['记忆与继续生活', '哀痛与后来喜悦'],
    misreading: '允许哀痛没有固定期限就不需要寻求任何支持',
    keywords: ['哀痛记忆', '害怕遗忘', '失去亲人'],
    aliases: ['开心是不是背叛逝者', '走出来就会忘记吗'],
    relatedSituation: '纪念日、遗物或新生活阶段重新触发悲伤',
    perspective:
      '继续生活不必以遗忘为代价；记忆可以改变形式，而不需要用永久痛苦证明它真实。',
    action: '选择一种可承受的纪念方式，同时允许自己完成一件属于当前生活的具体事情。',
    reflection: '除了持续受苦，还有什么方式能诚实保存这段关系的重要性？',
  },
  {
    theme: 'mortality',
    slug: 'illness-uncertainty',
    title: '面对健康不确定时缩短判断范围',
    secondaryThemes: ['limits', 'action'],
    principle:
      '健康不确定会让死亡意识突然靠近；清醒不是自行预测最坏结局，而是区分需要立即专业处理的事实与尚未确定的未来。',
    situation: '等待检查或诊断结果，反复想象最坏情况',
    shortcut: '把不确定自动等同最坏结局，或用乐观否认风险',
    focus: '已知症状、专业评估和等待期间可完成的现实安排',
    tensions: ['健康风险与结果未定', '准备与灾难化想象'],
    misreading: '接受不确定就不需要检查、复诊或紧急求助',
    keywords: ['等待检查', '健康焦虑', '害怕重病'],
    aliases: ['检查结果没出很害怕', '总想到最坏结局'],
    relatedSituation: '身体异常后在网上反复搜索并自行下结论',
    perspective:
      '有限性值得认真，但未知仍然是未知；把判断范围缩回已知事实，能为专业评估和今天的行动留出空间。',
    action: '整理症状时间线和要询问医生的问题，并停止用非专业搜索替自己下确定结论。',
    reflection: '此刻有哪些事实需要处理，又有哪些结论只是恐惧提前替未来作出的？',
    boundary: '本卡不提供诊断；急性症状必须立即联系当地医疗急救服务。',
  },
  {
    theme: 'mortality',
    slug: 'ordinary-legacy',
    title: '让有限生命留下可传递的具体事物',
    secondaryThemes: ['meaning', 'solidarity'],
    principle:
      '生命的有限不必靠宏大遗产抵抗；知识、照料、作品和诚实关系中的具体传递，也能构成对时间的现实回应。',
    situation: '担心一生普通、没有留下足够伟大的成就',
    shortcut: '把公共名声或巨大成果当成抵抗被遗忘的唯一方式',
    focus: '能够被具体传递的经验、关系与工作',
    tensions: ['普通生活与宏大遗产', '被记住与真实传递'],
    misreading: '重视普通传递就不需要追求优秀或完成长期作品',
    keywords: ['人生遗产', '普通一生', '留下些什么'],
    aliases: ['我这辈子太普通', '没有伟大成就怎么办'],
    relatedSituation: '中年、退休或重大变化时重新评估一生价值',
    perspective:
      '有限生命不需要通过宏大证明才值得；真正传递出去的知识、照料和作品比抽象的不朽更可判断。',
    action: '选择一项你愿意整理、教给别人或完成交接的具体经验。',
    reflection: '如果不要求世界永远记住你，你仍希望把什么可靠地交给具体的人？',
  },
];

const conscienceDrafts: BatchDraft[] = [
  {
    theme: 'conscience',
    slug: 'conceal-facts-at-work',
    title: '不让职务命令替自己取消判断',
    secondaryThemes: ['work', 'limits'],
    principle:
      '组织命令能够分配职责，却不能自动替个人免除对欺骗、伤害和手段的判断；服从仍需要一条说得出的界线。',
    situation: '上级要求隐瞒错误、修改记录或向客户说不完整的事实',
    shortcut: '用只是执行命令取消自己的责任，或在未评估风险时冲动对抗',
    focus: '事实完整性、可能受影响的人和个人不可越过的界线',
    tensions: ['职务服从与事实诚实', '生计风险与个人责任'],
    misreading: '坚持良知就应该未经核实公开所有内部信息',
    keywords: ['隐瞒事实', '上级命令', '修改记录'],
    aliases: ['老板让我撒谎', '照做还是拒绝'],
    relatedSituation: '担心拒绝后遭遇失业、降职或职业报复',
    perspective:
      '职务不能替你完成良知判断；你需要确认事实、受影响者和哪项行为会让自己参与制造伤害。',
    action: '保存合法可保留的事实记录，并先向合格的内部伦理或法律渠道咨询。',
    reflection: '哪一个具体行为一旦由你完成，就不能再只用服从命令解释？',
    boundary: '涉及违法披露、举报保护或报复风险时，需要合格法律意见。',
  },
  {
    theme: 'conscience',
    slug: 'group-pressure',
    title: '在群体一致中保留个人判断',
    secondaryThemes: ['freedom', 'revolt'],
    principle:
      '共同立场可以形成行动力量，却不能把一致本身当成正确证明；良知要求个人仍检查事实、手段和被牺牲的人。',
    situation: '朋友、同事或社群要求立刻表态，并把犹豫视为背叛',
    shortcut: '为了归属交出判断，或因反感压力而自动反对群体',
    focus: '共同目标与不能由群体替代的事实判断',
    tensions: ['群体归属与个人判断', '行动一致与事实核验'],
    misreading: '保留判断就不需要承担任何共同责任',
    keywords: ['群体压力', '必须表态', '不站队就是敌人'],
    aliases: ['大家都要求我同意', '不想被群体排斥'],
    relatedSituation: '社交媒体、组织会议或朋友冲突要求即时站队',
    perspective:
      '你可以参与共同工作，却不必把一致当成免检证书；保留判断也是对群体目标的责任。',
    action: '在表态前写下你已确认的事实、仍存疑的部分和绝不支持的手段。',
    reflection: '如果群体立场改变，你今天的判断还能否由自己说明？',
  },
  {
    theme: 'conscience',
    slug: 'family-loyalty-truth',
    title: '家庭忠诚不能要求取消事实',
    secondaryThemes: ['solidarity', 'limits'],
    principle:
      '家庭忠诚可以包含保护与互助，却不应要求隐瞒伤害、否定事实或让较弱成员独自承担代价。',
    situation: '家人要求为了家庭名声保持沉默或否认已经发生的伤害',
    shortcut: '把说出事实等同背叛家庭，把沉默等同团结',
    focus: '关系忠诚、事实和需要被保护的共同界线',
    tensions: ['家庭忠诚与事实', '关系保护与伤害隐瞒'],
    misreading: '拒绝沉默就可以公开所有隐私而不考虑受害者意愿',
    keywords: ['家庭秘密', '为了家里沉默', '忠诚与真相'],
    aliases: ['说出来是不是背叛家人', '家丑不能外扬吗'],
    relatedSituation: '家庭内部伤害被名声、长幼或团结要求掩盖',
    perspective:
      '团结不能建立在否定事实和牺牲较弱者上；真正要保护的不是抽象名声，而是共同生活的界线。',
    action: '先与受影响者确认需要和风险，再选择一个可信赖、具备保护能力的外部支持。',
    reflection: '所谓家庭忠诚正在保护谁，又把代价长期留给了谁？',
    boundary: '涉及未成年人、暴力或即时危险时，应优先联系专业保护与紧急服务。',
  },
  {
    theme: 'conscience',
    slug: 'public-silence',
    title: '判断沉默正在保护什么',
    secondaryThemes: ['revolt', 'action'],
    principle:
      '沉默有时保护安全和事实核验，有时则让不公继续；良知判断需要说明沉默的对象、期限和由谁承担后果。',
    situation: '看到明显问题却担心发声成本，不知道沉默是否等于纵容',
    shortcut: '把任何沉默都视为懦弱，或把自我保护当成永久不行动的理由',
    focus: '发声风险、事实可靠性与沉默造成的现实后果',
    tensions: ['发声与安全', '沉默与共同责任'],
    misreading: '良知要求每个人都用最高风险方式公开发声',
    keywords: ['保持沉默', '要不要发声', '旁观不公'],
    aliases: ['不说话是不是共犯', '发声会付出代价'],
    relatedSituation: '组织、家庭或公共事件中掌握部分事实',
    perspective:
      '关键不只是说或不说，而是你的选择正在保护什么、伤害谁，以及是否还有更安全有效的表达路径。',
    action: '列出直接公开、匿名咨询和共同发声三种路径的事实要求与风险。',
    reflection: '你的沉默是暂时保护行动条件，还是让本应被看见的伤害继续无人承担？',
  },
  {
    theme: 'conscience',
    slug: 'rule-and-person',
    title: '规则执行也要看见具体的人',
    secondaryThemes: ['limits', 'solidarity'],
    principle:
      '规则能够提供一致性，却不能免除对具体后果的判断；当机械执行让人变成程序材料，良知要求寻找规则允许的限度与复核。',
    situation: '按照规定办事会给具体的人造成明显且可能避免的伤害',
    shortcut: '用规则就是规则停止判断，或凭个人同情任意取消所有规则',
    focus: '规则保护的共同目的与个案中可避免的伤害',
    tensions: ['一致规则与个案处境', '程序责任与个人判断'],
    misreading: '看见具体的人就可以为了同情随意破坏公平',
    keywords: ['机械执行', '规则与人', '个案例外'],
    aliases: ['按规定做却不合理', '能不能为他破例'],
    relatedSituation: '行政、教育、服务或管理岗位面对特殊处境',
    perspective:
      '规则的正当性也来自它要保护的人；你需要区分任意徇私与规则本身允许的复核、解释和救济。',
    action: '查明正式的复核或例外程序，并记录个案事实与规则目的之间的冲突。',
    reflection: '机械执行此刻保护了规则的共同目的，还是只保护了执行者免于判断？',
  },
  {
    theme: 'conscience',
    slug: 'guilt-after-compromise',
    title: '让妥协后的内疚进入复查而非自罚',
    secondaryThemes: ['action', 'limits'],
    principle:
      '内疚可以提示某条价值受到损害，却不能靠无限自罚完成修复；良知更需要承认事实、承担后果并改变下一次行动。',
    situation: '为了现实压力作出妥协后反复责备自己',
    shortcut: '用持续痛苦证明自己仍有原则，却不处理实际后果',
    focus: '被牺牲的价值、现实压力与仍可完成的修复',
    tensions: ['妥协与原则', '内疚与修复行动'],
    misreading: '停止自罚就等于否认错误或逃避责任',
    keywords: ['妥协内疚', '违背原则', '后悔自责'],
    aliases: ['我是不是背叛了自己', '一直无法原谅自己'],
    relatedSituation: '在工作、家庭或群体压力下作出不满意的选择',
    perspective:
      '内疚指出你仍在乎某条界线；让它变成事实复查、道歉或新条件，比让自己永久受罚更接近责任。',
    action: '写下造成的具体影响、能够修复的一项行动和下次必须提前设置的界线。',
    reflection: '你的内疚现在是在推动修复，还是替代了真正需要承担的行动？',
  },
];

const actionDrafts: BatchDraft[] = [
  {
    theme: 'action',
    slug: 'analysis-paralysis',
    title: '用有限试验结束无限分析',
    secondaryThemes: ['freedom', 'limits'],
    principle:
      '分析能够减少盲目，却无法提前消除所有不确定；当新增思考不再改变选择，有限而可逆的试验比继续等待更能提供事实。',
    situation: '收集大量信息、反复比较，却迟迟不开始任何尝试',
    shortcut: '要求分析先给出完全确定的结论',
    focus: '仍会改变决定的信息与只能通过行动获得的反馈',
    tensions: ['分析与行动', '信息增加与确定性要求'],
    misreading: '反对过度分析就应该凭冲动跳过必要准备',
    keywords: ['分析瘫痪', '想太多不行动', '信息过载'],
    aliases: ['研究很久还是不敢开始', '再等等更多信息'],
    relatedSituation: '课程、转职、创作或关系决定长期停在准备阶段',
    perspective:
      '行动不必等于一次定局；当分析停止提供新判断，一个小试验可以让现实重新进入思考。',
    action: '设定一个两小时或一周内可完成、退出成本明确的最小试验。',
    reflection: '你还缺少哪条真正会改变决定的信息，还是只缺少对开始不确定的承受？',
  },
  {
    theme: 'action',
    slug: 'reversible-experiment',
    title: '优先选择能带来信息的可逆一步',
    secondaryThemes: ['freedom', 'hope'],
    principle:
      '没有保证时，行动可以先追求获得可靠信息而非一次解决全部问题；可逆步骤让选择承担后果，也保留修正空间。',
    situation: '想尝试新工作、城市、项目或生活方式，又不愿立刻做不可逆决定',
    shortcut: '把正式承诺视为证明认真程度的唯一方式',
    focus: '试验能够验证的假设与明确退出条件',
    tensions: ['承诺与试验', '探索与退出成本'],
    misreading: '保持可逆就可以永远不承担长期承诺',
    keywords: ['可逆尝试', '小规模试验', '先试试看'],
    aliases: ['能不能先试一段时间', '不想一步到位'],
    relatedSituation: '副业、短住、课程或志愿体验用于验证选择',
    perspective: '严肃不等于一次押上全部生活；一个设计清楚的试验能让决定建立在经验上。',
    action: '写下要验证的问题、试验期限、成本上限和停止条件，然后安排第一次执行。',
    reflection: '这次试验需要回答哪一个决定性问题，而不是只让你暂时感觉在行动？',
  },
  {
    theme: 'action',
    slug: 'large-problem-small-step',
    title: '把巨大问题缩成今天能完成的一段',
    secondaryThemes: ['solidarity', 'meaning'],
    principle:
      '问题规模巨大不意味着每一步都必须同样巨大；有限行动的价值在于真实减少一部分困难，并能与他人的工作连接。',
    situation: '面对债务、转行、照护或公共问题，不知道从哪里开始',
    shortcut: '因为无法一次解决全部而不采取任何步骤',
    focus: '问题结构、当前瓶颈和可以由一个动作推进的部分',
    tensions: ['问题规模与个人步骤', '整体解决与局部推进'],
    misreading: '做一个小步骤就足以忽略问题的结构和长期计划',
    keywords: ['问题太大', '不知道开始', '小步骤'],
    aliases: ['事情多到动不了', '做一点有什么用'],
    relatedSituation: '任务相互依赖并引发持续拖延和无力',
    perspective:
      '你不必把整个问题压进今天；先找到一个能改变下一步条件的动作，让行动与更大的结构重新连接。',
    action: '找出当前最阻塞其他任务的一件事，并把它拆成三十分钟内可完成的动作。',
    reflection: '哪一个小动作完成后，会让后面的选择比现在更清楚或更容易？',
  },
  {
    theme: 'action',
    slug: 'apology-and-repair',
    title: '让道歉指向可观察的修复',
    secondaryThemes: ['conscience', 'solidarity'],
    principle:
      '承认伤害需要语言，但责任不能只停在表达后悔；道歉应说明事实、避免辩解，并把改变交给可观察的行动。',
    situation: '意识到自己的行为伤害了别人，不知道怎样道歉才不是自我安慰',
    shortcut: '用强烈自责要求对方安慰，或只说以后不会了',
    focus: '造成的具体影响、对方自主和能够持续的改变',
    tensions: ['表达后悔与承担后果', '修复愿望与对方选择'],
    misreading: '认真道歉就应该要求对方立即原谅或恢复关系',
    keywords: ['道歉修复', '伤害别人', '承担责任'],
    aliases: ['怎么道歉才有用', '后悔了还能修复吗'],
    relatedSituation: '失信、冒犯或忽视边界后希望修复关系',
    perspective:
      '道歉的限度包括承认你不能控制对方是否原谅；能承担的是说清事实并改变导致伤害的行动。',
    action: '用事实、影响、责任和下一项改变四部分写一段不要求对方回应的道歉。',
    reflection: '除了表达自己的难受，你愿意让哪项具体改变接受时间检验？',
  },
  {
    theme: 'action',
    slug: 'habit-change',
    title: '把改变从意志宣言放回环境',
    secondaryThemes: ['limits', 'work'],
    principle:
      '改变习惯不能只依赖一次强烈决心；清醒行动需要看见触发条件、环境阻力和能够重复的最小安排。',
    situation: '多次发誓改变作息、学习或消费习惯，却很快回到原样',
    shortcut: '把每次失败解释为人格薄弱，再制定更激烈的承诺',
    focus: '行为发生的具体环境与可以降低阻力的设计',
    tensions: ['意志宣言与环境条件', '快速改变与可重复行动'],
    misreading: '重视环境就意味着个人完全不需要承担选择责任',
    keywords: ['改变习惯', '总是失败', '缺乏自律'],
    aliases: ['下决心还是做不到', '怎样真正开始坚持'],
    relatedSituation: '作息、运动、学习或消费计划反复中断',
    perspective:
      '行动需要诚实面对条件；与其再次证明意志，不如让下一次正确选择更容易发生。',
    action: '只选一个触发场景，移除一项阻力，并把目标缩小到可以连续完成七天。',
    reflection: '每次失败前稳定出现的条件是什么，你能否先改变它而不是再次责备自己？',
  },
  {
    theme: 'action',
    slug: 'civic-uncertainty',
    title: '在公共不确定中选择可核对的行动',
    secondaryThemes: ['revolt', 'solidarity'],
    principle:
      '公共行动很少提供纯粹和确定的结果；有限责任要求核对事实、选择手段并与能够纠错的共同结构连接。',
    situation: '想参与公共议题，却担心信息不全、组织不可靠或行动没有效果',
    shortcut: '等待完全纯粹的行动，或因紧迫感加入未经核验的安排',
    focus: '事实来源、组织责任和行动的可纠错性',
    tensions: ['参与与不确定', '紧迫行动与事实核验'],
    misreading: '没有完美组织就说明任何公共参与都不值得',
    keywords: ['公共参与', '志愿行动', '组织选择'],
    aliases: ['想参与又怕被利用', '怎样判断行动可靠'],
    relatedSituation: '捐款、志愿、倡议或社区行动需要选择渠道',
    perspective:
      '行动无需等待绝对纯粹，却应保留核验、退出和纠错；这让责任不被紧迫感替代。',
    action: '核对组织的公开责任、资金或成果记录，并从一项时间有限的参与开始。',
    reflection: '这个行动是否允许你知道资源去了哪里、提出异议并在发现问题时退出？',
  },
];

const drafts = [
  ...meaningDrafts,
  ...absurdDrafts,
  ...workDrafts,
  ...freedomDrafts,
  ...revoltDrafts,
  ...limitsDrafts,
  ...solidarityDrafts,
  ...hopeDrafts,
  ...happinessDrafts,
  ...mortalityDrafts,
  ...conscienceDrafts,
  ...actionDrafts,
];

if (drafts.length !== 72) {
  throw new Error(`Batch 02 must contain 72 drafts, received ${drafts.length}`);
}

for (const theme of Object.keys(profiles) as ThemeId[]) {
  const count = drafts.filter((draft) => draft.theme === theme).length;
  if (count !== 6) throw new Error(`${theme} must contain 6 drafts, received ${count}`);
}

const cards: ThoughtCard[] = drafts.map((draft) => {
  const profile = profiles[draft.theme];
  const boundary = `${profile.boundary}${draft.boundary ? ` ${draft.boundary}` : ''}`;
  return {
    id: `${draft.theme}-${draft.slug}-b02`,
    version: 1,
    status: 'approved',
    title: draft.title,
    theme: draft.theme,
    secondaryThemes: draft.secondaryThemes,
    principle: draft.principle,
    explanation: `在${draft.situation}时，人容易${draft.shortcut}。这张卡沿着${profile.sourceContext}，把注意力放回${draft.focus}，而不是提供没有根据的保证。`,
    boundary,
    tensions: [...draft.tensions, profile.sharedTension],
    counterMisreadings: [profile.misreading, draft.misreading],
    keywords: [...draft.keywords, profile.label],
    aliases: draft.aliases,
    situations: [draft.situation, draft.relatedSituation],
    negativeSignals: profile.negativeSignals,
    answerBlocks: {
      perspective: [draft.perspective],
      boundary: [boundary],
      actions: [draft.action],
      reflectionQuestions: [draft.reflection],
    },
    sources: profile.sources,
    directQuoteIds: [],
    rightsStatus: 'cleared',
    safetyTags: profile.safetyTags,
    reviewer: 'PlainTerranThomas',
    reviewedAt: '2026-08-04',
    reviewNotes:
      'AI 辅助原创概述，未使用直接引文；依据产品关于后续卡片统一通过的明确决定进入 approved。',
  };
});

const validatedCards = ThoughtCardCollectionSchema.parse(cards);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(projectRoot, 'content/cards/phase5-batch-02.json');
await writeFile(outputPath, `${JSON.stringify(validatedCards, null, 2)}\n`);
const evaluationPath = path.join(projectRoot, 'evals/retrieval-batch-02-gold.json');
const evaluationItems = drafts.map((draft) => ({
  id: `batch02-${draft.theme}-${draft.slug}`,
  query: `${draft.aliases[0]}，我现在该怎样判断？`,
  expectedCardIds: [`${draft.theme}-${draft.slug}-b02`],
}));
await writeFile(evaluationPath, `${JSON.stringify(evaluationItems, null, 2)}\n`);
console.log(
  `Phase 5 Batch 02 已生成：${validatedCards.length} 张 approved 卡片，${evaluationItems.length} 条检索金标。`,
);
