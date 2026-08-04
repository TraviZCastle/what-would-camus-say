import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the product identity and transparency statement', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('What Would');
    expect(html).toContain('Camus Say?');
    expect(html).toContain('不代表加缪本人，也不是加缪原话');
    expect(html).toContain('你正在面对什么');
    expect(html).toContain('正在准备思想索引');
  });
});
