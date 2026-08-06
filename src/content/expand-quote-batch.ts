import type { DirectQuote, EnglishDirectQuoteBatch } from '../types/content';

export function expandEnglishQuoteBatch(batch: EnglishDirectQuoteBatch): DirectQuote[] {
  return batch.entries.map((entry) => ({
    id: entry.id,
    status: batch.status,
    sourceText: entry.sourceText,
    sourceLanguage: 'en',
    translations: {
      en: entry.sourceText,
      zh: entry.translationZh,
    },
    themes: entry.themes,
    keywords: entry.keywords,
    placements: ['result'],
    source: batch.source,
    rightsStatus: batch.rightsStatus,
    reviewer: batch.reviewer,
    reviewedAt: batch.reviewedAt,
  }));
}
