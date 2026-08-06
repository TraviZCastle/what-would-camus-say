import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import synonymsJson from '../../content/synonyms/synonyms.json';
import { loadThoughtCards } from '../../scripts/load-thought-cards';
import { SynonymCatalogSchema } from '../../src/content/schema';
import { buildSearchIndex } from '../../src/retrieval/bm25';
import { retrieveThoughtCards } from '../../src/retrieval/retrieve';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('philosophical discussion of suicide', () => {
  it('retrieves the dedicated Camus card instead of a safety or generic meaning card', async () => {
    const cards = await loadThoughtCards(projectRoot);
    const synonyms = SynonymCatalogSchema.parse(synonymsJson);
    const index = buildSearchIndex(cards, synonyms);
    const result = retrieveThoughtCards(
      index,
      '自杀是唯一严肃的哲学问题，这句话对加缪意味着什么？',
    );

    expect(result.noResult).toBe(false);
    expect(result.mainCard?.id).toBe('absurd-suicide-philosophical-question-001');
  });
});
