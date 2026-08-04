import type { SynonymCatalog } from '../types/content';
import { normalizeText, tokenizeText } from './tokenizer';

export type ExpandedQuery = {
  tokens: string[];
  matchedTerms: string[];
};

export function expandQueryTokens(
  normalizedQuery: string,
  originalTokens: readonly string[],
  synonyms: SynonymCatalog,
  lexicon: readonly string[],
): ExpandedQuery {
  const tokens = new Set(originalTokens);
  const matchedTerms: string[] = [];

  for (const entry of synonyms.entries) {
    const normalizedTerm = normalizeText(entry.term);
    const normalizedExpansions = entry.expansions.map(normalizeText);
    const matches =
      normalizedQuery.includes(normalizedTerm) ||
      originalTokens.includes(normalizedTerm) ||
      normalizedExpansions.some(
        (expansion) =>
          normalizedQuery.includes(expansion) || originalTokens.includes(expansion),
      );

    if (!matches) continue;
    matchedTerms.push(entry.term);

    for (const value of [entry.term, ...entry.expansions]) {
      for (const token of tokenizeText(value, lexicon).tokens) tokens.add(token);
    }
  }

  return { tokens: [...tokens], matchedTerms };
}
