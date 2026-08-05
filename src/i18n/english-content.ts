import type { ThemeId, ThoughtCard } from '../types/content';

type EnglishThemeProfile = {
  principle: string;
  explanation: (focus: string) => string;
  boundary: string;
  tensions: [string, string, string];
  counterMisreadings: [string, string];
  keywords: string[];
  aliases: string[];
  situations: string[];
  perspective: (focus: string) => string;
  action: (focus: string) => string;
  reflection: (focus: string) => string;
  negativeSignals: string[];
};

const PROFILES: Record<ThemeId, EnglishThemeProfile> = {
  meaning: {
    principle:
      'The absence of a final explanation does not erase the concrete value of a relationship, task, or commitment.',
    explanation: (focus) =>
      `A dilemma about ${focus} can make one answer seem responsible for justifying an entire life. A Camus-informed reading separates the missing final guarantee from the concrete value that can still be named and cared for.`,
    boundary:
      'This does not require pretending that emptiness is unreal, or treating every possible commitment as equally worthwhile.',
    tensions: [
      'final meaning and concrete value',
      'explanation and lived experience',
      'emptiness and commitment',
    ],
    counterMisreadings: [
      'Without a final meaning, nothing has value',
      'Any chosen purpose is automatically good',
    ],
    keywords: ['meaning', 'purpose', 'worth', 'emptiness', 'value', 'identity'],
    aliases: [
      'life feels meaningless',
      'lost my sense of purpose',
      'what makes life worthwhile',
    ],
    situations: [
      'losing an old source of purpose',
      'trying to name value without a final guarantee',
    ],
    perspective: (focus) =>
      `With ${focus}, the first question is not whether life can be given a final proof, but which concrete value is still present without that proof.`,
    action: () =>
      'Name one person, task, or commitment that still deserves care today, and give it one bounded next step.',
    reflection: () =>
      'If no single answer had to justify your whole life, which concrete value would you refuse to overlook?',
    negativeSignals: ['I want to die', 'I plan to hurt myself'],
  },
  absurd: {
    principle:
      'The absurd names the continuing tension between our demand for clarity and a world that does not supply a matching answer.',
    explanation: (focus) =>
      `The frustration in ${focus} does not have to be disguised as a lesson or destiny. Lucidity begins by seeing the mismatch clearly while preserving the ability to judge and act.`,
    boundary:
      'Facing the absurd lucidly does not glorify suffering, forbid practical improvement, or make every choice equivalent.',
    tensions: [
      'the demand for clarity and the silence of the world',
      'repetition and attention',
      'chance and judgment',
    ],
    counterMisreadings: [
      'If life is absurd, nothing matters',
      'Lucidity means passive endurance',
    ],
    keywords: [
      'absurd',
      'repetition',
      'randomness',
      'bureaucracy',
      'closure',
      'frustration',
    ],
    aliases: [
      'why does this keep happening',
      'the world makes no sense',
      'stuck in the same loop',
    ],
    situations: [
      'facing repetition without a satisfying explanation',
      'acting amid chance and contradiction',
    ],
    perspective: (focus) =>
      `${focus} may not offer a satisfying explanation. The Camusian move is to refuse both a false story and the conclusion that judgment has become useless.`,
    action: () =>
      'Separate what is genuinely unanswerable from one concrete condition you can still observe, name, or alter.',
    reflection: () =>
      'What becomes possible once you stop demanding that this situation first make complete sense?',
    negativeSignals: ['I am going to kill myself', 'I am hurting myself now'],
  },
  work: {
    principle:
      'Material conditions restrict freedom, but restrictions should not be rewritten as either total powerlessness or complete personal responsibility.',
    explanation: (focus) =>
      `${focus} may involve income, duty, status, health, and fear at the same time. Lucid judgment distinguishes the constraints that are real from the terms that can still be negotiated or refused.`,
    boundary:
      'Naming limited freedom must not erase economic pressure, care obligations, structural injustice, or physical harm.',
    tensions: [
      'material necessity and limited freedom',
      'work and personal worth',
      'stability and change',
    ],
    counterMisreadings: [
      'A difficult job is only an attitude problem',
      'Freedom always means leaving immediately',
    ],
    keywords: [
      'work',
      'job',
      'career',
      'burnout',
      'salary',
      'labor',
      'management',
      'unemployment',
    ],
    aliases: ['trapped at work', 'should I quit my job', 'work has lost its meaning'],
    situations: [
      'weighing material needs against a harmful job',
      'separating work from personal worth',
    ],
    perspective: (focus) =>
      `In ${focus}, freedom may begin as an accurate account of which constraints are real, which terms remain negotiable, and which cost can no longer be hidden.`,
    action: () =>
      'List one condition you must maintain, one you can negotiate, and one you need to prepare to change.',
    reflection: () =>
      'Which specific consequence currently makes another option feel unavailable?',
    negativeSignals: ['I cannot breathe', 'someone is hitting me'],
  },
  freedom: {
    principle:
      'Freedom is not power without limits; it is action without a final guarantee, taken together with its real consequences.',
    explanation: (focus) =>
      `${focus} may be imagined as a choice that should remove every contradiction. A more honest freedom keeps the gains, losses, obligations, and effects on others inside the decision.`,
    boundary:
      'Taking responsibility for a choice does not mean accepting coercion or blaming yourself for structural injustice.',
    tensions: [
      'freedom and consequence',
      'choice and uncertainty',
      'self-direction and shared limits',
    ],
    counterMisreadings: [
      'Freedom means having no obligations',
      'A choice is invalid unless its outcome is certain',
    ],
    keywords: [
      'freedom',
      'choice',
      'decision',
      'regret',
      'responsibility',
      'independence',
    ],
    aliases: ['afraid of choosing wrong', 'I have no choice', 'how do I decide'],
    situations: [
      'choosing between imperfect options',
      'accepting the cost of a self-directed decision',
    ],
    perspective: (focus) =>
      `${focus} may offer no loss-free option. It can still be judged by making each consequence visible and asking which one you can responsibly carry.`,
    action: () =>
      'For each live option, write the most likely cost, who bears it, and which cost you are willing to take responsibility for.',
    reflection: () =>
      'Which concrete consequence are you trying to avoid when you say you are afraid of choosing wrongly?',
    negativeSignals: ['I am being forced', 'someone is threatening me with a weapon'],
  },
  revolt: {
    principle:
      'Revolt says no to what is intolerable while affirming a value that should apply to more than oneself.',
    explanation: (focus) =>
      `${focus} calls for more than anger alone. A Camus-informed revolt asks what shared dignity the refusal protects and whether its means reproduce the same dehumanization.`,
    boundary:
      'Limiting retaliatory harm does not require silence, forgiveness, or abandoning evidence, complaint, organization, and resistance.',
    tensions: [
      'refusal and shared value',
      'resistance and harmful means',
      'anger and strategy',
    ],
    counterMisreadings: [
      'The most violent resistance is the most authentic',
      'Rejecting harm means accepting injustice',
    ],
    keywords: [
      'revolt',
      'injustice',
      'resistance',
      'protest',
      'complaint',
      'discrimination',
      'harassment',
    ],
    aliases: ['how do I fight back', 'this is unfair', 'speaking up against abuse'],
    situations: [
      'resisting an injustice without reproducing it',
      'turning anger into bounded collective action',
    ],
    perspective: (focus) =>
      `With ${focus}, a clear refusal can name both the wrong and the value being defended, then choose means that do not destroy that value.`,
    action: () =>
      'Write one factual sentence naming what you refuse, one value you are protecting, and one proportionate channel for acting.',
    reflection: () =>
      'What shared value does your refusal defend, and which means would betray it?',
    negativeSignals: ['I am going to hurt someone', 'I plan to attack them'],
  },
  limits: {
    principle:
      'A limit is not passive obedience; it marks what an aim, relationship, or cause may not justifiably consume.',
    explanation: (focus) =>
      `${focus} can turn persistence into a virtue beyond question. Camusian measure asks whether the method has begun to destroy the person or value it was meant to serve.`,
    boundary:
      'Setting a limit is not the same as avoiding every discomfort, and immediate danger still requires practical and professional help.',
    tensions: ['commitment and self-erasure', 'ends and means', 'care and capacity'],
    counterMisreadings: [
      'Having limits is weakness',
      'A worthy goal justifies unlimited sacrifice',
    ],
    keywords: [
      'limits',
      'boundary',
      'overwork',
      'sacrifice',
      'capacity',
      'burnout',
      'means and ends',
    ],
    aliases: [
      'where should I draw the line',
      'I cannot keep giving',
      'when does persistence become harm',
    ],
    situations: [
      'setting a boundary without abandoning responsibility',
      'checking whether a means has overtaken its end',
    ],
    perspective: (focus) =>
      `${focus} should be judged not only by whether you can continue, but by what continued effort is already consuming.`,
    action: () =>
      'Define one observable stopping condition and tell one person who can help you respect it.',
    reflection: () =>
      'Is the goal you are protecting beginning to damage the person or value it was meant to serve?',
    negativeSignals: ['someone is in immediate danger', 'I have severe chest pain'],
  },
  solidarity: {
    principle:
      'Solidarity begins from a shared condition and becomes real through bounded, concrete work rather than heroic self-erasure.',
    explanation: (focus) =>
      `${focus} may create pressure either to withdraw completely or to take responsibility for everyone. Solidarity keeps difference visible while distributing attention, labor, and risk.`,
    boundary:
      'Solidarity does not require disclosing everything, agreeing on everything, or carrying every burden alone.',
    tensions: [
      'individual difference and shared condition',
      'help and capacity',
      'witness and action',
    ],
    counterMisreadings: [
      'Solidarity requires total agreement',
      'Helping means rescuing everyone yourself',
    ],
    keywords: [
      'solidarity',
      'loneliness',
      'support',
      'community',
      'mutual aid',
      'care',
      'grief',
    ],
    aliases: [
      'no one understands me',
      'how can I ask for help',
      'supporting someone without taking over',
    ],
    situations: [
      'seeking support without self-erasure',
      'sharing a burden through concrete cooperation',
    ],
    perspective: (focus) =>
      `${focus} may become more bearable when the next responsibility is made specific, shared, and limited instead of being carried as a private totality.`,
    action: () =>
      'Ask one person for one specific form of help, with a clear time and boundary.',
    reflection: () =>
      'What part of this burden could become shared without asking either person to disappear into it?',
    negativeSignals: ['a child is in danger', 'someone is unconscious'],
  },
  hope: {
    principle:
      'Honest hope does not need to promise an outcome; it can remain a disciplined willingness to act under uncertainty.',
    explanation: (focus) =>
      `${focus} can invite either false certainty or complete surrender. A lucid hope distinguishes a desired future from a guarantee and returns attention to what can be sustained now.`,
    boundary:
      'Refusing false guarantees does not forbid treatment, planning, reasonable expectation, or support, and it must never romanticize dangerous despair.',
    tensions: [
      'hope and honesty',
      'future possibility and present action',
      'desire and guarantee',
    ],
    counterMisreadings: [
      'Lucidity requires giving up all hope',
      'Hope means promising that things will improve',
    ],
    keywords: [
      'hope',
      'uncertainty',
      'waiting',
      'recovery',
      'future',
      'rejection',
      'trust',
    ],
    aliases: [
      'will things ever get better',
      'I have lost hope',
      'waiting without a guarantee',
    ],
    situations: [
      'continuing without a promised outcome',
      'turning a hoped-for future into a present practice',
    ],
    perspective: (focus) =>
      `With ${focus}, hope can be kept honest by naming what you want without pretending it is guaranteed, then choosing a practice that remains worthwhile either way.`,
    action: () =>
      'Write one hoped-for outcome and one action that still has value even if that outcome remains uncertain.',
    reflection: () =>
      'What can you continue to care for without turning it into a promise about the future?',
    negativeSignals: ['I want to end my life', 'I wrote a suicide note'],
  },
  happiness: {
    principle:
      'Present happiness can be real without denying suffering, and it need not wait for life to become complete.',
    explanation: (focus) =>
      `${focus} may look too small beside unfinished duties or grief. Camus's attention to sensory life treats such moments not as a final solution, but as part of the life that responsibilities are meant to preserve.`,
    boundary:
      'Attention to the present does not erase trauma, poverty, responsibility, or the need to change harmful conditions.',
    tensions: [
      'present joy and unfinished difficulty',
      'attention and postponement',
      'pleasure and responsibility',
    ],
    counterMisreadings: [
      'Enjoying the present solves every problem',
      'Joy is only legitimate after all work is finished',
    ],
    keywords: [
      'happiness',
      'joy',
      'present',
      'sensory',
      'rest',
      'pleasure',
      'ordinary life',
    ],
    aliases: [
      'I keep postponing life',
      'I feel guilty for enjoying anything',
      'how do I live in the present',
    ],
    situations: [
      'allowing ordinary pleasure without denial',
      'returning attention to a life indefinitely postponed',
    ],
    perspective: (focus) =>
      `${focus} does not have to solve the whole of life to be real. It can be received as a finite part of the life your obligations are meant to serve.`,
    action: () =>
      'Set aside ten unproductive minutes for one sensory experience and notice it without turning it into a reward or task.',
    reflection: () =>
      'What part of life are you postponing until a completion that may never arrive?',
    negativeSignals: ['I cannot breathe', 'I am being forced to transfer money'],
  },
  mortality: {
    principle:
      'Awareness of mortality can clarify the use of finite time without turning death into a command for recklessness.',
    explanation: (focus) =>
      `${focus} brings absence and limited time close. A Camus-informed response does not erase grief; it asks what deserves presence, care, or completion precisely because time is not unlimited.`,
    boundary:
      'Mortality must never be used to encourage self-harm, reckless action, or contempt for grief and long-term responsibility.',
    tensions: [
      'finite time and postponement',
      'memory and change',
      'grief and continued life',
    ],
    counterMisreadings: [
      'Because life is short, every risk is justified',
      'Accepting mortality means suppressing grief',
    ],
    keywords: ['mortality', 'death', 'grief', 'aging', 'time', 'loss', 'legacy'],
    aliases: ['life is short', 'afraid of getting older', 'I keep delaying what matters'],
    situations: [
      'letting finite time clarify a priority',
      'carrying memory without freezing the present',
    ],
    perspective: (focus) =>
      `${focus} can clarify rather than command: finite time asks which neglected presence or responsibility should no longer be postponed.`,
    action: () =>
      'Choose one conversation, record, or practical act of care that can be completed without trying to resolve the whole loss.',
    reflection: () =>
      'Knowing that time is finite, what deserves your presence before it receives another delay?',
    negativeSignals: ['I plan to end my life', 'I am about to jump'],
  },
  conscience: {
    principle:
      'Conscience preserves personal judgment within collective action while remaining answerable to facts, limits, and the humanity of others.',
    explanation: (focus) =>
      `${focus} may create pressure to confuse loyalty, role, or convenience with what is right. Conscience begins by naming the fact that would otherwise need to be hidden.`,
    boundary:
      'Following conscience does not guarantee that one is correct, and it does not require facing coercion, violence, or major legal risk alone.',
    tensions: [
      'personal judgment and external demand',
      'loyalty and truth',
      'role and responsibility',
    ],
    counterMisreadings: [
      'Sincere conviction justifies any means',
      'Loyalty always requires silence',
    ],
    keywords: [
      'conscience',
      'ethics',
      'truth',
      'loyalty',
      'pressure',
      'compromise',
      'integrity',
    ],
    aliases: [
      'asked to hide the truth',
      'this feels wrong',
      'loyalty conflicts with my values',
    ],
    situations: [
      'preserving judgment under group pressure',
      'refusing a convenient distortion of facts',
    ],
    perspective: (focus) =>
      `With ${focus}, the first act of conscience may be to state the relevant fact plainly and ask what silence would make you participate in.`,
    action: () =>
      'Write the key fact without euphemism, who could be harmed by silence, and one proportionate person or channel you can consult.',
    reflection: () =>
      'Which fact would you need to hide in order to call the easier option acceptable?',
    negativeSignals: ['someone is threatening to kill me', 'I am being assaulted'],
  },
  action: {
    principle:
      'Action does not require final certainty; it requires a bounded step whose direction, means, and consequences remain open to review.',
    explanation: (focus) =>
      `${focus} may feel impossible when the first move is expected to guarantee the whole result. A finite, reversible step can create evidence without pretending uncertainty has disappeared.`,
    boundary:
      'A small step is not automatically safe or right, and it cannot replace emergency, medical, legal, or financial help.',
    tensions: [
      'uncertainty and action',
      'preparation and delay',
      'commitment and reversibility',
    ],
    counterMisreadings: [
      'Any action is better than reflection',
      'The first step must solve the whole problem',
    ],
    keywords: [
      'action',
      'first step',
      'decision',
      'experiment',
      'practice',
      'repair',
      'uncertainty',
    ],
    aliases: [
      'I do not know where to start',
      'afraid to make the first move',
      'stuck overthinking',
    ],
    situations: [
      'turning an overwhelming problem into a bounded experiment',
      'acting without pretending to know the final outcome',
    ],
    perspective: (focus) =>
      `${focus} does not require a guarantee before movement. It requires a first step small enough to review and real enough to produce information.`,
    action: (focus) =>
      `Define the smallest reversible version of ${focus}, give it a clear time limit, and decide in advance what evidence you will review.`,
    reflection: () =>
      'Which uncertainty actually needs more evidence, and which one are you using to postpone a reversible step?',
    negativeSignals: ['I plan to retaliate', 'I have severe chest pain'],
  },
};

