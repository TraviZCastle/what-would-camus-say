export type AppLanguage = 'zh' | 'en';

export function detectQuestionLanguage(
  value: string,
  fallback: AppLanguage,
): AppLanguage {
  const hanCount = value.match(/\p{Script=Han}/gu)?.length ?? 0;
  const latinCount = value.match(/[a-z]/giu)?.length ?? 0;

  if (hanCount >= 2 && hanCount * 3 >= latinCount) return 'zh';
  if (latinCount >= 4 && latinCount > hanCount * 3) return 'en';
  return fallback;
}

export function applyDocumentLanguage(language: AppLanguage): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';

  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) {
    description.content =
      language === 'zh'
        ? '从加缪思想出发，重新审视现实困境的本地双语网页工具。'
        : "A private, bilingual thought exercise grounded in Albert Camus's works.";
  }
}
