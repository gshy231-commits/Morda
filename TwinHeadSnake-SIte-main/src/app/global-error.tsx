"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body className="bg-[#030306]">
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <div className="w-20 h-20 rounded-full bg-[#ff4466]/10 border border-[#ff4466]/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#ff4466]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Critical Error</h1>
          <p className="text-[#6a6a7f] text-lg mb-8 text-center max-w-md">
            A critical error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bg-[#00ffaa] text-black font-semibold hover:bg-[#00dd99] transition-all"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
