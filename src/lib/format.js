export const serviceMeta = {
  'trend-hopper': {
    name: 'Trend Hopper',
    short: 'Fast, culture-aware edits built to ride the moment.',
    timeline: '24-48 hours',
  },
  'video-reel': {
    name: 'Short-form Reel',
    short: 'High-retention vertical edits for Reels, Shorts and TikTok.',
    timeline: '2-3 days',
  },
  'video-copy': {
    name: 'Video + Copy',
    short: 'A complete content package: edit, hook, caption and polish.',
    timeline: '3-4 days',
  },
  podcast: {
    name: 'Podcast Edit',
    short: 'Clean long-form episodes with branded, social-ready moments.',
    timeline: '4-5 days',
  },
};

export const formatMoney = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  date ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date)) : '-';

export const humanize = (value = '') => value.replaceAll('_', ' ');
