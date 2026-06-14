import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { runtimeConfig } from '../lib/runtimeConfig';

const brandDescription = 'NerdyFren connects creators with verified video editors, thumbnail designers, and content managers through a managed delivery workflow.';

const publicRoutes = {
  '/': {
    title: 'NerdyFren | Verified Editors for Creator Content',
    description: brandDescription,
  },
  '/services': {
    title: 'Creator Editing Services | NerdyFren',
    description: 'Explore managed video editing and creator-content services delivered by verified human editors.',
  },
  '/booking': {
    title: 'Book a Creative Project | NerdyFren',
    description: 'Start a managed creator project, share optional source links, and receive a simple Request ID.',
  },
  '/signin': {
    title: 'Creator Sign In | NerdyFren',
    description: 'Sign in to manage your NerdyFren projects, delivery links, payments, and revisions.',
  },
  '/signup': {
    title: 'Create a Creator Account | NerdyFren',
    description: 'Create a NerdyFren account to keep your bookings and managed project workflow together.',
  },
  '/track': {
    title: 'Track Your Project | NerdyFren',
    description: 'Use your Request ID to follow delivery status, review work, and request revisions.',
  },
  '/privacy': {
    title: 'Privacy Notice | NerdyFren',
    description: 'Read the NerdyFren MVP privacy notice for creator, editor, and marketplace operations.',
  },
  '/terms': {
    title: 'Terms of Service | NerdyFren',
    description: 'Read the NerdyFren MVP service terms for bookings, payments, delivery, and revisions.',
  },
  '/refund': {
    title: 'Refund and Dispute Policy | NerdyFren',
    description: 'Read how NerdyFren reviews refund and service-dispute requests for managed creative projects.',
  },
};

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonicalPath = pathname === '/book' ? '/booking' : pathname;
    const page = publicRoutes[canonicalPath];
    const title = page?.title || 'NerdyFren';
    const description = page?.description || brandDescription;
    const canonicalUrl = `${runtimeConfig.siteUrl}${canonicalPath === '/' ? '' : canonicalPath}`;
    const imageUrl = runtimeConfig.ogImageUrl || `${runtimeConfig.siteUrl}/social-preview.svg`;

    document.title = title;
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: page ? 'index, follow' : 'noindex, nofollow',
    });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [pathname]);

  return null;
}
