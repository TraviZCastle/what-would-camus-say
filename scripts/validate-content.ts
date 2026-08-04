import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  DirectQuoteCollectionSchema,
  SafetyRuleCatalogSchema,
  SourceCatalogSchema,
  SynonymCatalogSchema,
  THEME_IDS,
  ThoughtCardCollectionSchema,
} from '../src/content/schema';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isProduction = process.argv.includes('--production');

async function readJson(relativePath: string): Promise<unknown> {
  const absolutePath = path.join(projectRoot, relativePath);
  return JSON.parse(await readFile(absolutePath, 'utf8')) as unknown;
}

const cards = ThoughtCardCollectionSchema.parse(
  await readJson('content/cards/seed-cards.json'),
);
const quotes = DirectQuoteCollectionSchema.parse(
  await readJson('content/quotes/quotes.json'),
);
const sources = SourceCatalogSchema.parse(await readJson('content/sources/sources.json'));
const synonyms = SynonymCatalogSchema.parse(
  await readJson('content/synonyms/synonyms.json'),
);
SafetyRuleCatalogSchema.parse(await readJson('content/safety/rules.json'));

const errors: string[] = [];

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return [
    ...new Set(values.filter((value) => (seen.has(value) ? true : !seen.add(value)))),
  ];
}

const duplicateCardIds = findDuplicates(cards.map((card) => card.id));
const duplicateQuoteIds = findDuplicates(quotes.map((quote) => quote.id));
const duplicateSourceIds = findDuplicates(sources.map((source) => source.id));

for (const id of duplicateCardIds) errors.push(`重复思想卡片 ID：${id}`);
for (const id of duplicateQuoteIds) errors.push(`重复引文 ID：${id}`);
for (const id of duplicateSourceIds) errors.push(`重复来源 ID：${id}`);

const quoteIds = new Set(quotes.map((quote) => quote.id));
const catalogWorks = new Set(sources.map((source) => source.work));

for (const card of cards) {
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
  }

  if (synonyms.status !== 'approved') errors.push('同义词表尚未 approved');
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
  `内容校验通过：${cards.length} 张卡片（${cards.filter((card) => card.status === 'approved').length} approved，${cards.filter((card) => card.status === 'review').length} review），覆盖 ${new Set(cards.map((card) => card.theme)).size} 个主主题，${quotes.length} 条直接引文。`,
);
