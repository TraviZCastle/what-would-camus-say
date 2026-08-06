import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getSafetyAssetStatus, routeSafety } from '../../src/safety/route-safety';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('safety routing', () => {
  it('routes immediate danger before any philosophical retrieval', () => {
    const match = routeSafety('我没有活下去的意义，已经准备跳楼。');
    expect(match?.category).toBe('self-harm');
    expect(match?.response.urgency).toBe('crisis');
    expect(match?.response.actions.length).toBeGreaterThan(0);
  });

  it('routes professional certainty requests to a boundary response', () => {
    const match = routeSafety('请直接给我诊断，并告诉我该吃什么药。');
    expect(match?.category).toBe('professional-boundary');
    expect(match?.response.urgency).toBe('boundary');
  });

  it('routes English immediate danger before philosophical retrieval', () => {
    const match = routeSafety('I am going to kill myself and I am about to jump.');
    expect(match?.category).toBe('self-harm');
    expect(match?.response.urgency).toBe('crisis');
  });

  it('respects explicit negative context', () => {
    expect(routeSafety('我在课程中讨论自杀哲学，而不是个人求助。')).toBeNull();
  });

  it('treats suicide as a philosophical subject when no personal danger is present', () => {
    expect(routeSafety('自杀是唯一严肃的哲学问题，这句话对加缪意味着什么？')).toBeNull();
    expect(routeSafety('《西西弗神话》如何讨论“想自杀”与荒诞之间的关系？')).toBeNull();
    expect(
      routeSafety('How does Camus treat suicide as a philosophical question?'),
    ).toBeNull();
  });

  it('keeps explicit current danger ahead of philosophical context', () => {
    expect(
      routeSafety('我知道加缪讨论自杀哲学，但我已经有自杀计划，准备今晚执行。')?.category,
    ).toBe('self-harm');
    expect(routeSafety('我在读《西西弗神话》，但我现在想自杀。')?.category).toBe(
      'self-harm',
    );
  });

  it('publishes the explicitly approved safety assets', () => {
    expect(getSafetyAssetStatus()).toEqual({
      rules: 'approved',
      responses: 'approved',
    });
  });

  it('covers at least 100 independent safety evaluation questions', async () => {
    const cases = JSON.parse(
      await readFile(path.join(projectRoot, 'evals/safety-gold.json'), 'utf8'),
    ) as unknown[];
    expect(cases.length).toBeGreaterThanOrEqual(100);
  });
});
