import { describe, expect, it } from 'vitest';

import { loadThoughtCards } from '../../scripts/load-thought-cards';
import {
  APPROVED_RESULT_QUOTES,
  selectDirectQuote,
  translateDirectQuote,
} from '../../src/content/direct-quotes';
import { THEME_IDS } from '../../src/content/schema';

describe('direct quote selection', () => {
  it('selects a reviewed result quote relevant to every primary theme', async () => {
    const cards = await loadThoughtCards(process.cwd());

    for (const theme of THEME_IDS) {
      const card = cards.find((candidate) => candidate.theme === theme);
      expect(card, theme).toBeDefined();

      const quote = selectDirectQuote(card!);
      expect(quote, theme).not.toBeNull();
      expect(quote?.placements).toContain('result');
      expect(
        quote?.themes.some((quoteTheme) =>
          [card!.theme, ...card!.secondaryThemes].includes(quoteTheme),
        ),
      ).toBe(true);
    }
  });

  it('localizes the quotation while preserving its reviewed source text', async () => {
    const [card] = await loadThoughtCards(process.cwd());
    const quote = selectDirectQuote(card!);

    expect(translateDirectQuote(quote!, 'en')).toBe(quote?.translations.en);
    expect(translateDirectQuote(quote!, 'zh')).toBe(quote?.translations.zh);
    expect(quote?.sourceText).toBeTruthy();
    expect(APPROVED_RESULT_QUOTES).toHaveLength(80);
  });
});
