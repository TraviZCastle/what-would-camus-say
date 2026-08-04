import type { z } from 'zod';

import type {
  DirectQuoteSchema,
  RightsStatusSchema,
  SafetyResponseCatalogSchema,
  SafetyRuleCatalogSchema,
  SourceRefSchema,
  SynonymCatalogSchema,
  ThemeIdSchema,
  ThoughtCardSchema,
} from '../content/schema';

export type ThemeId = z.infer<typeof ThemeIdSchema>;
export type RightsStatus = z.infer<typeof RightsStatusSchema>;
export type SourceRef = z.infer<typeof SourceRefSchema>;
export type DirectQuote = z.infer<typeof DirectQuoteSchema>;
export type ThoughtCard = z.infer<typeof ThoughtCardSchema>;
export type SynonymCatalog = z.infer<typeof SynonymCatalogSchema>;
export type SafetyRuleCatalog = z.infer<typeof SafetyRuleCatalogSchema>;
export type SafetyResponseCatalog = z.infer<typeof SafetyResponseCatalogSchema>;
export type SafetyCategory = SafetyRuleCatalog['rules'][number]['category'];
export type SafetyResponse = SafetyResponseCatalog['responses'][number];
