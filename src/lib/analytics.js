import { analyticsApi } from './api';

const SESSION_KEY = 'nerdyfren_analytics_session';

function sessionId() {
  let value = sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    value = globalThis.crypto?.randomUUID?.().replaceAll('-', '')
      || `session_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    sessionStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

export function trackEvent(eventName, metadata = {}, options = {}) {
  const pagePath = options.pagePath || window.location.pathname;
  const requestId = options.requestId;
  analyticsApi.track({
    event_name: eventName,
    page_path: pagePath,
    session_id: sessionId(),
    ...(requestId ? { request_id: requestId } : {}),
    metadata,
  }).catch(() => {});
}
