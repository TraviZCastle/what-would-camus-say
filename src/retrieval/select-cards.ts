import type { ThemeId, ThoughtCard } from '../types/content';
import { SELECTION_CONFIG, STRONG_RETRIEVAL_FIELDS, type RetrievalField } from './config';
import type { RankedCandidate } from './types';
import { isWeakQueryToken } from './tokenizer';

export type SelectedCards = {
  noResult: boolean;
  mainCard: ThoughtCard | null;
  auxiliaryCards: ThoughtCard[];
  closestThemes: ThemeId[];
  confidence: 'none' | 'medium' | 'high';
};

function uniqueThemes(candidates: readonly RankedCandidate[]): ThemeId[] {
  const themes: ThemeId[] = [];
  for (const candidate of candidates) {
    if (!themes.includes(candidate.card.theme)) themes.push(candidate.card.theme);
    if (themes.length === 3) break;
  }
  return themes;
}

function strongFieldHits(candidate: RankedCandidate): number {
  return STRONG_RETRIEVAL_FIELDS.reduce(
    (total, field) => total + (candidate.fieldHits[field]?.length ?? 0),
    0,
  );
}

function allFieldHits(candidate: RankedCandidate): number {
  return Object.values(candidate.fieldHits).reduce(
    (total, hits) => total + (hits?.length ?? 0),
    0,
  );
}

function isLowConfidence(candidate: RankedCandidate | undefined): boolean {
  if (!candidate || candidate.score < SELECTION_CONFIG.minimumScore) return true;
  if (!candidate.matchedTokens.some((token) => !isWeakQueryToken(token))) return true;
  if (strongFieldHits(candidate) > 0) return false;
  return (
    candidate.score < SELECTION_CONFIG.minimumWeakFieldScore ||
    allFieldHits(candidate) < SELECTION_CONFIG.minimumWeakFieldMatches
  );
}

function sharesNewDimension(
  candidate: ThoughtCard,
  selected: readonly ThoughtCard[],
): boolean {
  const selectedThemes = new Set(
    selected.flatMap((card) => [card.theme, ...card.secondaryThemes]),
  );
  if (!selectedThemes.has(candidate.theme)) return true;

  const selectedTensions = new Set(selected.flatMap((card) => card.tensions));
  return candidate.tensions.some((tension) => !selectedTensions.has(tension));
}

export function selectCards(candidates: readonly RankedCandidate[]): SelectedCards {
  const topCandidates = candidates.slice(0, SELECTION_CONFIG.topK);
  const mainCandidate = topCandidates[0];
  const closestThemes = uniqueThemes(topCandidates);

  if (isLowConfidence(mainCandidate)) {
    return {
      noResult: true,
      mainCard: null,
      auxiliaryCards: [],
      closestThemes,
      confidence: 'none',
    };
  }

  const selected = [mainCandidate.card];
  const auxiliaryCards: ThoughtCard[] = [];
  const minimumAuxiliaryScore =
    mainCandidate.score * SELECTION_CONFIG.minimumAuxiliaryScoreRatio;

  for (const candidate of topCandidates.slice(1)) {
    if (auxiliaryCards.length >= SELECTION_CONFIG.maxAuxiliaryCards) break;
    if (candidate.score < minimumAuxiliaryScore) continue;
    if (!sharesNewDimension(candidate.card, selected)) continue;
    auxiliaryCards.push(candidate.card);
    selected.push(candidate.card);
  }

  return {
    noResult: false,
    mainCard: mainCandidate.card,
    auxiliaryCards,
    closestThemes,
    confidence:
      mainCandidate.score >= SELECTION_CONFIG.highConfidenceScore ? 'high' : 'medium',
  };
}

export function matchedFields(candidate: RankedCandidate): RetrievalField[] {
  return Object.keys(candidate.fieldHits) as RetrievalField[];
}
