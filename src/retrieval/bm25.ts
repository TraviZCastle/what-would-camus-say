import type { SynonymCatalog, ThoughtCard } from '../types/content';
import { BM25_CONFIG, RETRIEVAL_FIELDS, type RetrievalField } from './config';
import { createLexicon, tokenizeText } from './tokenizer';
import type {
  FieldStatistics,
  IndexedDocument,
  IndexedField,
  RankedCandidate,
  SearchIndex,
} from './types';

function fieldValues(card: ThoughtCard, field: RetrievalField): string[] {
  switch (field) {
    case 'keywords':
    case 'aliases':
    case 'situations':
    case 'tensions':
      return card[field];
    case 'title':
    case 'principle':
    case 'explanation':
    case 'boundary':
      return [card[field]];
  }
}

function indexField(values: readonly string[], lexicon: readonly string[]): IndexedField {
  const tokens = values.flatMap((value) => tokenizeText(value, lexicon).tokens);
  const termFrequencies: Record<string, number> = {};
  for (const token of tokens) termFrequencies[token] = (termFrequencies[token] ?? 0) + 1;
  return { length: tokens.length, termFrequencies };
}

function calculateFieldStatistics(
  documents: readonly IndexedDocument[],
  field: RetrievalField,
): FieldStatistics {
  const documentFrequency: Record<string, number> = {};
  let totalLength = 0;

  for (const document of documents) {
    const indexedField = document.fields[field];
    totalLength += indexedField.length;
    for (const token of Object.keys(indexedField.termFrequencies)) {
      documentFrequency[token] = (documentFrequency[token] ?? 0) + 1;
    }
  }

  return {
    averageLength: documents.length === 0 ? 0 : totalLength / documents.length,
    documentFrequency,
  };
}

export function buildSearchIndex(
  cards: readonly ThoughtCard[],
  synonyms: SynonymCatalog,
): SearchIndex {
  const publishableCards = cards
    .filter((card) => card.status === 'approved' && card.rightsStatus !== 'unknown')
    .sort((left, right) => left.id.localeCompare(right.id));
  const lexicon = createLexicon(publishableCards, synonyms);
  const documents: IndexedDocument[] = publishableCards.map((card) => ({
    id: card.id,
    card,
    fields: Object.fromEntries(
      RETRIEVAL_FIELDS.map((field) => [
        field,
        indexField(fieldValues(card, field), lexicon),
      ]),
    ) as Record<RetrievalField, IndexedField>,
  }));
  const fieldStatistics = Object.fromEntries(
    RETRIEVAL_FIELDS.map((field) => [field, calculateFieldStatistics(documents, field)]),
  ) as Record<RetrievalField, FieldStatistics>;

  return {
    version: 1,
    cardCount: documents.length,
    config: {
      k1: BM25_CONFIG.k1,
      b: BM25_CONFIG.b,
      fieldWeights: { ...BM25_CONFIG.fieldWeights },
    },
    lexicon,
    synonyms,
    fieldStatistics,
    documents,
  };
}

function inverseDocumentFrequency(cardCount: number, documentFrequency: number): number {
  return Math.log(1 + (cardCount - documentFrequency + 0.5) / (documentFrequency + 0.5));
}

export function rankDocuments(
  index: SearchIndex,
  queryTokens: readonly string[],
): RankedCandidate[] {
  const uniqueQueryTokens = [...new Set(queryTokens)];
  const candidates: RankedCandidate[] = [];

  for (const document of index.documents) {
    let score = 0;
    const fieldHits: RankedCandidate['fieldHits'] = {};
    const matchedTokens = new Set<string>();

    for (const field of RETRIEVAL_FIELDS) {
      const indexedField = document.fields[field];
      const statistics = index.fieldStatistics[field];
      const averageLength = statistics.averageLength || 1;
      const hits: string[] = [];

      for (const token of uniqueQueryTokens) {
        const termFrequency = indexedField.termFrequencies[token] ?? 0;
        if (termFrequency === 0) continue;

        const documentFrequency = statistics.documentFrequency[token] ?? 0;
        const idf = inverseDocumentFrequency(index.cardCount, documentFrequency);
        const denominator =
          termFrequency +
          index.config.k1 *
            (1 - index.config.b + index.config.b * (indexedField.length / averageLength));
        const fieldScore =
          index.config.fieldWeights[field] *
          idf *
          ((termFrequency * (index.config.k1 + 1)) / denominator);

        score += fieldScore;
        hits.push(token);
        matchedTokens.add(token);
      }

      if (hits.length > 0) fieldHits[field] = hits;
    }

    if (score > 0) {
      candidates.push({
        card: document.card,
        score,
        fieldHits,
        matchedTokens: [...matchedTokens],
      });
    }
  }

  return candidates.sort(
    (left, right) =>
      right.score - left.score || left.card.id.localeCompare(right.card.id),
  );
}
