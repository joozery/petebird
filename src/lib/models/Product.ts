import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const TranslationSchema = new Schema(
  {
    name: { type: String, required: true },
    alt: { type: String, required: true },
    type: { type: String, required: true },
    unit: { type: String, required: true },
    description: { type: String, required: true },
    detail: { type: String, required: true },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    badge: { type: String, required: true },
    price: { type: Number, default: null },
    image: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    translations: {
      th: { type: TranslationSchema, required: true },
      en: { type: TranslationSchema, required: true },
      zh: { type: TranslationSchema, required: true },
    },
  },
  { timestamps: true },
);

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
