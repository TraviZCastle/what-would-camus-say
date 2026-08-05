import { describe, expect, it } from 'vitest';

import { createEnglishThoughtCards } from '../../src/i18n/english-content';
import { detectQuestionLanguage } from '../../src/i18n/language';
import { loadThoughtCards } from '../../scripts/load-thought-cards';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('automatic bilingual routing', () => {
  it('detects Chinese and English without a manual language state', () => {
    expect(detectQuestionLanguage('每天重复上班，我不知道为什么还要继续。', 'en')).toBe(
      'zh',
    );
    expect(
      detectQuestionLanguage('Every day at work feels the same. Why continue?', 'zh'),
    ).toBe('en');
  });

  it('keeps the current language for short ambiguous input', () => {
    expect(detectQuestionLanguage('AI', 'zh')).toBe('zh');
    expect(detectQuestionLanguage('AI', 'en')).toBe('en');
  });

  it('creates one English localization for every approved canonical card', async () => {
    const cards = await loadThoughtCards(projectRoot);
    const localized = createEnglishThoughtCards(cards);

    expect(localized).toHaveLength(300);
    expect(localized.map((card) => card.id)).toEqual(cards.map((card) => card.id));
    expect(localized.every((card) => card.status === 'approved')).toBe(true);
    expect(localized.every((card) => /[a-z]/i.test(card.title))).toBe(true);
  });
});
