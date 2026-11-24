/**
 * Company details. Every component reads from here, so this is the only file to edit.
 * Anything marked PLACEHOLDER must be replaced with real details before launch.
 */
export const SITE = {
  name: 'SCALE IT', // short wordmark: nav, loader, footer
  legalName: 'SCALE IT Constructions',
  url: 'https://scaleit-constructions.example', // PLACEHOLDER domain (used for canonical, OG, sitemap)
  email: 'hello@scaleit-constructions.example', // PLACEHOLDER
  phone: '+971 4 000 0000', // PLACEHOLDER, as displayed
  phoneHref: '+97140000000', // PLACEHOLDER, digits for tel: links
  whatsapp: '971500000000', // PLACEHOLDER: digits only, international format (wa.me link)
  whatsappMessage: "Hi SCALE IT, I'd like a quote for a construction project.",
  address: {
    // PLACEHOLDER: shown in the footer and in the structured data
    street: '00 Placeholder Street',
    locality: 'City',
    region: 'Region',
    postalCode: '00000',
    country: 'AE', // ISO country code
  },
  tagline: 'Built bigger, faster and to the millimetre.',
  description:
    'SCALE IT Constructions designs and builds luxury villas, commercial towers, interiors and renovations, with fixed pricing, a dated programme and one team from site study to handover.',
  /** Small line in the footer. Set to '' to remove it. */
  demoNote: 'Concept demo website',
  splineScene: 'https://prod.spline.design/m15vrut2buhlBSRY/scene.splinecode',
} as const;

export const addressLine = [SITE.address.street, SITE.address.locality, SITE.address.country].join(', ');

/**
 * Counters in the introduction.
 * DEMO PLACEHOLDERS: REPLACE WITH REAL FIGURES before launch, then set STATS_ARE_DEMO to false
 * (which removes the "demo figures" note under the counters).
 */
export const STATS_ARE_DEMO = true;
export const STATS = [
  { value: 120, decimals: 0, suffix: '+', label: 'Projects delivered across homes, commercial buildings and interiors' }, // REPLACE WITH REAL FIGURES
  { value: 15, decimals: 0, suffix: ' yrs', label: 'Of design-and-build experience in the region' }, // REPLACE WITH REAL FIGURES
  { value: 96, decimals: 0, suffix: '%', label: 'Of projects handed over on or before the agreed date' }, // REPLACE WITH REAL FIGURES
  { value: 1.2, decimals: 1, suffix: 'M', label: 'Square feet built, from private villas to towers' }, // REPLACE WITH REAL FIGURES
] as const;

/**
 * Featured projects (section 03): DEMO PLACEHOLDERS.
 * Locations, scopes, timelines and names are illustrative. Replace with real project details.
 */
export const PROJECTS = {
  tower: {
    type: 'Commercial & high-rise',
    kicker: 'Design & build · Offices · Mixed use',
    specs: [
      ['Location', 'City-centre plot'],
      ['Scope', 'Frame to façade'],
      ['Timeline', 'Approx. 26 months'],
    ],
  },
  villas: {
    type: 'Luxury residential',
    slides: [
      { name: 'Hillside Villa', meta: '5 bedrooms · 640 m² · Private pool' },
      { name: 'Sea-View Villa', meta: '4 bedrooms · Infinity edge · ~14 months' },
      { name: 'Ocean-Front Residence', meta: 'Double-height living · Full fit-out' },
    ],
  },
  renovation: {
    type: 'Renovation & remodelling',
    captions: ['01 — Villa remodel, 2025', '02 — Façade restoration', '03 — Apartment block, full refurbishment'],
  },
} as const;

/**
 * Real Lighthouse mobile run (default mobile emulation, simulated throttling) on the production build.
 * Only change these after a new run, and only to what that run reports.
 */
export const PERF = {
  tool: 'Lighthouse mobile', // emulates a mid-range phone on a throttled (slow 4G) connection
  measured: '2026-11-24', // production build, `astro preview`, Lighthouse 12 default mobile settings
  performance: 96,
  fcp: '1.6 s', // recorded, not displayed
  lcp: '2.6 s',
  cls: '0',
};

/**
 * Contact form: Web3Forms (https://web3forms.com). PLACEHOLDER key: create a free access key
 * for the company inbox and paste it here. Until then the form explains it isn't connected yet.
 */
export const FORM = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: 'YOUR-WEB3FORMS-ACCESS-KEY', // PLACEHOLDER
  subject: 'New quote request: SCALE IT Constructions',
} as const;
export const formConfigured = !FORM.accessKey.startsWith('YOUR-');

export const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappMessage)}`;
export const telHref = `tel:${SITE.phoneHref}`;
