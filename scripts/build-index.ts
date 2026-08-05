import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SynonymCatalogSchema } from '../src/content/schema';
import { createEnglishThoughtCards } from '../src/i18n/english-content';
import { buildSearchIndex } from '../src/retrieval/bm25';
import { loadThoughtCards } from './load-thought-cards';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath: string): Promise<unknown> {
  return JSON.parse(
    await readFile(path.join(projectRoot, relativePath), 'utf8'),
  ) as unknown;
}

const cards = await loadThoughtCards(projectRoot);
const chineseSynonyms = SynonymCatalogSchema.parse(
  await readJson('content/synonyms/synonyms.json'),
);
const englishSynonyms = SynonymCatalogSchema.parse(
  await readJson('content/synonyms/synonyms.en.json'),
);
const chineseIndex = buildSearchIndex(cards, chineseSynonyms);
const englishIndex = buildSearchIndex(createEnglishThoughtCards(cards), englishSynonyms);
const outputDirectory = path.join(projectRoot, 'public/content');

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, 'search-index.zh.json'),
    `${JSON.stringify(chineseIndex)}\n`,
  ),
  writeFile(
    path.join(outputDirectory, 'search-index.en.json'),
    `${JSON.stringify(englishIndex)}\n`,
  ),
  // Keep the original path for existing development tooling and older cached clients.
  writeFile(
    path.join(outputDirectory, 'search-index.json'),
    `${JSON.stringify(chineseIndex)}\n`,
  ),
]);

console.log(
  `双语检索索引已生成：中文 ${chineseIndex.cardCount} 张，英文 ${englishIndex.cardCount} 张 approved 卡片。`,
);
