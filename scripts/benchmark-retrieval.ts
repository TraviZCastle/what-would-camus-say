import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { retrieveThoughtCards } from '../src/retrieval/retrieve';
import type { SearchIndex } from '../src/retrieval/types';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EvaluationSchema = z.array(
  z.object({
    query: z.string().min(1),
  }),
);
const index = JSON.parse(
  await readFile(path.join(projectRoot, 'public/content/search-index.json'), 'utf8'),
) as SearchIndex;
const questions = EvaluationSchema.parse(
  JSON.parse(
    await readFile(path.join(projectRoot, 'evals/retrieval-gold.json'), 'utf8'),
  ) as unknown,
).map((item) => item.query);

for (const question of questions) retrieveThoughtCards(index, question);

const durations: number[] = [];
for (let repetition = 0; repetition < 20; repetition += 1) {
  for (const question of questions) {
    const startedAt = performance.now();
    retrieveThoughtCards(index, question);
    durations.push(performance.now() - startedAt);
  }
}

durations.sort((left, right) => left - right);
const percentile95 = durations[Math.floor(durations.length * 0.95)] ?? Infinity;
const maximum = durations.at(-1) ?? Infinity;
console.log(
  `检索性能：${durations.length} 次，p95 ${percentile95.toFixed(2)}ms，最大 ${maximum.toFixed(2)}ms。`,
);

if (percentile95 >= 200) process.exit(1);
