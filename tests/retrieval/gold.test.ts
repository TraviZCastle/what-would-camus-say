import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadRetrievalGold } from '../../scripts/load-retrieval-gold';
import { loadThoughtCards } from '../../scripts/load-thought-cards';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('retrieval gold coverage', () => {
  it('references only existing cards with unique evaluation IDs', async () => {
    const [gold, cards] = await Promise.all([
      loadRetrievalGold(projectRoot),
      loadThoughtCards(projectRoot),
    ]);
    const cardIds = new Set(cards.map((card) => card.id));
    const goldIds = gold.map((item) => item.id);

    expect(new Set(goldIds).size).toBe(goldIds.length);
    for (const item of gold) {
      for (const expectedCardId of item.expectedCardIds ?? []) {
        expect(cardIds.has(expectedCardId), `${item.id}: ${expectedCardId}`).toBe(true);
      }
    }
  });

  it('covers every Batch 02 card with a natural-language query', async () => {
    const gold = await loadRetrievalGold(projectRoot);
    const batchItems = gold.filter((item) => item.id.startsWith('batch02-'));

    expect(gold.length).toBeGreaterThanOrEqual(122);
    expect(batchItems).toHaveLength(72);
    expect(batchItems.every((item) => item.query.length >= 10)).toBe(true);
  });

  it('covers every Batch 03 card with a natural-language query', async () => {
    const gold = await loadRetrievalGold(projectRoot);
    const batchItems = gold.filter((item) => item.id.startsWith('batch03-'));

    expect(gold.length).toBeGreaterThanOrEqual(218);
    expect(batchItems).toHaveLength(96);
    expect(batchItems.every((item) => item.query.length >= 10)).toBe(true);
  });
});
