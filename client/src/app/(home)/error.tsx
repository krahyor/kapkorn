'use client';

/**
 * Enhanced Dashboard Error Page
 * Catches errors within dashboard routes with comprehensive error handling
 */

import { useEffect, useState, useCallback } from 'react';
import {
    AlertCircle,
    RefreshCw,
    Home,
    Bug,
    Copy,
    ChevronDown,
    ChevronUp,
    Send,
    FileText,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { logger } from '@/lib/logging';
import { errorReportingService } from '@/services/error-reporting.service';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorDetails {
    timestamp: string;
    userAgent: string;
    url: string;
    errorId: string;
    stackTrace?: string;
    componentStack?: string;
}

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [showDetails, setShowDetails] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [reportSent, setReportSent] = useState(false);
    const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Generate error details on mount
    useEffect(() => {
        const details: ErrorDetails = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errorId: error.digest || `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            stackTrace: error.stack,
            componentStack: (error as Error & { componentStack?: string }).componentStack,
        };
        setErrorDetails(details);

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Dashboard error:', error);
            console.error('Error details:', details);
        }

        // Log to application logger
        logger.error('Dashboard error occurred', error, {
            errorId: details.errorId,
            url: details.url,
            userAgent: details.userAgent,
            timestamp: details.timestamp,
        });

        // Send to error monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Implement error monitoring service integration
            // sendErrorToMonitoringService(error, details);
        }
    }, [error]);

    // Handle retry with exponential backoff
    const handleRetry = useCallback(() => {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds

        if (retryCount > 0) {
            setTimeout(() => {
                setRetryCount((prev) => prev + 1);
                reset();
            }, delay);
        } else {
            setRetryCount((prev) => prev + 1);
            reset();
        }
    }, [reset, retryCount]);

    // Copy error details to clipboard
    const copyErrorDetails = useCallback(async () => {
        if (!errorDetails) {
            return;
        }

        const detailsText = `
Error ID: ${errorDetails.errorId}
Timestamp: ${errorDetails.timestamp}
URL: ${errorDetails.url}
User Agent: ${errorDetails.userAgent}
Error Message: ${error.message}
${error.stack ? `Stack Trace:\n${error.stack}` : ''}
${errorDetails.componentStack ? `Component Stack:\n${errorDetails.componentStack}` : ''}
    `.trim();

        try {
            await navigator.clipboard.writeText(detailsText);
            logger.info('Error details copied to clipboard', { errorId: errorDetails.errorId });
        } catch (err) {
            logger.error('Failed to copy error details', err as Error);
        }
    }, [errorDetails, error]);

    // Send error report
    const sendErrorReport = useCallback(async () => {
        if (!errorDetails || isReporting) {
            return;
        }

        setIsReporting(true);

        try {
            const success = await errorReportingService.reportError({
                errorId: errorDetails.errorId,
                message: error.message,
                stack: error.stack,
                componentStack: errorDetails.componentStack,
                timestamp: errorDetails.timestamp,
                url: errorDetails.url,
                userAgent: errorDetails.userAgent,
                additionalContext: {
                    retryCount,
                    errorName: error.name,
                    digest: error.digest,
                },
            });

            if (success) {
                setReportSent(true);
                logger.info('Error report sent successfully', { errorId: errorDetails.errorId });

                // Reset success message after 3 seconds
                setTimeout(() => setReportSent(false), 3000);
            } else {
                throw new Error('Error reporting service returned false');
            }
        } catch (err) {
            logger.error('Failed to send error report', err as Error);
        } finally {
            setIsReporting(false);
        }
    }, [errorDetails, error, isReporting, retryCount]);

    // Get error severity based on error type
    const getErrorSeverity = useCallback(() => {
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
            return { level: 'warning', message: 'การโหลดข้อมูลล้มเหลว อาจเกิดจากการอัปเดตระบบ' };
        }
        if (error.message.includes('Network') || error.message.includes('fetch')) {
            return { level: 'warning', message: 'การเชื่อมต่อขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ต' };
        }
        return { level: 'error', message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' };
    }, [error]);

    const severity = getErrorSeverity();

    return (
        <div className="flex min-h-[600px] flex-col items-center justify-center p-4">
            <div className="mx-auto max-w-2xl w-full">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="mb-4 flex justify-center">
                            <div
                                className={`rounded-full p-3 ${severity.level === 'warning'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/20'
                                    : 'bg-destructive/10'
                                    }`}
                            >
                                {severity.level === 'warning' ? (
                                    <AlertTriangle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                                ) : (
                                    <AlertCircle className="h-10 w-10 text-destructive" />
                                )}
                            </div>
                        </div>
                        <CardTitle className="text-2xl">เกิดข้อผิดพลาด</CardTitle>
                        <CardDescription className="text-base mt-2">{severity.message}</CardDescription>
                        {errorDetails && (
                            <Badge variant="outline" className="mt-2">
                                Error ID: {errorDetails.errorId}
                            </Badge>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Error message display */}
                        <div className="text-center">
                            <p className="text-muted-foreground">
                                {retryCount > 0
                                    ? `ขออภัย ยังคงมีปัญหาในการโหลดข้อมูล (ลองแล้ว ${retryCount} ครั้ง)`
                                    : 'ขออภัย เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง'}
                            </p>
                        </div>

                        {/* Development error details */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="rounded-lg bg-muted p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-sm">รายละเอียดข้อผิดพลาด (Development)</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="h-8 px-2"
                                    >
                                        {showDetails ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                <p className="font-mono text-xs text-destructive mb-2">{error.message}</p>

                                {showDetails && (
                                    <div className="space-y-2 mt-3">
                                        {error.stack && (
                                            <div>
                                                <p className="font-semibold text-xs mb-1">Stack Trace:</p>
                                                <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-40">
                                                    {error.stack}
                                                </pre>
                                            </div>
                                        )}

                                        {errorDetails && (
                                            <div>
                                                <p className="font-semibold text-xs mb-1">Error Details:</p>
                                                <pre className="font-mono text-xs text-muted-foreground">
                                                    {JSON.stringify(errorDetails, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <Separator />

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button onClick={handleRetry} className="gap-2" variant="default">
                                    <RefreshCw className="h-4 w-4" />
                                    ลองใหม่อีกครั้ง {retryCount > 0 && `(${retryCount})`}
                                </Button>
                                <Link href={ROUTES.DASHBOARD.ROOT}>
                                    <Button variant="outline" className="gap-2">
                                        <Home className="h-4 w-4" />
                                        กลับหน้าหลัก
                                    </Button>
                                </Link>
                            </div>

                            {/* Additional actions */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyErrorDetails}
                                    className="gap-2"
                                    disabled={!errorDetails}
                                >
                                    <Copy className="h-4 w-4" />
                                    คัดลอกรายละเอียดข้อผิดพลาด
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={sendErrorReport}
                                    className="gap-2"
                                    disabled={!errorDetails || isReporting || reportSent}
                                >
                                    {isReporting ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            กำลังส่งรายงาน...
                                        </>
                                    ) : reportSent ? (
                                        <>
                                            <FileText className="h-4 w-4" />
                                            ส่งรายงานแล้ว
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            ส่งรายงานข้อผิดพลาด
                                        </>
                                    )}
                                </Button>

                                {process.env.NODE_ENV === 'development' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="gap-2"
                                    >
                                        <Bug className="h-4 w-4" />
                                        {showDetails ? 'ซ่อน' : 'แสดง'}รายละเอียด
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Help section */}
                        <div className="text-center text-sm text-muted-foreground">
                            <p>หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน</p>
                            <p>และระบุ Error ID: {errorDetails?.errorId}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
