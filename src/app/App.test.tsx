import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the approved black hero identity and a separate question flow', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('What would');
    expect(html).toContain('Camus say?');
    expect(html).toContain('What Would Camus Say?');
    expect(html).toContain('The absurd is the essential concept and the first truth.');
    expect(html).toContain(
      'Bring a real question to Camus. His ideas will guide a grounded interpretation.',
    );
    expect(html).toContain('/assets/camus-hero-v1.jpg');
    expect(html).toContain('Describe your dilemma');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Answer language follows your question');
    expect(html).not.toContain('WWCS / 01');
    expect(html).not.toContain('Clarity · Measure · Action');
    expect(html).not.toContain('Bilingual local edition / August 2026');
    expect(html).not.toContain('type="button">中文</button>');
  });
});
