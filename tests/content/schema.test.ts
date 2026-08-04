import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ThoughtCardCollectionSchema, ThoughtCardSchema } from '../../src/content/schema';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('thought-card content schema', () => {
  it('accepts every Phase 1 seed card', async () => {
    const raw = await readFile(
      path.join(projectRoot, 'content/cards/seed-cards.json'),
      'utf8',
    );
    const cards = ThoughtCardCollectionSchema.parse(JSON.parse(raw) as unknown);

    expect(cards.length).toBeGreaterThanOrEqual(20);
    expect(new Set(cards.map((card) => card.theme)).size).toBeGreaterThanOrEqual(6);
    expect(cards.every((card) => card.status === 'review')).toBe(true);
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
});
