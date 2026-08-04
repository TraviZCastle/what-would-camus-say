import { rankDocuments } from './bm25';
import { expandQueryTokens } from './query-expansion';
import { selectCards } from './select-cards';
import { tokenizeText } from './tokenizer';
import type { RetrievalResult, SearchIndex } from './types';

export function retrieveThoughtCards(index: SearchIndex, query: string): RetrievalResult {
  const tokenization = tokenizeText(query, index.lexicon);
  const expanded = expandQueryTokens(
    tokenization.normalized,
    tokenization.tokens,
    index.synonyms,
    index.lexicon,
  );
  const ranking = rankDocuments(index, expanded.tokens);
  const selected = selectCards(ranking);

  return {
    ...selected,
    debug: {
      normalizedQuery: tokenization.normalized,
      originalTokens: [...new Set(tokenization.tokens)],
      expandedTokens: expanded.tokens,
      matchedSynonymTerms: expanded.matchedTerms,
      ranking,
    },
  };
}
