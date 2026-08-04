import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  SynonymCatalogSchema,
  ThoughtCardCollectionSchema,
} from '../../src/content/schema';
import { buildSearchIndex } from '../../src/retrieval/bm25';
import { retrieveThoughtCards } from '../../src/retrieval/retrieve';
import type { SearchIndex } from '../../src/retrieval/types';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let index: SearchIndex;

beforeAll(async () => {
  const cards = ThoughtCardCollectionSchema.parse(
    JSON.parse(
      await readFile(path.join(projectRoot, 'content/cards/seed-cards.json'), 'utf8'),
    ) as unknown,
  );
  const synonyms = SynonymCatalogSchema.parse(
    JSON.parse(
      await readFile(path.join(projectRoot, 'content/synonyms/synonyms.json'), 'utf8'),
    ) as unknown,
  );
  index = buildSearchIndex(cards, synonyms);
});

describe('weighted BM25 retrieval', () => {
  it('indexes only approved cards', () => {
    expect(index.cardCount).toBe(23);
    expect(index.documents.every((document) => document.card.status === 'approved')).toBe(
      true,
    );
  });

  it('ranks repetitive work for a natural-language question', () => {
    const result = retrieveThoughtCards(
      index,
      '每天上班都在做一样的事情，为什么还要继续？',
    );

    expect(result.noResult).toBe(false);
    expect(
      result.debug.ranking.slice(0, 3).map((candidate) => candidate.card.id),
    ).toContain('absurd-repetitive-work-001');
  });

  it('returns no result for an unrelated cooking question', () => {
    const result = retrieveThoughtCards(index, '番茄炒蛋应该怎么做');
    expect(result.noResult).toBe(true);
    expect(result.mainCard).toBeNull();
  });

  it('selects no more than two complementary auxiliary cards', () => {
    const result = retrieveThoughtCards(index, '工作没有意义，我想辞职但担心后果');
    expect(result.auxiliaryCards.length).toBeLessThanOrEqual(2);
    expect(new Set(result.auxiliaryCards.map((card) => card.id)).size).toBe(
      result.auxiliaryCards.length,
    );
  });
});
