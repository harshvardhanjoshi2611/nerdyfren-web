import { useCallback, useEffect, useMemo, useState } from 'react';
import { siteContentApi } from '../lib/api';
import { SiteContentContext } from './siteContentState';

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(null);

  const reload = useCallback(() => siteContentApi.get()
    .then((result) => {
      setContent(result);
      if (result.seo?.title) document.title = result.seo.title;
      const description = document.querySelector('meta[name="description"]');
      if (description && result.seo?.description) description.content = result.seo.description;
      return result;
    })
    .catch(() => null), []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => ({ content, reload }), [content, reload]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}
