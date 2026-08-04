import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { ThoughtCardCollectionSchema } from '../src/content/schema';
import type { ThoughtCard } from '../src/types/content';

export async function loadThoughtCards(projectRoot: string): Promise<ThoughtCard[]> {
  const cardsDirectory = path.join(projectRoot, 'content/cards');
  const filenames = (await readdir(cardsDirectory))
    .filter((filename) => filename.endsWith('.json'))
    .sort();
  const collections = await Promise.all(
    filenames.map(async (filename) =>
      ThoughtCardCollectionSchema.parse(
        JSON.parse(
          await readFile(path.join(cardsDirectory, filename), 'utf8'),
        ) as unknown,
      ),
    ),
  );
  return collections.flat();
}
