'use client';

import Image from 'next/image';
import coverHero from '@/assets/cover/coverhero.png';
import aboutBackground from '@/assets/cover/about-reference.png';
import defaultLineQr from '@/assets/cover/qrcodeline.png';
import logo from '../../public/logolong.png';
import { Accordion, Dialog } from 'radix-ui';
import { ArrowRight, Menu, X, Leaf, ShieldCheck, Gem, Phone, MessageCircle, ArrowUpRight, Plus, Truck, Heart, MoonStar, Flower2, Dumbbell, FlaskConical, Sparkles } from 'lucide-react';
import { LanguageProvider, useLanguage, type ContactInfo } from '@/i18n/LanguageProvider';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import type { Dict, Lang } from '@/i18n/dictionaries';

const navHrefs = ['#home', '#about', '#nutrition', '#products', '#benefits', '#contact'];

export type ProductTranslation = { name: string; alt: string; type: string; unit: string; description: string; detail: string };
export type ProductData = {
  slug: string;
  price: number | null;
  image: string;
  badge: string;
  translations: Record<Lang, ProductTranslation>;
};

const heroIcons = [Leaf, ShieldCheck, Gem, Truck];
const benefitIcons = [ShieldCheck, Flower2, MoonStar, Heart];
const nutritionIcons = [Dumbbell, FlaskConical, Sparkles];

