import type { SynonymCatalog, ThoughtCard } from '../types/content';

const HAN_SEQUENCE = /^\p{Script=Han}+$/u;
const SEGMENT_PATTERN = /\p{Script=Han}+|[a-z0-9]+/gu;
const STOP_WORDS = new Set([
  '一个',
  '一些',
  '什么',
  '怎么',
  '怎样',
  '如何',
  '是否',
  '可以',
  '可能',
  '需要',
  '问题',
  '事情',
  '觉得',
  '现在',
  '自己',
  '已经',
  '还是',
  '因为',
  '所以',
  '但是',
  '如果',
  '这个',
  '那个',
]);

const WEAK_QUERY_TOKENS = new Set([
  '中的',
  '为什',
  '为什么',
  '应该',
  '该怎',
  '怎么做',
  '么做',
  '会不',
  '不会',
  '会不会',
  '是否',
  '可以',
  '怎样',
  '如何',
]);

export type TokenizationResult = {
  normalized: string;
  tokens: string[];
};

export function normalizeText(input: string): string {
  return input
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/[^\p{Script=Han}a-z0-9]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isWeakQueryToken(token: string): boolean {
  return WEAK_QUERY_TOKENS.has(token);
}

function isUsefulToken(token: string): boolean {
  return token.length > 0 && !STOP_WORDS.has(token);
}

function tokenizeHanSequence(sequence: string, lexicon: readonly string[]): string[] {
  const tokens: string[] = [];

  if (sequence.length >= 2 && sequence.length <= 12 && isUsefulToken(sequence)) {
    tokens.push(sequence);
  }

  for (const term of lexicon) {
    if (sequence.includes(term) && isUsefulToken(term)) tokens.push(term);
  }

  for (const size of [2, 3]) {
    if (sequence.length < size) continue;
    for (let index = 0; index <= sequence.length - size; index += 1) {
      const gram = sequence.slice(index, index + size);
      if (isUsefulToken(gram)) tokens.push(gram);
    }
  }

  return tokens;
}

export function tokenizeText(
  input: string,
  lexicon: readonly string[] = [],
): TokenizationResult {
  const normalized = normalizeText(input);
  const segments = normalized.match(SEGMENT_PATTERN) ?? [];
  const tokens: string[] = [];

  for (const segment of segments) {
    if (HAN_SEQUENCE.test(segment)) {
      tokens.push(...tokenizeHanSequence(segment, lexicon));
    } else if (isUsefulToken(segment)) {
      tokens.push(segment);
    }
  }

  return { normalized, tokens };
}

function addLexiconCandidate(target: Set<string>, value: string): void {
  const normalized = normalizeText(value);
  for (const segment of normalized.match(SEGMENT_PATTERN) ?? []) {
    if (HAN_SEQUENCE.test(segment) && segment.length >= 2 && segment.length <= 12) {
      target.add(segment);
    }
  }
}

export function createLexicon(
  cards: readonly ThoughtCard[],
  synonyms: SynonymCatalog,
): string[] {
  const terms = new Set<string>();

  for (const card of cards) {
    for (const value of [
      card.title,
      ...card.keywords,
      ...card.aliases,
      ...card.situations,
      ...card.tensions,
    ]) {
      addLexiconCandidate(terms, value);
    }
  }

  for (const entry of synonyms.entries) {
    addLexiconCandidate(terms, entry.term);
    for (const expansion of entry.expansions) addLexiconCandidate(terms, expansion);
  }

  return [...terms].sort(
    (left, right) => right.length - left.length || left.localeCompare(right),
  );
}
