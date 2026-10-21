import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const ADMIN_ROLES = ['owner', 'editor'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

const AdminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ADMIN_ROLES, required: true, default: 'editor' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema>;

export const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
