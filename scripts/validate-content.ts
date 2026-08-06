import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  DirectQuoteCollectionSchema,
  EnglishDirectQuoteBatchSchema,
  SafetyResponseCatalogSchema,
  SafetyRuleCatalogSchema,
  SourceCatalogSchema,
  SynonymCatalogSchema,
  THEME_IDS,
} from '../src/content/schema';
import { expandEnglishQuoteBatch } from '../src/content/expand-quote-batch';
import { loadThoughtCards } from './load-thought-cards';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isProduction = process.argv.includes('--production');

async function readJson(relativePath: string): Promise<unknown> {
  const absolutePath = path.join(projectRoot, relativePath);
  return JSON.parse(await readFile(absolutePath, 'utf8')) as unknown;
}

const cards = await loadThoughtCards(projectRoot);
const quoteBatches = await Promise.all(
  [
    'content/quotes/source-batches/the-stranger.json',
    'content/quotes/source-batches/the-plague.json',
    'content/quotes/source-batches/notebooks-1935-1942.json',
    'content/quotes/source-batches/notebooks-1942-1951.json',
  ].map(async (relativePath) =>
    EnglishDirectQuoteBatchSchema.parse(await readJson(relativePath)),
  ),
);
const quotes = [
  ...DirectQuoteCollectionSchema.parse(await readJson('content/quotes/quotes.json')),
  ...quoteBatches.flatMap(expandEnglishQuoteBatch),
];
const sources = SourceCatalogSchema.parse(await readJson('content/sources/sources.json'));
const synonyms = SynonymCatalogSchema.parse(
  await readJson('content/synonyms/synonyms.json'),
);
const englishSynonyms = SynonymCatalogSchema.parse(
  await readJson('content/synonyms/synonyms.en.json'),
);
const safetyRules = SafetyRuleCatalogSchema.parse(
  await readJson('content/safety/rules.json'),
);
const safetyResponses = SafetyResponseCatalogSchema.parse(
  await readJson('content/safety/responses.json'),
);

const errors: string[] = [];
const uniqueSituations = new Set(cards.flatMap((card) => card.situations));

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return [
    ...new Set(values.filter((value) => (seen.has(value) ? true : !seen.add(value)))),
  ];
}

const duplicateCardIds = findDuplicates(cards.map((card) => card.id));
const duplicateCardTitles = findDuplicates(cards.map((card) => card.title));
const duplicateCardPrinciples = findDuplicates(cards.map((card) => card.principle));
const duplicatePerspectives = findDuplicates(
  cards.flatMap((card) => card.answerBlocks.perspective),
);
const duplicateActions = findDuplicates(
  cards.flatMap((card) => card.answerBlocks.actions),
);
const duplicateReflectionQuestions = findDuplicates(
  cards.flatMap((card) => card.answerBlocks.reflectionQuestions),
);
const duplicateQuoteIds = findDuplicates(quotes.map((quote) => quote.id));
const duplicateSourceIds = findDuplicates(sources.map((source) => source.id));
const duplicateSafetyRuleIds = findDuplicates(safetyRules.rules.map((rule) => rule.id));
const duplicateSafetyResponseKeys = findDuplicates(
  safetyResponses.responses.map((response) => response.key),
);

for (const id of duplicateCardIds) errors.push(`重复思想卡片 ID：${id}`);
for (const title of duplicateCardTitles) errors.push(`重复思想卡片标题：${title}`);
for (const principle of duplicateCardPrinciples)
  errors.push(`重复思想卡片原则：${principle}`);
for (const perspective of duplicatePerspectives)
  errors.push(`重复回答观点组件：${perspective}`);
for (const action of duplicateActions) errors.push(`重复回答行动组件：${action}`);
for (const question of duplicateReflectionQuestions)
  errors.push(`重复回答反问组件：${question}`);
for (const id of duplicateQuoteIds) errors.push(`重复引文 ID：${id}`);
for (const id of duplicateSourceIds) errors.push(`重复来源 ID：${id}`);
for (const id of duplicateSafetyRuleIds) errors.push(`重复安全规则 ID：${id}`);
for (const key of duplicateSafetyResponseKeys) errors.push(`重复安全回答 key：${key}`);

