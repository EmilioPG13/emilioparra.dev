// Copy that appears more than once, and facts copied from the CV v6 (source of
// truth for experience, dates and titles). Numbers come from the project
// READMEs; each one is shown next to the environment it was measured in.

export const person = {
  name: 'Emilio Parra',
  role: 'Software Developer',
  pitch:
    'I build backend services that stay correct when things fail, and I prove it with tests.',
  // The address lives on the domain Emilio is buying; until the domain and the
  // forwarding exist (Phase 3) mail sent here goes nowhere.
  email: 'hello@emilioparra.dev',
  github: 'https://github.com/EmilioPG13',
  linkedin: 'https://linkedin.com/in/emilio-parra-3813a5107',
  cv: '/emilio-parra-cv.pdf',
  // Secondary action: lives only in Contact so the site never reads as freelance services.
  calls: [
    { label: 'Google Meet', href: 'https://calendly.com/emilio-pg95/intro-call' },
    { label: 'Zoom', href: 'https://calendly.com/emilio-pg95/30min' },
  ],
} as const;

// Spread on every off-site link so the visitor keeps this page open.
export const newTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

// Umami Cloud. While the id is empty the script is not loaded at all.
export const analytics = {
  websiteId: 'b693f8dd-5217-4282-bba1-366eff591e0c',
  domain: 'emilioparra.dev',
} as const;

export type LineColor = 'red' | 'blue' | 'amber' | 'brown';

export interface Station {
  title: string;
  branch?: boolean;
  text: string;
  proof?: { label: string; href: string };
}

export interface FeaturedProject {
  id: string;
  letter: string;
  color: LineColor;
  name: string;
  summary: string;
  note?: string;
  branch?: boolean;
  stations: Station[];
  links: { label: string; href: string }[];
}

export interface ShortProject {
  id: string;
  letter: string;
  color: LineColor;
  name: string;
  summary: string;
  stack: string;
  links: { label: string; href: string }[];
  note?: string;
}

const courtBookingRepo = 'https://github.com/EmilioPG13/reservation-system';
const webhooksRepo = 'https://github.com/EmilioPG13/webhook-delivery-platform';

export const featured: FeaturedProject[] = [
  {
    id: 'court-booking',
    letter: 'C',
    color: 'red',
    name: 'Court Booking',
    summary:
      'A padel court booking app where a double booking is impossible by construction, not by checking first.',
    note: 'The demo is in Spanish, and the first load can take a few seconds while the database wakes up.',
    stations: [
      {
        title: 'The database refuses overlaps',
        text: 'A PostgreSQL exclusion constraint on a time range rejects overlapping reservations. The API turns the violation into a 409.',
      },
      {
        title: 'Twenty requests, one winner',
        text: 'A test fires 20 simultaneous requests at one slot against a real PostgreSQL: exactly one succeeds and nineteen are rejected.',
        proof: {
          label: 'Read the test',
          href: `${courtBookingRepo}/blob/main/backend/tests/test_reservations_concurrency.py`,
        },
      },
      {
        title: 'Two browsers race for the same slot',
        text: 'An end-to-end Playwright test races two browsers for one court slot. The court grid takes one API call per day.',
      },
    ],
    links: [
      { label: 'Live demo', href: 'https://reservation-system-azure.vercel.app' },
      { label: 'Code', href: courtBookingRepo },
    ],
  },
  {
    id: 'webhook-delivery-platform',
    branch: true,
    letter: 'W',
    color: 'blue',
    name: 'Webhook Delivery Platform',
    summary:
      'A service that delivers webhooks to receivers that are down, slow or hostile, without losing an event.',
    note: 'No live demo: it is a backend, so the map above and the tests are the evidence.',
    stations: [
      {
        title: 'The event is saved before it is sent',
        text: 'A transactional outbox with at-least-once delivery, tested with Testcontainers on PostgreSQL 18.',
        proof: { label: 'Read the decision', href: `${webhooksRepo}/blob/main/adr/0001-at-least-once-delivery.md` },
      },
      {
        title: 'Retries for about 47 hours, then a dead-letter queue',
        branch: true,
        text: 'Ten attempts with jitter, a circuit breaker per endpoint, and SSRF protection checked at connect time.',
        proof: { label: 'Read the decision', href: `${webhooksRepo}/blob/main/adr/0006-retry-schedule.md` },
      },
      {
        title: 'A rolling update under load lost 0 events',
        text: 'Measured in 3 runs on local Kubernetes (kind), not on AWS. The test can fail: with the shutdown window cut to 1 second it still lost 0 events but produced 45 duplicate deliveries.',
        proof: { label: 'Read the script', href: `${webhooksRepo}/blob/main/deploy/local/rollout-test.ps1` },
      },
    ],
    links: [
      { label: 'Code', href: webhooksRepo },
      { label: 'Measured results', href: `${webhooksRepo}/blob/main/load/RESULTS.md` },
    ],
  },
];

export const shortLines: ShortProject[] = [
  {
    id: 'price-tracker-bot',
    letter: 'P',
    color: 'amber',
    name: 'Price Tracker Bot',
    summary:
      'A Telegram bot that watches product prices in Mexican online stores and messages you when one drops to the price you asked for.',
    stack: 'Python 3.13, PostgreSQL, Docker',
    note: 'The bot answers in Spanish. In production on Northflank since September 2026.',
    links: [
      { label: 'Open the bot', href: 'https://t.me/Emilio_price_tracker_bot' },
      { label: 'Code', href: 'https://github.com/EmilioPG13/price-tracker-bot' },
    ],
  },
  {
    id: 'larsen-italiana',
    letter: 'L',
    color: 'brown',
    name: 'Larsen Italiana',
    summary:
      'A bilingual (ES/EN) lead-generation site and inventory back office for Larsen Italiana, a distributor of rebuilt industrial knitting machines.',
    stack: 'React 19, TypeScript, Express, PostgreSQL, Prisma',
    links: [
      { label: 'Visit the site', href: 'https://larsenitaliana.com' },
      { label: 'Code', href: 'https://github.com/EmilioPG13/Larsen-WebPage' },
    ],
  },
];

// Which project lines each language rides on, for the language bullets.
export const languages = [
  { name: 'Java', lines: ['blue'], href: '#webhook-delivery-platform', used: 'Webhook Delivery Platform' },
  { name: 'Python', lines: ['red', 'amber'], href: '#court-booking', used: 'Court Booking and Price Tracker Bot' },
  { name: 'TypeScript', lines: ['red', 'brown'], href: '#court-booking', used: 'Court Booking and Larsen Italiana' },
] as const satisfies readonly { name: string; lines: readonly LineColor[]; href: string; used: string }[];

export const experience = [
  {
    title: 'Digital Developer & Marketing',
    where: 'Larsen Italiana, Internship (Estadía I and II)',
    when: 'Jun 2026 to Present',
    detail:
      'Sole person responsible for the digital area. Built and deployed the bilingual React/Vite website and set up Google Search Console.',
  },
  {
    title: 'Remote interpreter for US clients',
    where: '',
    when: '2019 to present',
    detail: '',
  },
] as const;

export const education = [
  { title: 'Bachelor’s in Marketing', where: 'Universidad Madero', when: 'Graduating 2027' },
  { title: 'Full-Stack Engineer Certification', where: 'Codecademy', when: 'Sep 2025' },
  { title: 'Web Development Bootcamp', where: 'DEV.F, Mexico City', when: 'Oct 2021 to Oct 2022' },
] as const;
