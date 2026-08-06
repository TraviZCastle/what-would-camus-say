import type { ThoughtCard } from '../types/content';
import type { AppLanguage } from '../i18n/language';
import type { AnswerSection, AnswerSource, ComposedAnswer } from './types';

function stableIndex(seed: string, length: number): number {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  return length === 0 ? 0 : hash % length;
}

function selectBlock(values: readonly string[], seed: string): string {
  return values[stableIndex(seed, values.length)] ?? '';
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

export function composeAnswer(
  question: string,
  mainCard: ThoughtCard,
  language: AppLanguage = 'zh',
): ComposedAnswer {
  const seed = `${mainCard.id}|${question}`;
  const tensions = mainCard.tensions;
  const firstTension =
    tensions[stableIndex(`${seed}|first`, tensions.length)] ??
    (language === 'zh' ? '现实需要' : 'material reality');
  const alternativeTensions = tensions.filter((tension) => tension !== firstTension);
  const secondTension =
    alternativeTensions[stableIndex(`${seed}|second`, alternativeTensions.length)] ??
    mainCard.secondaryThemes[0] ??
    (language === 'zh' ? '个人判断' : 'personal judgment');
  const perspectiveBlock = selectBlock(mainCard.answerBlocks.perspective, `${seed}|view`);
  let perspective = perspectiveBlock;

  const sections: AnswerSection[] = [
    {
      kind: 'dilemma',
      label: language === 'zh' ? '看见困境' : 'The dilemma',
      text:
        language === 'zh'
          ? `这个处境的核心张力，在于「${firstTension}」与「${secondTension}」之间；它不只是一个需要立即作答的表面选择。`
          : `The central tension lies between “${firstTension}” and “${secondTension}”; this is more than an immediate choice demanding a quick answer.`,
      traces: [{ cardId: mainCard.id, fields: ['tensions'] }],
    },
    {
      kind: 'perspective',
      label: language === 'zh' ? '加缪视角' : 'A Camusian perspective',
      text: perspective,
      traces: [
        {
          cardId: mainCard.id,
          fields: ['answerBlocks.perspective'],
        },
      ],
    },
    {
      kind: 'boundary',
      label: language === 'zh' ? '必要边界' : 'A necessary limit',
      text: selectBlock(mainCard.answerBlocks.boundary, `${seed}|boundary`),
      traces: [{ cardId: mainCard.id, fields: ['answerBlocks.boundary'] }],
    },
    {
      kind: 'action',
      label: language === 'zh' ? '现实一步' : 'One practical step',
      text: selectBlock(mainCard.answerBlocks.actions, `${seed}|action`),
      traces: [{ cardId: mainCard.id, fields: ['answerBlocks.actions'] }],
    },
    {
      kind: 'reflection',
      label: language === 'zh' ? '留给你的问题' : 'A question to keep',
      text: selectBlock(mainCard.answerBlocks.reflectionQuestions, `${seed}|reflection`),
      traces: [{ cardId: mainCard.id, fields: ['answerBlocks.reflectionQuestions'] }],
    },
  ];

  if (sectionCharacterCount(sections) < 180) {
    perspective = `${perspective} ${mainCard.explanation}`;
    sections[1] = {
      ...sections[1],
      text: perspective,
      traces: [
        {
          cardId: mainCard.id,
          fields: ['answerBlocks.perspective', 'explanation'],
        },
      ],
    };
  }

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
