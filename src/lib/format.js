export const serviceMeta = {
  'trend-hopper': {
    name: 'Trend Hopper',
    short: 'Fast, culture-aware edits built to ride the moment.',
    timeline: '24-48 hours',
    revisionCycles: 2,
    requirements: ['Reference Audios', 'Reference Videos', 'Raw Footage Drive Link', 'Email ID', 'Brief'],
  },
  'video-reel': {
    name: 'Reel Under 1 Minute',
    short: 'High-retention vertical edits for Reels, Shorts and TikTok.',
    timeline: '2–3 Working Days',
    revisionCycles: 2,
    requirements: ['Reference Audios', 'Reference Videos', 'Raw Footage Drive Link', 'Brief'],
  },
  'video-copy': {
    name: 'Video with Text/Copy Under 1 Minute',
    short: 'A complete content package: edit, hook, caption and polish.',
    timeline: '3–4 Working Days',
    revisionCycles: 3,
    requirements: ['Reference Audios', 'Reference Videos', 'Raw Footage Drive Link', 'Email ID', 'Brief'],
  },
  podcast: {
    name: 'Podcast Editing',
    short: 'A polished podcast package for episodes up to 45 minutes.',
    timeline: 'Custom delivery timeline',
    revisionCycles: 2,
    requirements: ['Raw Footage Drive Link', 'Brief'],
    includes: ['Up to 45-minute podcast', 'Podcast Edit', '1 Reel Adaptation/Precap', 'Basic Text Title'],
  },
  'surge-reel': {
    name: 'Surge Reel',
    short: 'Ultra-fast reel delivery when timing cannot wait.',
    timeline: 'Delivery within 180 minutes of project creation',
    revisionCycles: 0,
    requirements: [],
    comingSoon: true,
    surgePricing: true,
  },
};

export const fallbackServices = [
  { id: 'trend-hopper', amount: 1999 },
  { id: 'video-reel', amount: 2999 },
  { id: 'video-copy', amount: 3999 },
  { id: 'podcast', amount: 6000 },
  { id: 'surge-reel', amount: null, bookable: false, coming_soon: true, surge_pricing: true },
];

export const formatMoney = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  date ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date)) : '-';

export const formatDateTime = (date) =>
  date
    ? new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date))
    : '-';

export const humanize = (value = '') => value.replaceAll('_', ' ');

export const getProjectName = (booking = {}) => {
  const serviceName = serviceMeta[booking.service_type]?.name || humanize(booking.service_type);
  return booking.project_name || booking.title || `${serviceName || 'Content'} Project`;
};
