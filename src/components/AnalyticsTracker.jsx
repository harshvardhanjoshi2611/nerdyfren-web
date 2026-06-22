import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

export default function AnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    trackEvent('page_view', {}, { pagePath: pathname });
  }, [pathname]);
  return null;
}
