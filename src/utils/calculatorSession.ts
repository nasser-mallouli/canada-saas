import { api } from '../lib/api';

// Get or create a unique session ID for this calculator session
export function getCalculatorSessionId(): string {
  let sessionId = sessionStorage.getItem('calculator_session_id');
  if (!sessionId) {
    sessionId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('calculator_session_id', sessionId);
  }
  return sessionId;
}

// Get the calculation ID (from backend response) to track this specific calculation
export function getCalculationId(): string | null {
  return sessionStorage.getItem('calculation_id');
}

export function setCalculationId(id: string): void {
  sessionStorage.setItem('calculation_id', id);
}

// Debounce tracking to avoid too many concurrent requests
let trackingTimeout: NodeJS.Timeout | null = null;
let pendingTracking: {
  step: string;
  completedSteps: string[];
  partialData: any;
  userInfo?: { fullName?: string; email?: string; phone?: string };
  isCompleted: boolean;
} | null = null;

// Track calculator session progress (fire-and-forget to avoid blocking)
export async function trackCalculatorStep(
  step: string,
  completedSteps: string[],
  partialData: any,
  userInfo?: { fullName?: string; email?: string; phone?: string },
  isCompleted: boolean = false
): Promise<any> {
  // Store the latest tracking data
  pendingTracking = {
    step,
    completedSteps,
    partialData,
    userInfo,
    isCompleted,
  };

  // Clear existing timeout
  if (trackingTimeout) {
    clearTimeout(trackingTimeout);
  }

  // If it's a completion, send immediately and return response
  if (isCompleted) {
    const response = await sendTracking(pendingTracking);
    pendingTracking = null;
    return response;
  }

  // Otherwise, debounce by 1000ms to batch rapid updates and reduce database locks
  return new Promise((resolve) => {
    trackingTimeout = setTimeout(async () => {
    if (pendingTracking) {
        const response = await sendTracking(pendingTracking);
      pendingTracking = null;
        resolve(response);
      } else {
        resolve(null);
    }
  }, 1000);
  });
}

async function sendTracking(data: {
  step: string;
  completedSteps: string[];
  partialData: any;
  userInfo?: { fullName?: string; email?: string; phone?: string };
  isCompleted: boolean;
}): Promise<any> {
  // Fire and forget - don't wait for response to avoid blocking UI
  const sessionId = getCalculatorSessionId();
  try {
    const response = await api.post(
    '/api/crs/session',
    {
      session_id: sessionId,
      current_step: data.step,
      completed_steps: data.completedSteps,
      partial_data: data.partialData,
      user_name: data.userInfo?.fullName,
      user_email: data.userInfo?.email,
      user_phone: data.userInfo?.phone,
      is_completed: data.isCompleted,
    },
    { skipAuth: true }
    );
    // Store the calculation ID from backend response to track this specific calculation
    if (response?.id) {
      setCalculationId(response.id);
    }
    return response;
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to track calculator step:', error);
    }
    return null;
  }
}

