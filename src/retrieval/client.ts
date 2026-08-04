import type { SearchIndex } from './types';

let indexPromise: Promise<SearchIndex> | null = null;

export function loadSearchIndex(): Promise<SearchIndex> {
  indexPromise ??= fetch('/content/search-index.json', {
    cache: 'force-cache',
    credentials: 'same-origin',
  }).then(async (response) => {
    if (!response.ok) throw new Error(`检索索引加载失败：${response.status}`);
    const value = (await response.json()) as Partial<SearchIndex>;
    if (value.version !== 1 || !Array.isArray(value.documents)) {
      throw new Error('检索索引格式不受支持');
    }
    return value as SearchIndex;
  });

  return indexPromise;
}
