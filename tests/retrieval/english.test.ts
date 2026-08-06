import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import englishSynonymsJson from '../../content/synonyms/synonyms.en.json';
import { loadThoughtCards } from '../../scripts/load-thought-cards';
import { SynonymCatalogSchema } from '../../src/content/schema';
import { createEnglishThoughtCards } from '../../src/i18n/english-content';
import { buildSearchIndex } from '../../src/retrieval/bm25';
import { retrieveThoughtCards } from '../../src/retrieval/retrieve';
import type { ThemeId } from '../../src/types/content';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const cases: Array<{ query: string; expectedTheme: ThemeId }> = [
  {
    query: 'Every day at work feels the same and I am completely burned out.',
    expectedTheme: 'work',
  },
  {
    query: 'Both choices have a cost and I am afraid I will regret my decision.',
    expectedTheme: 'freedom',
  },
  {
    query: 'How can I resist this unfair discrimination without causing more harm?',
    expectedTheme: 'revolt',
  },
  {
    query: 'I keep postponing my life and feel guilty whenever I enjoy the present.',
    expectedTheme: 'happiness',
  },
  {
    query: 'I am lonely and do not know how to ask my community for support.',
    expectedTheme: 'solidarity',
  },
  {
    query: 'I keep overthinking this project and cannot take the first step.',
    expectedTheme: 'action',
  },
];

describe('English BM25 retrieval', () => {
  it('uses the English index for common real-life questions', async () => {
    const cards = createEnglishThoughtCards(await loadThoughtCards(projectRoot));
    const synonyms = SynonymCatalogSchema.parse(englishSynonymsJson);
    const index = buildSearchIndex(cards, synonyms);

    expect(index.cardCount).toBe(301);
    for (const item of cases) {
      const result = retrieveThoughtCards(index, item.query);
      expect(result.noResult, item.query).toBe(false);
      expect(
        result.debug.ranking
          .slice(0, 3)
          .some((candidate) => candidate.card.theme === item.expectedTheme),
        item.query,
      ).toBe(true);
    }
  });
});
