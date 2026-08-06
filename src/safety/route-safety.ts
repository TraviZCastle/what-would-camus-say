import safetyResponsesJson from '../../content/safety/responses.json';
import safetyRulesJson from '../../content/safety/rules.json';
import { SafetyResponseCatalogSchema, SafetyRuleCatalogSchema } from '../content/schema';
import { normalizeText } from '../retrieval/tokenizer';
import type { SafetyCategory, SafetyResponse } from '../types/content';

const safetyRules = SafetyRuleCatalogSchema.parse(safetyRulesJson);
const safetyResponses = SafetyResponseCatalogSchema.parse(safetyResponsesJson);

const responseByKey = new Map(
  safetyResponses.responses.map((response) => [response.key, response]),
);

const STRONG_SELF_HARM_SIGNALS = [
  '自杀计划',
  '准备跳楼',
  '准备割腕',
  '吞了很多药想死',
  '今晚就不活了',
  '打算轻生',
  '正在伤害自己',
  '写好了遗书',
  '从楼上跳下去',
  '用刀伤害自己',
  '马上要自杀',
  'i am going to kill myself',
  'i plan to end my life',
  'i am about to jump',
  'i took an overdose',
  'i am hurting myself now',
  'i wrote a suicide note',
] as const;

const ABSTRACT_SELF_HARM_PATTERNS = [
  /(?:加缪|西西弗|哲学|文学|小说|作品|论文|课程|概念|命题).{0,18}(?:自杀|想死|结束生命)/u,
  /(?:自杀|想死|结束生命).{0,18}(?:加缪|西西弗|哲学|文学|小说|作品|论文|课程|概念|命题)/u,
  /(?:camus|sisyphus|philosoph|literature|novel|essay|concept).{0,48}(?:suicide|want to die|kill myself)/u,
  /(?:suicide|want to die|kill myself).{0,48}(?:camus|sisyphus|philosoph|literature|novel|essay|concept)/u,
] as const;

const EXPLICIT_CURRENT_SELF_HARM_PATTERNS = [
  /(?:我现在|我已经|我正在|我真的|我认真|但我|可我).{0,8}(?:想自杀|不想活|想死|想自残|结束自己的生命)/u,
  /\bi\s+(?:now|already|currently|really|seriously|still)\s+(?:want to die|want to kill myself|am hurting myself|plan to end my life)\b/u,
] as const;

function includesSignal(question: string, signal: string): boolean {
  return question.includes(normalizeText(signal));
}

export type SafetyMatch = {
  ruleId: string;
  category: SafetyCategory;
  priority: number;
  responseKey: string;
  matchedSignals: string[];
  response: SafetyResponse;
};

export function routeSafety(question: string): SafetyMatch | null {
  const normalizedQuestion = normalizeText(question);
  const orderedRules = [...safetyRules.rules].sort(
    (left, right) => right.priority - left.priority,
  );

  for (const rule of orderedRules) {
    const matchedSignals = rule.signals.filter((signal) =>
      includesSignal(normalizedQuestion, signal),
    );
    if (matchedSignals.length === 0) continue;

    const hasNegativeSignal = rule.negativeSignals.some((signal) =>
      includesSignal(normalizedQuestion, signal),
    );

    if (rule.id === 'self-harm-immediate') {
      const hasStrongDangerSignal = STRONG_SELF_HARM_SIGNALS.some((signal) =>
        includesSignal(normalizedQuestion, signal),
      );
      const hasExplicitCurrentRisk = EXPLICIT_CURRENT_SELF_HARM_PATTERNS.some((pattern) =>
        pattern.test(normalizedQuestion),
      );
      const isAbstractDiscussion = ABSTRACT_SELF_HARM_PATTERNS.some((pattern) =>
        pattern.test(normalizedQuestion),
      );

      if (!hasStrongDangerSignal && !hasExplicitCurrentRisk) {
        if (hasNegativeSignal || isAbstractDiscussion) continue;
      }
    } else if (hasNegativeSignal) {
      continue;
    }

    const response = responseByKey.get(rule.responseKey);
    if (!response) throw new Error(`缺少安全回答文案：${rule.responseKey}`);

    return {
      ruleId: rule.id,
      category: rule.category,
      priority: rule.priority,
      responseKey: rule.responseKey,
      matchedSignals,
      response,
    };
  }

  return null;
}

export function getSafetyAssetStatus() {
  return {
    rules: safetyRules.status,
    responses: safetyResponses.status,
  } as const;
}
