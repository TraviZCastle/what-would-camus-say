import type { ThoughtCard } from '../types/content';
import type { AnswerSection, AnswerSource, ComposedAnswer } from './types';

function stableIndex(seed: string, length: number): number {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  return length === 0 ? 0 : hash % length;
}

function selectBlock(values: readonly string[], seed: string): string {
  return values[stableIndex(seed, values.length)] ?? '';
}

function questionFocus(question: string): string {
  const normalized = question
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[。？！?!]+$/u, '');
  return normalized.length > 48 ? `${normalized.slice(0, 48)}…` : normalized;
}

function collectSources(cards: readonly ThoughtCard[]): AnswerSource[] {
  const seen = new Set<string>();
  const sources: AnswerSource[] = [];

  for (const card of cards) {
    for (const source of card.sources) {
      const key = `${source.work}|${source.section ?? ''}|${source.locator ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      sources.push({ ...source, cardId: card.id });
    }
  }

  return sources;
}

function sectionCharacterCount(sections: readonly AnswerSection[]): number {
  return sections.reduce((total, section) => total + Array.from(section.text).length, 0);
}

export function composeAnswer(question: string, mainCard: ThoughtCard): ComposedAnswer {
  const seed = `${mainCard.id}|${question}`;
  const tensions = mainCard.tensions;
  const firstTension =
    tensions[stableIndex(`${seed}|first`, tensions.length)] ?? '现实需要';
  const alternativeTensions = tensions.filter((tension) => tension !== firstTension);
  const secondTension =
    alternativeTensions[stableIndex(`${seed}|second`, alternativeTensions.length)] ??
    mainCard.secondaryThemes[0] ??
    '个人判断';
  const perspectiveBlock = selectBlock(mainCard.answerBlocks.perspective, `${seed}|view`);
  let perspective = `${perspectiveBlock} ${mainCard.explanation}`;

  const sections: AnswerSection[] = [
    {
      kind: 'dilemma',
      label: '看见困境',
      text: `你提出的是：${questionFocus(question)}。其中不只是一个表面选择，也包含「${firstTension}」与「${secondTension}」之间的冲突。`,
      traces: [{ cardId: mainCard.id, fields: ['tensions'] }],
    },
    {
      kind: 'perspective',
      label: '加缪视角',
      text: perspective,
      traces: [
        {
          cardId: mainCard.id,
          fields: ['answerBlocks.perspective', 'explanation'],
        },
      ],
    },
    {
      kind: 'boundary',
      label: '必要边界',
      text: selectBlock(mainCard.answerBlocks.boundary, `${seed}|boundary`),
      traces: [{ cardId: mainCard.id, fields: ['answerBlocks.boundary'] }],
    },
    {
      kind: 'action',
      label: '现实一步',
      text: selectBlock(mainCard.answerBlocks.actions, `${seed}|action`),
      traces: [{ cardId: mainCard.id, fields: ['answerBlocks.actions'] }],
    },
    {
      kind: 'reflection',
      label: '留给你的问题',
      text: selectBlock(mainCard.answerBlocks.reflectionQuestions, `${seed}|reflection`),
      traces: [{ cardId: mainCard.id, fields: ['answerBlocks.reflectionQuestions'] }],
    },
  ];

  if (sectionCharacterCount(sections) < 180) {
    perspective = `${perspective} ${mainCard.principle}`;
    sections[1] = {
      ...sections[1],
      text: perspective,
      traces: [
        {
          cardId: mainCard.id,
          fields: ['answerBlocks.perspective', 'explanation', 'principle'],
        },
      ],
    };
  }

  return {
    sections,
    sources: collectSources([mainCard]),
    usedCardIds: [mainCard.id],
    characterCount: sectionCharacterCount(sections),
  };
}