const SOURCE_TITLES: Record<string, string> = {
  '《西西弗神话》': 'The Myth of Sisyphus',
  '《反抗者》': 'The Rebel',
  '《鼠疫》': 'The Plague',
  '《婚礼集》': 'Nuptials',
  '《夏天集》': 'Summer',
  '《既非受害者，也非刽子手》': 'Neither Victims nor Executioners',
  '《致一个德国朋友的信》': 'Letters to a German Friend',
};

const SOURCE_SECTIONS: Partial<Record<string, string>> = {
  '《西西弗神话》': 'Absurd reasoning, freedom, and the myth of Sisyphus',
  '《反抗者》': 'Revolt, historical rebellion, and the thought at midday',
  '《鼠疫》': 'Common work, witness, and responsibility',
  '《婚礼集》': 'The present, sensory life, and nature',
  '《夏天集》': 'Measure, reality, and present beauty',
  '《既非受害者，也非刽子手》': 'Refusing murder, measure, and dialogue',
  '《致一个德国朋友的信》': 'Justice, responsibility, and common humanity',
};

const TITLE_EXCLUSIONS = new Set(['b02', 'b03', 'b04', '001']);

function cardFocus(card: ThoughtCard): string {
  const words = card.id
    .split('-')
    .filter((word, index) => index > 0 && !TITLE_EXCLUSIONS.has(word));
  return words.join(' ') || card.theme;
}

