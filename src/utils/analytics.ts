import { api } from '../lib/api';

// Generate or get session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Track page view
export async function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    await api.post(
      '/api/analytics/page-view',
      {
        page_path: pagePath,
        page_title: pageTitle || document.title,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      },
      { skipAuth: true }
    );
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to track page view:', error);
    }
  }
}

// Track button click
export async function trackButtonClick(buttonLabel: string, pagePath?: string) {
  try {
    await api.post(
      '/api/analytics/button-click',
      {
        button_label: buttonLabel,
        page_path: pagePath || window.location.pathname,
        session_id: getSessionId(),
      },
      { skipAuth: true }
    );
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to track button click:', error);
    }
  }
}

