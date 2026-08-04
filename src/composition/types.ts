import type { SourceRef } from '../types/content';

export type AnswerSectionKind =
  'dilemma' | 'perspective' | 'boundary' | 'action' | 'reflection';

export type AnswerTrace = {
  cardId: string;
  fields: string[];
};

export type AnswerSection = {
  kind: AnswerSectionKind;
  label: string;
  text: string;
  traces: AnswerTrace[];
};

export type AnswerSource = SourceRef & {
  cardId: string;
};

export type ComposedAnswer = {
  sections: AnswerSection[];
  sources: AnswerSource[];
  usedCardIds: string[];
  characterCount: number;
};