const responseByKey = new Map(
  safetyResponses.responses.map((response) => [response.key, response]),
);
for (const rule of safetyRules.rules) {
  const response = responseByKey.get(rule.responseKey);
  if (!response) {
    errors.push(`${rule.id} 引用了不存在的安全回答：${rule.responseKey}`);
  } else if (response.category !== rule.category) {
    errors.push(`${rule.id} 与安全回答 ${rule.responseKey} 的类别不一致`);
  }
}

const quoteIds = new Set(quotes.map((quote) => quote.id));
const catalogWorks = new Set(sources.map((source) => source.work));

for (const card of cards) {
  const searchableText = [
    card.principle,
    card.explanation,
    card.boundary,
    ...card.answerBlocks.perspective,
    ...card.answerBlocks.boundary,
    ...card.answerBlocks.actions,
    ...card.answerBlocks.reflectionQuestions,
  ].join('\n');
  for (const forbiddenPhrase of [
    '我是加缪',
    '加缪说过',
    '加缪一定会',
    '命中注定',
    '你必须',
  ]) {
    if (searchableText.includes(forbiddenPhrase))
      errors.push(`${card.id} 包含禁止表达：${forbiddenPhrase}`);
  }

  for (const quoteId of card.directQuoteIds) {
    if (!quoteIds.has(quoteId)) errors.push(`${card.id} 引用了不存在的引文：${quoteId}`);
  }

  for (const source of card.sources) {
    if (!catalogWorks.has(source.work)) {
      errors.push(`${card.id} 的作品未进入来源目录：${source.work}`);
    }
  }
}

if (isProduction) {
  if (cards.length < 300) errors.push(`生产卡片不足 300 张：当前 ${cards.length} 张`);
  if (uniqueSituations.size < 150)
    errors.push(`高频现实场景不足 150 个：当前 ${uniqueSituations.size} 个`);

  for (const theme of THEME_IDS) {
    const count = cards.filter(
      (card) => card.theme === theme || card.secondaryThemes.includes(theme),
    ).length;
    if (count < 15) errors.push(`主题 ${theme} 不足 15 张：当前 ${count} 张`);
  }

  for (const card of cards) {
    if (card.status !== 'approved') errors.push(`${card.id} 尚未 approved`);
    if (card.rightsStatus === 'unknown') errors.push(`${card.id} 的权利状态未知`);
  }

  for (const quote of quotes) {
    if (quote.status !== 'approved') errors.push(`${quote.id} 尚未 approved`);
    if (quote.rightsStatus === 'unknown') errors.push(`${quote.id} 的权利状态未知`);
    if (quote.placements.includes('result') && quote.sourceText.split(/\s+/u).length > 25)
      errors.push(`${quote.id} 的结果页短引文超过 25 个词`);
  }

  const resultQuoteCount = quotes.filter((quote) =>
    quote.placements.includes('result'),
  ).length;
  if (resultQuoteCount < 80)
    errors.push(`结果页直接引文不足 80 条：当前 ${resultQuoteCount} 条`);

  if (synonyms.status !== 'approved') errors.push('同义词表尚未 approved');
  if (englishSynonyms.status !== 'approved') errors.push('英文同义词表尚未 approved');
  if (safetyRules.status !== 'approved') errors.push('安全规则尚未 approved');
  if (safetyResponses.status !== 'approved') errors.push('安全回答文案尚未 approved');
} else {
  const coveredThemes = new Set(
    cards.flatMap((card) => [card.theme, ...card.secondaryThemes]),
  );
  if (cards.length < 20)
    errors.push(`Phase 1 种子卡片不足 20 张：当前 ${cards.length} 张`);
  if (coveredThemes.size < 6) {
    errors.push(`Phase 1 主题覆盖不足 6 个：当前 ${coveredThemes.size} 个`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `内容校验通过：${cards.length} 张卡片（${cards.filter((card) => card.status === 'approved').length} approved，${cards.filter((card) => card.status === 'review').length} review），覆盖 ${new Set(cards.map((card) => card.theme)).size} 个主主题、${uniqueSituations.size} 个现实场景，${quotes.length} 条直接引文。`,
);
