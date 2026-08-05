import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the approved black hero identity and automatic-language question panel', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('What would');
    expect(html).toContain('Camus say?');
    expect(html).toContain('It does not represent Camus');
    expect(html).toContain('What are you facing?');
    expect(html).toContain('Preparing the thought index');
    expect(html).toContain('/assets/camus-hero-v1.jpg');
    expect(html).toContain('Auto-detected: English');
    expect(html).not.toContain('type="button">中文</button>');
  });
});
