/**
 * One-time (safe to re-run) seed: copies the site's current hardcoded
 * products + text + contact info into MongoDB, and makes sure at least one
 * owner admin account exists. Run with: npm run seed
 */
import { config } from 'dotenv';
import path from 'node:path';
import { copyFile, mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

config({ path: path.resolve(process.cwd(), '.env.local') });

import { dictionaries, type Lang } from '../src/i18n/dictionaries';
import { SiteContent, SITE_CONTENT_KEYS } from '../src/lib/models/SiteContent';
import { Product } from '../src/lib/models/Product';
import { ContactInfo } from '../src/lib/models/ContactInfo';
import { AdminUser } from '../src/lib/models/AdminUser';

const LANGS: Lang[] = ['th', 'en', 'zh'];

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set — check .env.local');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'petebird' });
  console.log('[seed] connected to MongoDB');
}

async function seedSiteContent() {
  let created = 0;
  let skipped = 0;
  for (const key of SITE_CONTENT_KEYS) {
    const exists = await SiteContent.findOne({ key });
    if (exists) {
      skipped++;
      continue;
    }
    const doc: Record<Lang, unknown> = { th: undefined, en: undefined, zh: undefined };
    for (const lang of LANGS) {
      const dict = dictionaries[lang] as unknown as Record<string, unknown>;
      const section = dict[key];
      if (key === 'products' && section && typeof section === 'object') {
        const { items: _items, ...rest } = section as Record<string, unknown>;
        doc[lang] = rest;
      } else {
        doc[lang] = section;
      }
    }
    await SiteContent.create({ key, ...doc });
    created++;
  }
  console.log(`[seed] site content: ${created} created, ${skipped} already existed`);
}

async function copyProductImage(filename: string): Promise<string> {
  const destDir = path.resolve(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(destDir, { recursive: true });
  const src = path.resolve(process.cwd(), 'src', 'assets', filename);
  const dest = path.join(destDir, filename);
  await copyFile(src, dest);
  return `/uploads/products/${filename}`;
}

async function seedProducts() {
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`[seed] products: ${existing} already exist, skipping`);
    return;
  }

  const image01 = await copyProductImage('product1.png');
  const image02 = await copyProductImage('product2.png');

  const defs = [
    { slug: '01', order: 1, badge: 'SIGNATURE COLLECTION', price: 5000, image: image01 },
    { slug: '02', order: 2, badge: 'THE GIFT COLLECTION', price: 2500, image: image02 },
    { slug: '03', order: 3, badge: 'PREMIUM SELECTION', price: 3500, image: '/product/3500.png' },
    { slug: '04', order: 4, badge: 'PREMIUM SELECTION', price: 7000, image: '/product/7000.png' },
  ];

  for (const def of defs) {
    const translations: Record<Lang, unknown> = { th: undefined, en: undefined, zh: undefined };
    for (const lang of LANGS) {
      translations[lang] = dictionaries[lang].products.items[def.slug as keyof typeof dictionaries.th.products.items];
    }
    await Product.create({ ...def, isPublished: true, translations });
  }
  console.log(`[seed] products: created ${defs.length}`);
}

const DEFAULT_LINE_URL = 'https://lin.ee/qPH5LVG';

async function seedContactInfo() {
  const existing = await ContactInfo.findById('contact');
  if (existing) {
    // Never overwrite what the admin saved; only fill in a missing LINE link.
    if (!existing.lineUrl) {
      existing.lineUrl = process.env.NEXT_PUBLIC_LINE_URL || DEFAULT_LINE_URL;
      await existing.save();
      console.log('[seed] contact info: filled in missing LINE url');
    } else {
      console.log('[seed] contact info already exists, skipping');
    }
    return;
  }
  await ContactInfo.create({
    _id: 'contact',
    lineUrl: process.env.NEXT_PUBLIC_LINE_URL || DEFAULT_LINE_URL,
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || null,
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || null,
    lineQrImage: null,
  });
  console.log('[seed] contact info: created (fill in via /admin/contact if left blank)');
}

async function seedOwner() {
  const existingOwner = await AdminUser.findOne({ role: 'owner' });
  if (existingOwner) {
    console.log(`[seed] owner already exists: ${existingOwner.email}`);
    return;
  }

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@petebird.local').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 12);

  await AdminUser.create({ name: 'Admin', email, role: 'owner', isActive: true, passwordHash });

  console.log('\n[seed] created first owner account:');
  console.log(`  email:    ${email}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`  password: ${password}  (generated — save this now, it is not shown again)`);
  } else {
    console.log('  password: (from SEED_ADMIN_PASSWORD env var)');
  }
  console.log('  Change the password after first login via /admin/users.\n');
}

async function main() {
  await connect();
  await seedSiteContent();
  await seedProducts();
  await seedContactInfo();
  await seedOwner();
  await mongoose.disconnect();
  console.log('[seed] done');
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
