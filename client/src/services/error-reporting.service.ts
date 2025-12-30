/**
 * Error Reporting Service
 * Service for reporting errors to monitoring systems
 */

import { logger } from '@/lib/logging';

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  additionalContext?: Record<string, any>;
}

interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  environment?: string;
  version?: string;
  userId?: string;
}

class ErrorReportingService {
  private config: ErrorReportingConfig;

  constructor(config: ErrorReportingConfig) {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      version: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0',
      ...config,
    };
  }

  /**
   * Report an error to the monitoring service
   */
  async reportError(errorReport: ErrorReport): Promise<boolean> {
    if (!this.config.enabled) {
      logger.debug('Error reporting is disabled');
      return false;
    }

    try {
      // In development, just log the error
      if (this.config.environment === 'development') {
        logger.info(
          'Error report (development mode):',
          errorReport as unknown as Record<string, unknown>
        );
        return true;
      }

      // In production, send to error monitoring service
      if (this.config.endpoint) {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify({
            ...errorReport,
            environment: this.config.environment,
            version: this.config.version,
            service: 'morglaiban-admin-frontend',
          }),
        });

        if (!response.ok) {
          throw new Error(`Error reporting failed: ${response.statusText}`);
        }

        logger.info('Error report sent successfully', { errorId: errorReport.errorId });
        return true;
      }

      // Fallback: just log the error
      logger.error(
        'Error report (no endpoint configured):',
        new Error(errorReport.message),
        errorReport as unknown as Record<string, unknown>
      );
      return false;
    } catch (error) {
      logger.error('Failed to send error report', error as Error);
      return false;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ErrorReportingConfig {
    return { ...this.config };
  }
}

// Default instance
export const errorReportingService = new ErrorReportingService({
  enabled: process.env.NODE_ENV === 'production',
  endpoint: process.env['NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT'],
  apiKey: process.env['NEXT_PUBLIC_ERROR_REPORTING_API_KEY'],
});

export default errorReportingService;
