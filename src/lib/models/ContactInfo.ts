import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const ContactInfoSchema = new Schema(
  {
    _id: { type: String, default: 'contact' },
    lineUrl: { type: String, default: null },
    facebookUrl: { type: String, default: null },
    phone: { type: String, default: null },
    lineQrImage: { type: String, default: null },
  },
  { timestamps: true },
);

export type ContactInfoDoc = InferSchemaType<typeof ContactInfoSchema>;

export const ContactInfo = mongoose.models.ContactInfo || mongoose.model('ContactInfo', ContactInfoSchema);
