# Pete Bird’s Nest

Responsive Thai landing page matching `landingpage.png`, built with Next.js App Router, TypeScript, Tailwind CSS and Radix UI Dialog.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run typecheck
npm run build
npm start
```

## Content and images

- `src/app/page.tsx`: navigation, white-and-gold brand sections, product dialogs and Radix FAQ accordion.
- `src/app/globals.css`: responsive layout, gold theme and image framing.
- `src/app/layout.tsx`: page metadata.
- `public/images/pete-reference.png`: supplied reference used for the logo, swallow illustration and serving image.

Product information must be confirmed by the store before publication. Product photos use the supplied assets in `src/assets/`; the hero uses `src/assets/cover/coverhero.png`. Noto Sans Thai is self-hosted via Fontsource.

## Contact configuration

Copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_LINE_URL` to the real LINE account URL, and optionally set `NEXT_PUBLIC_CONTACT_PHONE`. Restart the dev server after changing environment variables. Until LINE is configured, contact buttons display a setup-pending message instead of linking to an unverified account.

## About background

`src/assets/cover/about-reference.png` was generated with the built-in ImageGen tool using the supplied reference. Prompt: a wide 3:1 ABOUT US background matching the reference, blank near-white ivory left half, champagne-gold curved arch and a flying swallow on the right, soft diffused light, no text or UI. Original `about.png` is retained.

## Floating contact buttons

Configure `NEXT_PUBLIC_LINE_URL`, `NEXT_PUBLIC_FACEBOOK_URL` and `NEXT_PUBLIC_CONTACT_PHONE` in `.env.local`, then restart the server. Unconfigured channels display a pending-setup dialog. LINE and Facebook icons are locally stored SVGs from https://thesvg.org (CC0-1.0 per registry); the phone icon is from Lucide.
