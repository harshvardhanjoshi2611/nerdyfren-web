export const serviceMeta = {
  'trend-hopper': {
    name: 'Trend Hopper',
    short: 'Quick-turnaround trend-based reel edit for creators who want to jump on what is working.',
    timeline: '24-48 hours',
    revisionCycles: 2,
    includes: ['Trend-style cut', 'Hook + pacing optimized', 'Captions / beat sync included', 'Fast delivery'],
    requirements: ['Reference audio', 'Reference video', 'Raw footage link', 'Email ID', 'Brief'],
  },
  'video-reel': {
    name: 'Video Editing',
    short: 'Under 90 seconds, cut for the scroll. Fast, clean, effective.',
    timeline: '2-3 Working Days',
    revisionCycles: 2,
    includes: ['Under 90 seconds', 'Max 2 revisions', 'Links supported', 'Audio & edit references'],
    requirements: ['Reference audio', 'Reference video', 'Raw footage link', 'Brief'],
  },
  'video-copy': {
    name: 'Video + Copy / Text',
    short: 'Up to 1 minute with punchy on-screen copy that keeps them watching.',
    timeline: '3-4 Working Days',
    revisionCycles: 2,
    includes: ['Up to 1 minute', 'Copy & text overlay included', 'Max 2 revisions', 'Links supported'],
    requirements: ['Reference audio', 'Reference video', 'Raw footage link', 'Email ID', 'Brief'],
  },
  podcast: {
    name: 'Podcast Editing',
    short: 'Full episode edit plus one reel. The complete podcast drop, handled.',
    timeline: 'Custom delivery timeline',
    revisionCycles: 2,
    requirements: ['Raw footage link', 'Brief'],
    includes: ['Up to 45-minute podcast', 'Full episode edit', '1 promotional reel', 'Basic animation'],
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
  { id: 'trend-hopper', amount: 1000, bookable: true },
  { id: 'video-reel', amount: 2500, bookable: true },
  { id: 'video-copy', amount: 3000, bookable: true },
  { id: 'podcast', amount: 5000, bookable: true },
  { id: 'surge-reel', amount: null, bookable: false, coming_soon: true, surge_pricing: true },
];

export const GST_RATE = 18;

export function getPriceBreakdown(value = 0) {
  if (value && typeof value === 'object') {
    const base = Number(value.base_amount ?? value.amount ?? 0);
    const rate = Number(value.gst_rate ?? GST_RATE);
    const gst = Number(value.gst_amount ?? Math.round((base * rate) / 100));
    return {
      base_amount: base,
      gst_rate: rate,
      gst_amount: gst,
      total_amount: Number(value.total_amount ?? value.payment_amount ?? base + gst),
    };
  }
  const base = Number(value || 0);
  const gst = Math.round((base * GST_RATE) / 100);
  return { base_amount: base, gst_rate: GST_RATE, gst_amount: gst, total_amount: base + gst };
}

export const formatMoney = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))
    : '-';

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

export const humanize = (value = '') => String(value || '').replaceAll('_', ' ');

export const getProjectName = (booking = {}) => {
  const serviceName = serviceMeta[booking.service_type]?.name || humanize(booking.service_type);
  return booking.project_name || booking.title || `${serviceName || 'Content'} Project`;
};
