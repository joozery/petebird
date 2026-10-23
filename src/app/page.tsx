import productOne from '@/assets/product1.png';
import productTwo from '@/assets/product2.png';
import premiumBox from '../../public/product/3500.png';
import premiumRound from '../../public/product/7000.png';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { SiteContent, SITE_CONTENT_KEYS, type SiteContentKey } from '@/lib/models/SiteContent';
import { ContactInfo } from '@/lib/models/ContactInfo';
import { dictionaries, type Dict, type Lang } from '@/i18n/dictionaries';
import type { ContactInfo as ContactData } from '@/i18n/LanguageProvider';
import { HomeClient, type ProductData } from './HomeClient';

const LANGS: Lang[] = ['th', 'en', 'zh'];

// Revalidate periodically so the page stays fresh even if an admin save's
// on-demand revalidatePath('/') call is ever missed; saves themselves refresh
// it immediately (see the admin API routes under src/app/api/admin).
export const revalidate = 60;

// Shown only if the database has no products yet (e.g. before `npm run seed`
// has been run) or the database is unreachable — the page must never go
// blank just because MongoDB is down.
const FALLBACK_PRODUCTS: ProductData[] = [
  { slug: '01', price: 5000, image: productOne.src, badge: 'SIGNATURE COLLECTION', translations: { th: dictionaries.th.products.items['01'], en: dictionaries.en.products.items['01'], zh: dictionaries.zh.products.items['01'] } },
  { slug: '02', price: 2500, image: productTwo.src, badge: 'THE GIFT COLLECTION', translations: { th: dictionaries.th.products.items['02'], en: dictionaries.en.products.items['02'], zh: dictionaries.zh.products.items['02'] } },
  { slug: '03', price: 3500, image: premiumBox.src, badge: 'PREMIUM SELECTION', translations: { th: dictionaries.th.products.items['03'], en: dictionaries.en.products.items['03'], zh: dictionaries.zh.products.items['03'] } },
  { slug: '04', price: 7000, image: premiumRound.src, badge: 'PREMIUM SELECTION', translations: { th: dictionaries.th.products.items['04'], en: dictionaries.en.products.items['04'], zh: dictionaries.zh.products.items['04'] } },
];

type RawProduct = { slug: string; price: number | null; image: string; badge: string; order: number; translations: Record<Lang, ProductData['translations']['th']> };
type RawContent = { key: SiteContentKey; th: unknown; en: unknown; zh: unknown };
type RawContact = { lineUrl?: string | null; facebookUrl?: string | null; phone?: string | null; lineQrImage?: string | null };

async function loadFromDB(): Promise<{ products: RawProduct[]; content: RawContent[]; contact: RawContact | null }> {
  try {
    await connectDB();
    const [products, content, contact] = await Promise.all([
      Product.find({ isPublished: true }).sort({ order: 1 }).lean<RawProduct[]>(),
      SiteContent.find().lean<RawContent[]>(),
      ContactInfo.findById('contact').lean<RawContact | null>(),
    ]);
    return { products, content, contact };
  } catch (err) {
    console.error('[home] MongoDB unavailable, serving built-in fallback content:', err);
    return { products: [], content: [], contact: null };
  }
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

function buildDicts(content: RawContent[]): Record<Lang, Dict> {
  const overrides = new Map(content.map((doc) => [doc.key, doc]));
  const result = {} as Record<Lang, Dict>;
  for (const lang of LANGS) {
    const base = dictionaries[lang];
    const merged = { ...base } as Record<string, unknown>;
    for (const key of SITE_CONTENT_KEYS) {
      const doc = overrides.get(key);
      if (!doc) continue;
      const value = doc[lang];
      // Object sections are layered over the built-in copy so fields added to
      // the dictionaries after a section was saved (e.g. nutrition posters)
      // still get their defaults. This also keeps the static `products.items`,
      // which SiteContent never holds (they live on the Product documents).
      merged[key] = isPlainObject(base[key]) && isPlainObject(value) ? { ...base[key], ...value } : value;
    }
    result[lang] = merged as Dict;
  }
  return result;
}

function buildProducts(products: RawProduct[]): ProductData[] {
  if (products.length === 0) return FALLBACK_PRODUCTS;
  return products.map((p) => ({ slug: p.slug, price: p.price, image: p.image, badge: p.badge, translations: p.translations }));
}

export default async function Page() {
  const { products, content, contact } = await loadFromDB();

  const dicts = buildDicts(content);
  const productData = buildProducts(products);
  const contactData: ContactData = {
    lineUrl: contact?.lineUrl || process.env.NEXT_PUBLIC_LINE_URL || null,
    facebookUrl: contact?.facebookUrl || process.env.NEXT_PUBLIC_FACEBOOK_URL || null,
    phone: contact?.phone || process.env.NEXT_PUBLIC_CONTACT_PHONE || null,
    lineQrImage: contact?.lineQrImage || null,
  };

  return <HomeClient dicts={dicts} products={productData} contact={contactData} />;
}
