import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

const RetrievalGoldItemSchema = z
  .object({
    id: z.string().min(1),
    query: z.string().min(1),
    expectedCardIds: z.array(z.string().min(1)).min(1).optional(),
    expectNoResult: z.boolean().optional(),
  })
  .refine((item) => item.expectNoResult || item.expectedCardIds, {
    message: '每条检索金标必须提供 expectedCardIds 或 expectNoResult',
  });

export type RetrievalGoldItem = z.infer<typeof RetrievalGoldItemSchema>;

export async function loadRetrievalGold(
  projectRoot: string,
): Promise<RetrievalGoldItem[]> {
  const evalDirectory = path.join(projectRoot, 'evals');
  const filenames = (await readdir(evalDirectory))
    .filter(
      (filename) => filename.startsWith('retrieval') && filename.endsWith('gold.json'),
    )
    .sort();
  const collections = await Promise.all(
    filenames.map(async (filename) =>
      z
        .array(RetrievalGoldItemSchema)
        .parse(
          JSON.parse(
            await readFile(path.join(evalDirectory, filename), 'utf8'),
          ) as unknown,
        ),
    ),
  );
  return collections.flat();
}
