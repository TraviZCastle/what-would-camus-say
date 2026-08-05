import type { SearchIndex } from './types';
import type { AppLanguage } from '../i18n/language';

const indexPromises: Partial<Record<AppLanguage, Promise<SearchIndex>>> = {};

export function loadSearchIndex(language: AppLanguage = 'zh'): Promise<SearchIndex> {
  indexPromises[language] ??= fetch(`/content/search-index.${language}.json`, {
    cache: 'force-cache',
    credentials: 'same-origin',
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Search index failed to load: ${response.status}`);
      }
      const value = (await response.json()) as Partial<SearchIndex>;
      if (value.version !== 1 || !Array.isArray(value.documents)) {
        throw new Error('Unsupported search index format');
      }
      return value as SearchIndex;
    })
    .catch((error: unknown) => {
      delete indexPromises[language];
      throw error;
    });

  return indexPromises[language];
}
