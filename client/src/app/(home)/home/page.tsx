"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    const testSentryError = () => {
        throw new Error("Sentry Test Error from Home Page");
    };

    const testSentryCapture = () => {
        Sentry.captureMessage("Test message from Home Page", "info");
        Sentry.captureException(new Error("Test captured exception"));
        alert("Sent to Sentry! Check your Sentry dashboard.");
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 py-10">
            <h1 className="text-2xl font-bold">Home Page</h1>

            <div className="flex gap-4 mx-auto">
                <Button onClick={testSentryCapture} variant="outline">
                    Test Sentry Capture
                </Button>

                <Button onClick={testSentryError} variant="outline">
                    Test Sentry Error (throws)
                </Button>
            </div>
        </div>
    );
}