/**
 * Logging Utility for BarberConnect
 *
 * Provides environment-aware logging that only shows debug logs in development
 * and always shows errors for production monitoring.
 */

// Check if running in development mode
const isDev = __DEV__;

/**
 * Logger utility with environment-aware logging
 */
export const logger = {
  /**
   * Log debug information (only in development)
   * @param args - Any arguments to log
   */
  log: (...args: any[]) => {
    if (isDev) {
      // console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log informational messages (only in development)
   * @param args - Any arguments to log
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Log warnings (only in development)
   * @param args - Any arguments to log
   */
  warn: (...args: any[]) => {
    if (isDev) {
      // console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log errors (always shown, even in production)
   * In production, these should be sent to crash reporting service
   * @param args - Any arguments to log
   */
  error: (...args: any[]) => {
    // console.error('[ERROR]', ...args);

    // TODO: In production, send to Firebase Crashlytics or Sentry
    // if (!isDev) {
    //   crashlytics().recordError(new Error(args.join(' ')));
    // }
  },

  /**
   * Log API calls (only in development)
   * @param method - HTTP method or Firebase operation
   * @param endpoint - API endpoint or Firebase path
   * @param data - Request/response data
   */
  api: (method: string, endpoint: string, data?: any) => {
    if (isDev) {
      // console.log(`[API] ${method} ${endpoint}`, data || '');
    }
  },

  /**
   * Log navigation events (only in development)
   * @param screen - Screen name
   * @param params - Navigation parameters
   */
  navigation: (screen: string, params?: any) => {
    if (isDev) {
      // console.log(`[NAV] → ${screen}`, params || '');
    }
  },

  /**
   * Log user actions (only in development)
   * @param action - Action name
   * @param details - Action details
   */
  action: (action: string, details?: any) => {
    if (isDev) {
      // console.log(`[ACTION] ${action}`, details || '');
    }
  },
};

/**
 * Performance logger for tracking operation timing
 */
export class PerformanceLogger {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
    if (isDev) {
      // console.log(`[PERF] ${label} - Started`);
    }
  }

  /**
   * End timing and log duration
   */
  end() {
    const duration = Date.now() - this.startTime;
    if (isDev) {
      // console.log(`[PERF] ${this.label} - Completed in ${duration}ms`);
    }
    return duration;
  }
}

export default logger;
