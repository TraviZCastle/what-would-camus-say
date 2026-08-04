import { describe, expect, it } from 'vitest';

import type { SynonymCatalog } from '../../src/types/content';
import { expandQueryTokens } from '../../src/retrieval/query-expansion';
import { normalizeText, tokenizeText } from '../../src/retrieval/tokenizer';

const synonyms: SynonymCatalog = {
  version: 1,
  status: 'review',
  reviewer: 'test',
  reviewedAt: '2026-08-04',
  entries: [
    {
      term: '辞职',
      expansions: ['离开工作', '换工作', '继续或离开'],
      themes: ['work', 'freedom', 'action'],
    },
  ],
};

describe('Chinese query processing', () => {
  it('normalizes Unicode, case and punctuation', () => {
    expect(normalizeText(' ＲＥＡＣＴ，工作！ ')).toBe('react 工作');
  });

  it('keeps negation-bearing fragments and Chinese n-grams', () => {
    const result = tokenizeText('我不能继续这样工作');
    expect(result.tokens).toContain('不能');
    expect(result.tokens).toContain('继续');
    expect(result.tokens).toContain('工作');
  });

  it('expands only controlled synonym entries', () => {
    const tokenization = tokenizeText('我想辞职', ['辞职', '换工作', '离开工作']);
    const result = expandQueryTokens(
      tokenization.normalized,
      tokenization.tokens,
      synonyms,
      ['辞职', '换工作', '离开工作'],
    );

    expect(result.matchedTerms).toEqual(['辞职']);
    expect(result.tokens).toContain('换工作');
  });
});
