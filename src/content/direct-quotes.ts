import quoteCatalogJson from '../../content/quotes/quotes.json';
import notebooks1935Json from '../../content/quotes/source-batches/notebooks-1935-1942.json';
import notebooks1942Json from '../../content/quotes/source-batches/notebooks-1942-1951.json';
import plagueJson from '../../content/quotes/source-batches/the-plague.json';
import strangerJson from '../../content/quotes/source-batches/the-stranger.json';
import type { AppLanguage } from '../i18n/language';
import type { DirectQuote, ThoughtCard } from '../types/content';
import { expandEnglishQuoteBatch } from './expand-quote-batch';
import { DirectQuoteCollectionSchema, EnglishDirectQuoteBatchSchema } from './schema';

const sourceBatches = [strangerJson, plagueJson, notebooks1935Json, notebooks1942Json]
  .map((batch) => EnglishDirectQuoteBatchSchema.parse(batch))
  .flatMap(expandEnglishQuoteBatch);

export const APPROVED_RESULT_QUOTES = [
  ...DirectQuoteCollectionSchema.parse(quoteCatalogJson),
  ...sourceBatches,
].filter(
  (quote) =>
    quote.status === 'approved' &&
    quote.rightsStatus !== 'unknown' &&
    quote.placements.includes('result'),
);

function stableHash(value: string): number {
  return Array.from(value).reduce(
    (hash, character) => (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0,
    0,
  );
}

function includesNormalized(haystack: string, needle: string): boolean {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

export function selectDirectQuote(card: ThoughtCard, question = ''): DirectQuote | null {
  const explicitQuotes = card.directQuoteIds
    .map((id) => APPROVED_RESULT_QUOTES.find((quote) => quote.id === id))
    .filter((quote): quote is DirectQuote => Boolean(quote));

  if (explicitQuotes.length > 0) {
    return explicitQuotes[stableHash(card.id) % explicitQuotes.length] ?? null;
  }

  const cardThemes = new Set([card.theme, ...card.secondaryThemes]);
  const cardContext = [
    card.title,
    card.principle,
    card.explanation,
    ...card.keywords,
    ...card.aliases,
    ...card.situations,
    ...card.tensions,
  ].join(' ');
  const ranked = APPROVED_RESULT_QUOTES.map((quote) => ({
    quote,
    score:
      quote.themes.reduce(
        (score, theme) =>
          score + (theme === card.theme ? 8 : cardThemes.has(theme) ? 3 : 0),
        0,
      ) +
      quote.keywords.reduce(
        (score, keyword) =>
          score +
          (includesNormalized(question, keyword) ? 6 : 0) +
          (includesNormalized(cardContext, keyword) ? 1 : 0),
        0,
      ),
  }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.quote.id.localeCompare(right.quote.id),
    );

  if (ranked.length === 0) return APPROVED_RESULT_QUOTES[0] ?? null;

  const bestScore = ranked[0]?.score ?? 0;
  const bestMatches = ranked.filter(({ score }) => score === bestScore);
  return (
    bestMatches[stableHash(`${card.id}|${question}`) % bestMatches.length]?.quote ?? null
  );
}

export function translateDirectQuote(quote: DirectQuote, language: AppLanguage): string {
  return quote.translations[language];
}
