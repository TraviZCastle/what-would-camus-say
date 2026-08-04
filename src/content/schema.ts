import { z } from 'zod';

export const THEME_IDS = [
  'meaning',
  'absurd',
  'work',
  'freedom',
  'revolt',
  'limits',
  'solidarity',
  'hope',
  'happiness',
  'mortality',
  'conscience',
  'action',
] as const;

export const ReviewStatusSchema = z.enum(['draft', 'review', 'approved', 'rejected']);
export const RightsStatusSchema = z.enum([
  'cleared',
  'public-domain',
  'licensed',
  'unknown',
]);
export const ThemeIdSchema = z.enum(THEME_IDS);
export const SafetyCategorySchema = z.enum([
  'self-harm',
  'violence',
  'minor-danger',
  'fraud-coercion',
  'medical-emergency',
  'professional-boundary',
]);

export const SourceRefSchema = z.strictObject({
  work: z.string().min(1),
  section: z.string().min(1).optional(),
  edition: z.string().min(1).optional(),
  language: z.string().min(2),
  sourceType: z.enum(['primary', 'scholarship', 'editorial']),
  locator: z.string().min(1).optional(),
  url: z.url().optional(),
});

const NonEmptyStringArraySchema = z.array(z.string().min(1)).min(1);

export const ThoughtCardSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  version: z.int().positive(),
  status: ReviewStatusSchema,
  title: z.string().min(2),
  theme: ThemeIdSchema,
  secondaryThemes: z.array(ThemeIdSchema),
  principle: z.string().min(20),
  explanation: z.string().min(20),
  boundary: z.string().min(20),
  tensions: NonEmptyStringArraySchema,
  counterMisreadings: NonEmptyStringArraySchema,
  keywords: NonEmptyStringArraySchema,
  aliases: NonEmptyStringArraySchema,
  situations: NonEmptyStringArraySchema,
  negativeSignals: z.array(z.string().min(1)),
  answerBlocks: z.strictObject({
    perspective: NonEmptyStringArraySchema,
    boundary: NonEmptyStringArraySchema,
    actions: NonEmptyStringArraySchema,
    reflectionQuestions: NonEmptyStringArraySchema,
  }),
  sources: z.array(SourceRefSchema).min(1),
  directQuoteIds: z.array(z.string().min(1)),
  rightsStatus: RightsStatusSchema,
  safetyTags: z.array(z.string().min(1)),
  reviewer: z.string().min(1),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewNotes: z.string().min(1),
});

export const ThoughtCardCollectionSchema = z.array(ThoughtCardSchema);

export const DirectQuoteSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: ReviewStatusSchema,
  text: z.string().min(1),
  originalText: z.string().min(1),
  language: z.string().min(2),
  source: SourceRefSchema,
  rightsStatus: RightsStatusSchema,
  reviewer: z.string().min(1),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const DirectQuoteCollectionSchema = z.array(DirectQuoteSchema);

export const SourceCatalogEntrySchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  work: z.string().min(1),
  author: z.string().min(1),
  language: z.string().min(2),
  sourceType: z.enum(['primary', 'scholarship', 'editorial']),
  url: z.url().optional(),
  usage: z.string().min(1),
  rightsNotes: z.string().min(1),
});

export const SourceCatalogSchema = z.array(SourceCatalogEntrySchema).min(1);

export const SynonymCatalogSchema = z.strictObject({
  version: z.int().positive(),
  status: ReviewStatusSchema,
  reviewer: z.string().min(1),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z
    .array(
      z.strictObject({
        term: z.string().min(1),
        expansions: NonEmptyStringArraySchema,
        themes: z.array(ThemeIdSchema).min(1),
      }),
    )
    .min(1),
});

export const SafetyRuleCatalogSchema = z.strictObject({
  version: z.int().positive(),
  status: ReviewStatusSchema,
  reviewer: z.string().min(1),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rules: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        category: SafetyCategorySchema,
        priority: z.int().min(1).max(100),
        signals: NonEmptyStringArraySchema,
        negativeSignals: z.array(z.string().min(1)),
        responseKey: z.string().min(1),
      }),
    )
    .min(1),
});

export const SafetyResponseCatalogSchema = z.strictObject({
  version: z.int().positive(),
  status: ReviewStatusSchema,
  reviewer: z.string().min(1),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  responses: z
    .array(
      z.strictObject({
        key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        category: SafetyCategorySchema,
        urgency: z.enum(['crisis', 'boundary']),
        title: z.string().min(1),
        acknowledgment: z.string().min(1),
        actions: NonEmptyStringArraySchema,
        closing: z.string().min(1),
      }),
    )
    .min(1),
});
