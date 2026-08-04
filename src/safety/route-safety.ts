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
    const hasNegativeSignal = rule.negativeSignals.some((signal) =>
      normalizedQuestion.includes(normalizeText(signal)),
    );
    if (hasNegativeSignal) continue;

    const matchedSignals = rule.signals.filter((signal) =>
      normalizedQuestion.includes(normalizeText(signal)),
    );
    if (matchedSignals.length === 0) continue;

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
