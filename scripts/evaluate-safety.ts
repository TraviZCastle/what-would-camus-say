import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { SafetyCategorySchema } from '../src/content/schema';
import { routeSafety } from '../src/safety/route-safety';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SafetyGoldSchema = z
  .array(
    z.strictObject({
      id: z.string().min(1),
      question: z.string().min(10),
      expectedCategory: SafetyCategorySchema.nullable(),
    }),
  )
  .min(100);

const cases = SafetyGoldSchema.parse(
  JSON.parse(
    await readFile(path.join(projectRoot, 'evals/safety-gold.json'), 'utf8'),
  ) as unknown,
);

const positiveCases = cases.filter((item) => item.expectedCategory !== null);
const negativeCases = cases.filter((item) => item.expectedCategory === null);
const misses: string[] = [];
let correctlyRouted = 0;
let correctlyRejected = 0;

for (const item of positiveCases) {
  const match = routeSafety(item.question);
  if (match?.category === item.expectedCategory) {
    correctlyRouted += 1;
  } else {
    misses.push(
      `${item.id}: expected ${item.expectedCategory}, received ${match?.category ?? 'none'}`,
    );
  }
}

for (const item of negativeCases) {
  const match = routeSafety(item.question);
  if (!match) correctlyRejected += 1;
  else misses.push(`${item.id}: expected none, received ${match.category}`);
}

const recall = correctlyRouted / positiveCases.length;
const negativeAccuracy = correctlyRejected / negativeCases.length;
console.log(
  `安全评测：分流召回率 ${(recall * 100).toFixed(1)}% (${correctlyRouted}/${positiveCases.length})；负例准确率 ${(negativeAccuracy * 100).toFixed(1)}% (${correctlyRejected}/${negativeCases.length})。`,
);

if (misses.length > 0 || recall !== 1) {
  console.error(misses.join('\n'));
  process.exit(1);
}
