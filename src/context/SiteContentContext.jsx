import { useCallback, useEffect, useMemo, useState } from 'react';
import { siteContentApi } from '../lib/api';
import { SiteContentContext } from './siteContentState';
import { fallbackSiteContent, mergeSiteContent } from '../lib/siteContentFallback';

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(fallbackSiteContent);

  const reload = useCallback(() => siteContentApi.get()
    .then((result) => {
      setContent(mergeSiteContent(result));
      if (result.seo?.title) document.title = result.seo.title;
      const description = document.querySelector('meta[name="description"]');
      if (description && result.seo?.description) description.content = result.seo.description;
      return result;
    })
    .catch(() => {
      if (import.meta.env.DEV) {
        console.warn('[NerdyFren CMS] Public content could not be refreshed; using safe fallback content.');
      }
      return fallbackSiteContent;
    }), []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => ({ content, reload }), [content, reload]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}
