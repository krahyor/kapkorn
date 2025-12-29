import * as Sentry from "@sentry/nextjs";

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  additionalContext?: Record<string, unknown>;
}

class ErrorReportingService {
  async reportError(report: ErrorReport): Promise<boolean> {
    try {
      // Send to Sentry
      Sentry.captureException(new Error(report.message), {
        tags: {
          errorId: report.errorId,
        },
        extra: {
          url: report.url,
          userAgent: report.userAgent,
          timestamp: report.timestamp,
          componentStack: report.componentStack,
          ...report.additionalContext,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to report error:", error);
      return false;
    }
  }
}

export const errorReportingService = new ErrorReportingService();
