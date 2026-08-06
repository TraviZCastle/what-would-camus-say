import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadThoughtCards } from '../../scripts/load-thought-cards';
import { APPROVED_RESULT_QUOTES } from '../../src/content/direct-quotes';
import { THEME_IDS, ThoughtCardSchema } from '../../src/content/schema';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('thought-card content schema', () => {
  it('accepts every versioned thought card', async () => {
    const cards = await loadThoughtCards(projectRoot);

    expect(cards.length).toBeGreaterThanOrEqual(20);
    expect(new Set(cards.map((card) => card.theme)).size).toBeGreaterThanOrEqual(6);
    expect(
      cards.every((card) => card.status === 'review' || card.status === 'approved'),
    ).toBe(true);
  });

  it('rejects a card without a traceable source', () => {
    const invalidCard = {
      id: 'invalid-card',
      version: 1,
      status: 'draft',
      sources: [],
    };

    expect(ThoughtCardSchema.safeParse(invalidCard).success).toBe(false);
  });

  it('keeps exactly 80 short, sourced result quotations across the requested works', () => {
    expect(APPROVED_RESULT_QUOTES).toHaveLength(80);
    expect(new Set(APPROVED_RESULT_QUOTES.map((quote) => quote.sourceLanguage))).toEqual(
      new Set(['en', 'fr']),
    );
    expect(new Set(APPROVED_RESULT_QUOTES.map((quote) => quote.source.work))).toEqual(
      new Set([
        'Le Mythe de Sisyphe',
        "L'Homme révolté",
        'The Stranger',
        'The Plague',
        'Notebooks, 1935–1942',
        'Notebooks, 1942–1951',
      ]),
    );

    for (const quote of APPROVED_RESULT_QUOTES) {
      expect(quote.status, quote.id).toBe('approved');
      expect(quote.source.work, quote.id).toBeTruthy();
      expect(quote.sourceText.split(/\s+/u).length, quote.id).toBeLessThanOrEqual(25);
      expect(quote.keywords.length, quote.id).toBeGreaterThan(0);
      expect(quote.translations.zh, quote.id).toMatch(/[一-鿿]/);
    }
  });

  it('keeps Phase 5 batch 02 balanced across all themes', async () => {
    const cards = await loadThoughtCards(projectRoot);
    const batchCards = cards.filter((card) => card.id.endsWith('-b02'));

    expect(batchCards).toHaveLength(72);
    for (const theme of THEME_IDS) {
      expect(
        batchCards.filter((card) => card.theme === theme),
        theme,
      ).toHaveLength(6);
    }
    expect(batchCards.every((card) => card.status === 'approved')).toBe(true);
  });

  it('keeps Phase 5 batch 03 balanced across all themes', async () => {
    const cards = await loadThoughtCards(projectRoot);
    const batchCards = cards.filter((card) => card.id.endsWith('-b03'));

    expect(batchCards).toHaveLength(96);
    for (const theme of THEME_IDS) {
      expect(
        batchCards.filter((card) => card.theme === theme),
        theme,
      ).toHaveLength(8);
    }
    expect(batchCards.every((card) => card.status === 'approved')).toBe(true);
  });

  it('uses Batch 04 to bring every primary theme to at least 25 cards', async () => {
    const cards = await loadThoughtCards(projectRoot);
    const batchCards = cards.filter((card) => card.id.endsWith('-b04'));

    expect(batchCards).toHaveLength(109);
    expect(cards).toHaveLength(301);
    for (const theme of THEME_IDS) {
      expect(
        cards.filter((card) => card.theme === theme),
        theme,
      ).toHaveLength(theme === 'absurd' ? 26 : 25);
    }
    expect(batchCards.every((card) => card.status === 'approved')).toBe(true);
  });
});
