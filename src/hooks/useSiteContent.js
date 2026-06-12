import { useContext } from 'react';
import { SiteContentContext } from '../context/siteContentState';

export default function useSiteContent() {
  return useContext(SiteContentContext);
}
