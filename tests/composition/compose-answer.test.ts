import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

import { loadThoughtCards } from '../../scripts/load-thought-cards';
import { composeAnswer } from '../../src/composition/compose-answer';
import type { ThoughtCard } from '../../src/types/content';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let cards: ThoughtCard[];

beforeAll(async () => {
  cards = await loadThoughtCards(projectRoot);
});

describe('deterministic answer composition', () => {
  it('builds every required section with traceable card fields', () => {
    const answer = composeAnswer('每天重复上班，我为什么还要继续？', cards[0]);

    expect(answer.sections.map((section) => section.kind)).toEqual([
      'dilemma',
      'perspective',
      'boundary',
      'action',
      'reflection',
    ]);
    expect(answer.sections.every((section) => section.traces.length > 0)).toBe(true);
    expect(answer.sources.length).toBeGreaterThan(0);
  });

  it('keeps answers within the target length for every seed card', () => {
    for (const card of cards) {
      const answer = composeAnswer('我正在面对一个没有简单答案的现实选择。', card);
      expect(answer.characterCount, card.id).toBeGreaterThanOrEqual(180);
      expect(answer.characterCount, card.id).toBeLessThanOrEqual(450);
    }
  });

  it('returns the same approved blocks for the same input', () => {
    const first = composeAnswer('我担心选择以后会后悔。', cards[0]);
    const second = composeAnswer('我担心选择以后会后悔。', cards[0]);
    expect(second).toEqual(first);
  });

  it('does not impersonate Camus or invent a direct quotation', () => {
    const answer = composeAnswer('我该怎么办？', cards[0]);
    const text = answer.sections.map((section) => section.text).join('');
    expect(text).not.toContain('我是加缪');
    expect(text).not.toContain('加缪说过');
  });
});
