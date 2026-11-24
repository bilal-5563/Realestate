/**
 * Agency details — PLACEHOLDERS. Replace before launch.
 * Every component reads from here, so this is the only file to edit.
 */
export const SITE = {
  name: 'Plinth', // placeholder studio name
  legalName: 'Plinth Studio',
  url: 'https://plinth.studio', // placeholder domain (used for canonical, OG, sitemap)
  email: 'hello@plinth.studio', // placeholder
  whatsapp: '971500000000', // placeholder — digits only, international format
  whatsappMessage: "Hi Plinth — I'd like to talk about a new website for my business.",
  tagline: 'Websites built like landmarks.',
  description:
    'Plinth is a creative web studio designing premium, high-performance websites for construction companies, architecture studios and real estate developers.',
  splineScene: 'https://prod.spline.design/m15vrut2buhlBSRY/scene.splinecode',
} as const;

/**
 * Numbers shown in the introduction. Every one is a commitment or a verifiable fact —
 * no client results. Keep it that way when editing.
 */
export const STATS = [
  { value: 100, decimals: 0, suffix: '%', label: 'Responsive — phone, tablet and desktop each designed on their own' },
  { value: 90, decimals: 0, suffix: '+', label: 'Lighthouse performance score we build to, measured on mobile' },
  { value: 7, decimals: 0, suffix: ' days', label: 'From kickoff to your first design draft' },
  { value: 7, decimals: 0, suffix: '', label: 'Sections on this page — each one a working sample of what we build' },
] as const;

/**
 * Contact form — Web3Forms (https://web3forms.com). PLACEHOLDER key: create a free access key
 * for the studio inbox and paste it here. Until then the form explains it isn't connected yet.
 */
export const FORM = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: 'YOUR-WEB3FORMS-ACCESS-KEY',
  subject: 'New project enquiry — website',
} as const;
export const formConfigured = !FORM.accessKey.startsWith('YOUR-');

export const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappMessage)}`;
