import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ThoughtCardCollectionSchema, SynonymCatalogSchema } from '../src/content/schema';
import { buildSearchIndex } from '../src/retrieval/bm25';

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
const index = buildSearchIndex(cards, synonyms);
const outputDirectory = path.join(projectRoot, 'public/content');
const outputPath = path.join(outputDirectory, 'search-index.json');

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(index)}\n`);

console.log(`检索索引已生成：${index.cardCount} 张 approved 卡片。`);
