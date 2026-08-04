import type { z } from 'zod';

import type {
  DirectQuoteSchema,
  RightsStatusSchema,
  SourceRefSchema,
  ThemeIdSchema,
  ThoughtCardSchema,
} from '../content/schema';

export type ThemeId = z.infer<typeof ThemeIdSchema>;
export type RightsStatus = z.infer<typeof RightsStatusSchema>;
export type SourceRef = z.infer<typeof SourceRefSchema>;
export type DirectQuote = z.infer<typeof DirectQuoteSchema>;
export type ThoughtCard = z.infer<typeof ThoughtCardSchema>;
