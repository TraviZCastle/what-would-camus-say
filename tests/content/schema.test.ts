import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadThoughtCards } from '../../scripts/load-thought-cards';
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
});
