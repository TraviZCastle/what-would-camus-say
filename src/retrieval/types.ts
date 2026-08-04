import type { SynonymCatalog, ThemeId, ThoughtCard } from '../types/content';
import type { RetrievalField } from './config';

export type IndexedField = {
  length: number;
  termFrequencies: Record<string, number>;
};

export type FieldStatistics = {
  averageLength: number;
  documentFrequency: Record<string, number>;
};

export type IndexedDocument = {
  id: string;
  card: ThoughtCard;
  fields: Record<RetrievalField, IndexedField>;
};

export type SearchIndex = {
  version: 1;
  cardCount: number;
  config: {
    k1: number;
    b: number;
    fieldWeights: Record<RetrievalField, number>;
  };
  lexicon: string[];
  synonyms: SynonymCatalog;
  fieldStatistics: Record<RetrievalField, FieldStatistics>;
  documents: IndexedDocument[];
};

export type RankedCandidate = {
  card: ThoughtCard;
  score: number;
  fieldHits: Partial<Record<RetrievalField, string[]>>;
  matchedTokens: string[];
};

export type QueryDebug = {
  normalizedQuery: string;
  originalTokens: string[];
  expandedTokens: string[];
  matchedSynonymTerms: string[];
  ranking: RankedCandidate[];
};

export type RetrievalResult = {
  noResult: boolean;
  confidence: 'none' | 'medium' | 'high';
  mainCard: ThoughtCard | null;
  auxiliaryCards: ThoughtCard[];
  closestThemes: ThemeId[];
  debug: QueryDebug;
};
