"use client";

import { useEffect } from "react";
import ErrorPage from "@/components/ui/error-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage 
      title="Something Went Wrong"
      message="An unexpected error occurred. Our team has been notified and is working on a fix."
      showRetryButton
      onRetry={reset}
    />
  );
}
