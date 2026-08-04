export const RETRIEVAL_FIELDS = [
  'keywords',
  'aliases',
  'title',
  'situations',
  'tensions',
  'principle',
  'explanation',
  'boundary',
] as const;

export type RetrievalField = (typeof RETRIEVAL_FIELDS)[number];

export const BM25_CONFIG = {
  k1: 1.2,
  b: 0.75,
  fieldWeights: {
    keywords: 4,
    aliases: 3.5,
    title: 3,
    situations: 2.5,
    tensions: 2,
    principle: 1.5,
    explanation: 1,
    boundary: 0.8,
  } satisfies Record<RetrievalField, number>,
} as const;

export const SELECTION_CONFIG = {
  topK: 8,
  maxAuxiliaryCards: 2,
  minimumScore: 3.5,
  minimumWeakFieldScore: 7.5,
  minimumWeakFieldMatches: 2,
  minimumAuxiliaryScoreRatio: 0.22,
  highConfidenceScore: 16,
} as const;

export const STRONG_RETRIEVAL_FIELDS = [
  'keywords',
  'aliases',
  'title',
  'situations',
] as const satisfies readonly RetrievalField[];