function cardTitle(card: ThoughtCard): string {
  return cardFocus(card).replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('en'));
}

export function createEnglishThoughtCard(card: ThoughtCard): ThoughtCard {
  const profile = PROFILES[card.theme];
  const focus = cardFocus(card);
  const idWords = [...new Set(focus.split(' ').filter(Boolean))];

  return {
    ...card,
    title: cardTitle(card),
    principle: profile.principle,
    explanation: profile.explanation(focus),
    boundary: profile.boundary,
    tensions: [...profile.tensions],
    counterMisreadings: [...profile.counterMisreadings],
    keywords: [...new Set([...idWords, ...profile.keywords])],
    aliases: [...profile.aliases, `${focus} dilemma`],
    situations: [...profile.situations, `facing ${focus}`],
    negativeSignals: [...profile.negativeSignals],
    answerBlocks: {
      perspective: [profile.perspective(focus)],
      boundary: [profile.boundary],
      actions: [profile.action(focus)],
      reflectionQuestions: [profile.reflection(focus)],
    },
    sources: card.sources.map((source) => ({
      ...source,
      work: SOURCE_TITLES[source.work] ?? source.work,
      section:
        SOURCE_SECTIONS[source.work] ??
        (source.language === 'en' ? source.section : undefined),
    })),
    reviewNotes:
      'Deterministic English localization of the approved canonical card; no generated quotation or new factual claim.',
  };
}

export function createEnglishThoughtCards(cards: readonly ThoughtCard[]): ThoughtCard[] {
  return cards.map(createEnglishThoughtCard);
}
