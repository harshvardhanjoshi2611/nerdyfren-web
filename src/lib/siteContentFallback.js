export const fallbackSiteContent = {
  settings: {
    brand_name: 'NerdyFren.com',
    support_email: 'support@nerdyfren.com',
  },
  homepage: {
    hero: {
      eyebrow: 'Post production studio',
      title: 'You shoot. We edit.',
      subtitle: "Reels, text overlays & podcast editing — send the raw footage, we'll send back content that lands.",
      cta_text: 'Book Editor →',
      cta_url: '/booking',
    },
    human_editors: {
      eyebrow: 'People, not prompts',
      title: '100% Human Editors',
      subtitle: 'No AI shortcuts. Real Nerds edit your content with taste, context, and creator instinct.',
    },
    how_it_works: {
      eyebrow: 'How It Works',
      title: 'From raw footage to ready to post.',
      subtitle: 'Your Nerdy Fren turns raw footage into ready-to-post content.',
      steps: [
        { title: 'Start Project', body: 'Choose a service and share what you are creating.' },
        { title: 'Share Brief & Raw Footage', body: 'Share authorized source and reference links, context, and goals.' },
        { title: 'Nerd Assigned', body: 'We match your project with a specialist editor.' },
        { title: 'Draft Delivered', body: 'Your first polished cut arrives in your project workspace.' },
        { title: 'Feedback Rounds', body: 'Share revision notes and review each updated delivery.' },
        { title: 'Final Ready-To-Post Content', body: 'Receive approved content ready for your feed.' },
      ],
    },
    visuals: {
      hero_media_url: '',
      hero_media_type: 'image',
      human_editors_media_url: '',
      human_editors_media_type: 'image',
      how_it_works_media_url: '',
      how_it_works_media_type: 'image',
      services_media_url: '',
      services_media_type: 'image',
      portfolio_visible: true,
      testimonials_visible: true,
    },
  },
  banners: [],
  faqs: [],
  media: [],
  portfolio: [],
  testimonials: [],
  footer_links: [],
  social_links: [],
  seo: {},
};

export function mergeSiteContent(content = {}) {
  return {
    ...fallbackSiteContent,
    ...content,
    settings: { ...fallbackSiteContent.settings, ...content.settings },
    homepage: {
      ...fallbackSiteContent.homepage,
      ...content.homepage,
      hero: { ...fallbackSiteContent.homepage.hero, ...content.homepage?.hero },
      human_editors: { ...fallbackSiteContent.homepage.human_editors, ...content.homepage?.human_editors },
      how_it_works: { ...fallbackSiteContent.homepage.how_it_works, ...content.homepage?.how_it_works },
      visuals: { ...fallbackSiteContent.homepage.visuals, ...content.homepage?.visuals },
    },
  };
}
