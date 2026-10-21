import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const SITE_CONTENT_KEYS = ['nav', 'common', 'hero', 'about', 'nutrition', 'products', 'benefits', 'faq', 'contact', 'footer'] as const;
export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

// Each section's shape differs (flat string maps, string arrays, [string,string]
// tuple arrays) so we store it as Mixed and let the admin content editor + the
// Dict type in src/i18n/dictionaries.ts be the source of truth for structure.
const SiteContentSchema = new Schema(
  {
    key: { type: String, enum: SITE_CONTENT_KEYS, required: true, unique: true },
    th: { type: Schema.Types.Mixed, required: true },
    en: { type: Schema.Types.Mixed, required: true },
    zh: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export type SiteContentDoc = InferSchemaType<typeof SiteContentSchema>;

export const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
