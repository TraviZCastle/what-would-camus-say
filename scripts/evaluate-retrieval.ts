import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { SynonymCatalogSchema, ThoughtCardCollectionSchema } from '../src/content/schema';
import { buildSearchIndex } from '../src/retrieval/bm25';
import { retrieveThoughtCards } from '../src/retrieval/retrieve';

type GoldItem = {
  id: string;
  query: string;
  expectedCardIds?: string[];
  expectNoResult?: boolean;
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath: string): Promise<unknown> {
  return JSON.parse(
    await readFile(path.join(projectRoot, relativePath), 'utf8'),
  ) as unknown;
}

const cards = ThoughtCardCollectionSchema.parse(
  await readJson('content/cards/seed-cards.json'),
);
const synonyms = SynonymCatalogSchema.parse(
  await readJson('content/synonyms/synonyms.json'),
);
const gold = (await readJson('evals/retrieval-gold.json')) as GoldItem[];
const index = buildSearchIndex(cards, synonyms);

let relevantTotal = 0;
let relevantTop3Hits = 0;
let noResultTotal = 0;
let noResultHits = 0;
const misses: string[] = [];

for (const item of gold) {
  const result = retrieveThoughtCards(index, item.query);
  const top3Ids = result.debug.ranking.slice(0, 3).map((candidate) => candidate.card.id);

  if (item.expectNoResult) {
    noResultTotal += 1;
    if (result.noResult) noResultHits += 1;
    else misses.push(`${item.id}: 应无结果，实际主卡片 ${result.mainCard?.id ?? 'none'}`);
    continue;
  }

  relevantTotal += 1;
  const expectedIds = item.expectedCardIds ?? [];
  if (expectedIds.some((id) => top3Ids.includes(id))) relevantTop3Hits += 1;
  else {
    misses.push(
      `${item.id}: 期望 ${expectedIds.join('|')}，Top 3 为 ${top3Ids.join('|') || 'none'}`,
    );
  }
}

const top3Recall = relevantTotal === 0 ? 0 : relevantTop3Hits / relevantTotal;
const noResultAccuracy = noResultTotal === 0 ? 1 : noResultHits / noResultTotal;

console.log(
  `检索评测：Top 3 召回率 ${(top3Recall * 100).toFixed(1)}% (${relevantTop3Hits}/${relevantTotal})；无结果准确率 ${(noResultAccuracy * 100).toFixed(1)}% (${noResultHits}/${noResultTotal})。`,
);

if (misses.length > 0) console.log(`未命中：\n${misses.join('\n')}`);

if (top3Recall < 0.8 || noResultAccuracy < 1) process.exit(1);