function Photo({ box, className = '', label }: { box: [number, number, number, number]; className?: string; label: string }) {
  const [x, y, w, h] = box;
  return <div className={`photo ${className}`} role="img" aria-label={label} style={{ aspectRatio: `${w}/${h}` }}><img src="/images/pete-reference.png" alt="" draggable={false} style={{ width: `${1024 / w * 100}%`, maxWidth: 'none', left: `${-x / w * 100}%`, top: `${-y / h * 100}%` }}/></div>;
}
function LineIcon() { return <span className="line-icon">LINE</span>; }
function Contact({ children, className = 'gold-button' }: { children?: React.ReactNode; className?: string }) {
  const { t, contact } = useLanguage();
  const aria = className === 'product-contact' ? t.common.enquireAria : undefined;
  return contact.lineUrl ? <a className={className} aria-label={aria} href={contact.lineUrl} target="_blank" rel="noopener noreferrer"><LineIcon/>{children || t.common.enquire}</a> : <Dialog.Root><Dialog.Trigger className={className} aria-label={aria}><LineIcon/>{children || t.common.enquire}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label={t.common.close}><X/></Dialog.Close><MessageCircle className="text-gold" size={34}/><Dialog.Title className="mt-4 text-2xl font-semibold">{t.common.enquireTitle}</Dialog.Title><Dialog.Description className="mt-4 leading-7 text-muted">{t.common.lineSetup}</Dialog.Description><Dialog.Close className="gold-button mt-6">{t.common.gotIt}</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
function FloatingSocial() {
 const { t, contact } = useLanguage();
 const channels = [
  { id: 'line', name: 'LINE', label: t.common.chatLine, href: contact.lineUrl, icon: '/icons/line.svg' },
  { id: 'facebook', name: 'Facebook', label: t.common.followFacebook, href: contact.facebookUrl, icon: '/icons/facebook.svg' },
  { id: 'phone', name: t.common.phoneName, label: contact.phone ? `${t.common.callPrefix} ${contact.phone}` : t.common.callUs, href: contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, '')}` : undefined, icon: null },
 ];
 return <aside className="floating-social" aria-label={t.common.channels}>{channels.map(channel => {
  const content = <><span className="social-tooltip" aria-hidden="true">{channel.label}</span>{channel.icon ? <Image src={channel.icon} width={28} height={28} alt=""/> : <Phone size={23} strokeWidth={1.8}/>}</>;
  return channel.href ? <a key={channel.id} className={`social-float social-${channel.id}`} href={channel.href} aria-label={channel.label} target={channel.id === 'phone' ? undefined : '_blank'} rel={channel.id === 'phone' ? undefined : 'noopener noreferrer'}>{content}</a> : <Dialog.Root key={channel.id}><Dialog.Trigger className={`social-float social-${channel.id}`} aria-label={channel.label}>{content}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label={t.common.close}><X/></Dialog.Close><Dialog.Title className="text-2xl">{t.common.contactVia} {channel.name}</Dialog.Title><Dialog.Description className="mt-4 leading-8 text-muted">{t.common.channelSetup}</Dialog.Description><Dialog.Close className="gold-button mt-6">{t.common.gotIt}</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>;
 })}</aside>;
}

function Home({ products }: { products: ProductData[] }) {
 const { t, lang, contact } = useLanguage();
 const price = (value: number) => value.toLocaleString(t.locale);
 const lineQrSrc = contact.lineQrImage || defaultLineQr.src;
 return <>
  <header className="site-header"><div className="shell header-inner"><a href="#home" aria-label={t.common.homeAria} className="logo-link"><Image src={logo} alt="Pete Bird’s Nest" className="logo" sizes="(max-width: 767px) 110px, 180px" priority/></a><nav className="desktop-nav" aria-label={t.common.menu}>{navHrefs.map((href,i) => <a href={href} key={href}>{t.nav[i]}</a>)}</nav><div className="header-contact"><LanguageSwitcher className="header-lang"/><Contact>{t.common.talkToUs}</Contact></div><Dialog.Root><Dialog.Trigger className="mobile-menu" aria-label={t.common.openMenu}><Menu size={22}/></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content mobile-menu-panel"><Dialog.Title className="text-2xl text-gold">Pete Bird’s Nest</Dialog.Title><Dialog.Description className="mt-2 text-muted">{t.common.tagline}</Dialog.Description><Dialog.Close className="dialog-close" aria-label={t.common.closeMenu}><X/></Dialog.Close><nav className="mobile-nav">{navHrefs.map((href,i) => <Dialog.Close asChild key={href}><a href={href}>{t.nav[i]}<ArrowUpRight size={16}/></a></Dialog.Close>)}</nav><LanguageSwitcher className="mobile-lang"/></Dialog.Content></Dialog.Portal></Dialog.Root></div></header>
  <main>
   <section id="home" className="hero" style={{backgroundImage:`url(${coverHero.src})`}}><div className="hero-fade"/><div className="shell hero-content"><p className="eyebrow"><span/> PREMIUM BIRD’S NEST</p><h1>{t.hero.titleTop}<br/><span className="gold-word">{t.hero.titleGold}</span></h1><p className="hero-description">{t.hero.description[0]}<br/>{t.hero.description[1]}</p><div className="hero-actions"><Contact>{t.hero.order}</Contact><a href="#products" className="outline-button">{t.hero.viewProducts} <ArrowRight size={17}/></a></div><div className="hero-features">{t.hero.features.map(([title,desc],i)=>{const I=heroIcons[i];return <div key={title}><I size={29} strokeWidth={1.4}/><strong>{title}</strong><span>{desc}</span></div>;})}</div></div></section>
   <section id="about" className="about-section" style={{ backgroundImage: `url(${aboutBackground.src})` }}><div className="shell about-grid"><div className="about-copy"><p className="eyebrow">ABOUT US</p><h2>{t.about.titleTop}<br/>{t.about.titleBottom}</h2><p className="section-description">{t.about.description[0]}<br className="desktop-break"/> {t.about.description[1]}</p><a href="#benefits" className="gold-button">{t.about.cta} <ArrowRight size={15}/></a></div></div></section>
   <section id="nutrition" className="nutrition-section"><div className="shell">
    <div className="section-heading"><div><p className="eyebrow">{t.nutrition.eyebrow}</p><h2>{t.nutrition.title}</h2></div><p className="section-description">{t.nutrition.subtitle}</p></div>
    <div className="nutrition-grid">{t.nutrition.items.map(([title,desc],i)=>{const I=nutritionIcons[i];return <div className="nutrition-card" key={title}><span className="nutrition-number">0{i+1}</span><I size={26} strokeWidth={1.4}/><h3>{title}</h3><p>{desc}</p></div>;})}</div>
    <p className="nutrition-source">{t.nutrition.source}</p>
    <div className="sialic-block">
     <h3 className="sialic-title">{t.nutrition.sialicTitle}</h3>
     <p className="sialic-intro">{t.nutrition.sialicIntro}</p>
     <p className="sialic-subheading">{t.nutrition.sialicSubheading}</p>
     <div className="sialic-grid">{t.nutrition.sialicItems.map(([title,desc],i)=><div className="sialic-item" key={title}><span className="sialic-number">{i+1}</span><div><strong>{title}</strong><p>{desc}</p></div></div>)}</div>
     <p className="nutrition-source">{t.nutrition.sialicSource}</p>
    </div>
   </div></section>
   <section id="products" className="collection-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow">OUR PRODUCTS</p><h2>{t.products.title}</h2></div><p className="section-description">{t.products.description}</p></div><div className="shop-grid">{products.map(p=>{const item=p.translations[lang];return <article className="shop-card" id={`product-${p.slug}`} key={p.slug}>
 <div className="shop-image"><Image src={p.image} alt={item.alt} fill sizes="(max-width: 767px) 90vw, 45vw"/><span className="shop-badge">{p.badge}</span><span className="shop-edition">{p.slug} / PETE</span></div>
 <div className="shop-body"><div className="shop-heading"><div><p className="shop-category">PREMIUM BIRD’S NEST</p><h3>{item.name}</h3></div><span className="shop-type">{item.type}</span></div><p className="shop-description">{item.description}</p>
 <div className="shop-price-row"><div><span className="shop-price-label">{t.products.priceLabel} {item.unit}</span><p className={`shop-price ${p.price === null ? 'price-pending' : ''}`}>{p.price === null ? t.products.askPrice : <><span>฿</span>{price(p.price)}</>}</p></div><span className="shop-quality"><Leaf size={15}/> {t.products.quality}</span></div>
 <div className="shop-actions"><Contact>{t.products.order}</Contact><Dialog.Root><Dialog.Trigger className="shop-detail" aria-label={`${t.products.detailAria} ${item.alt}`}>{t.products.detail} <ArrowUpRight size={17}/></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label={t.common.close}><X/></Dialog.Close><Image className="modal-image" src={p.image} alt={item.alt} width={800} height={500}/><Dialog.Title className="text-2xl">{item.name}</Dialog.Title><Dialog.Description className="mt-4 leading-8 text-muted">{item.detail}</Dialog.Description><p className="shop-modal-price">{p.price === null ? t.products.askPriceShop : `฿${price(p.price)} / ${item.unit}`}</p><div className="mt-6"><Contact>{t.products.askThis}</Contact></div></Dialog.Content></Dialog.Portal></Dialog.Root></div></div>
 </article>;})}</div><div className="collection-foot"><span>{t.products.foot}</span><a href="#questions" className="text-link">{t.products.footLink} <ArrowRight size={16}/></a></div></div></section>
   <section id="benefits" className="benefits-section"><Photo box={[0,1009,503,194]} className="benefits-photo" label={t.benefits.photoLabel}/><div className="benefits-copy"><p className="eyebrow">A LITTLE CARE, EVERY DAY</p><h2>{t.benefits.title}</h2><p className="benefits-description">{t.benefits.description}</p><div className="benefit-grid">{t.benefits.items.map(([title,desc],i)=>{const I=benefitIcons[i];return <div key={title}><span className="benefit-icon"><I size={30} strokeWidth={1.4}/></span><strong>{title}</strong><p>{desc}</p></div>;})}</div></div></section>
   <section id="questions" className="faq-section"><div className="shell faq-grid"><div><p className="eyebrow">A LITTLE MORE TO KNOW</p><h2>{t.faq.title}</h2><p className="section-description">{t.faq.description}</p><a href="#contact" className="text-link">{t.faq.more} <ArrowUpRight size={16}/></a></div><Accordion.Root type="single" collapsible className="faq-list">{t.faq.items.map(([q,a],i)=><Accordion.Item value={`q${i}`} key={q}><Accordion.Header><Accordion.Trigger className="faq-trigger"><span className="faq-number">0{i+1}</span>{q}<Plus size={18}/></Accordion.Trigger></Accordion.Header><Accordion.Content className="faq-content"><p>{a}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root></div></section>
   <section id="contact" className="contact-section"><div className="shell"><p className="eyebrow">LET’S MAKE SOMEONE’S DAY</p><div className="contact-grid"><h2>{t.contact.titleTop}<br/><span>{t.contact.titleBottom}</span></h2><div><p>{t.contact.description[0]}<br/>{t.contact.description[1]}</p><Contact>{t.contact.cta} <ArrowUpRight size={17}/></Contact>{contact.phone&&<a className="phone-link" href={`tel:${contact.phone.replace(/[^+\d]/g,'')}`}><Phone size={15}/>{contact.phone}</a>}</div><figure className="contact-qr"><Dialog.Root><Dialog.Trigger className="contact-qr-trigger" aria-label={t.contact.qrAria}><Image src={lineQrSrc} alt={t.contact.qrAlt} width={144} height={144} sizes="144px"/></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content qr-dialog"><Dialog.Close className="dialog-close" aria-label={t.common.close}><X/></Dialog.Close><Dialog.Title className="text-xl">{t.contact.qrTitle}</Dialog.Title><Dialog.Description className="mt-2 text-sm text-muted">{t.contact.qrDescription}</Dialog.Description><Image className="qr-enlarged" src={lineQrSrc} alt={t.contact.qrLargeAlt} width={340} height={340} sizes="(max-width: 480px) 80vw, 340px"/>{contact.lineUrl && <Contact>{t.contact.openLine}</Contact>}</Dialog.Content></Dialog.Portal></Dialog.Root><figcaption>{t.contact.qrCaption}<span>{t.contact.qrCaptionHint}</span></figcaption></figure></div><div className="contact-bottom"><span>PETE BIRD’S NEST</span><span>Thoughtfully selected. Beautifully given.</span></div></div></section>
  </main><FloatingSocial/><footer className="shell footer"><a href="#home">Pete<span>BIRD’S NEST</span></a><p>{t.footer.copyright}</p><a href="#home" className="back-top">{t.footer.backTop} <ArrowUpRight size={15}/></a></footer>
 </>;
}

export function HomeClient({ dicts, products, contact }: { dicts: Record<Lang, Dict>; products: ProductData[]; contact: ContactInfo }) {
  return (
    <LanguageProvider dictionaries={dicts} contact={contact}>
      <Home products={products} />
    </LanguageProvider>
  );
}
