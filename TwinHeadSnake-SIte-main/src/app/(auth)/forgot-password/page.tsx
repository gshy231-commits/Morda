"use client";

import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";


const AuthGravityBackground = lazy(() => import("@/components/ui/AuthGravityBackground"));

const AUTH_API = "/api/auth";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${AUTH_API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] flex items-center justify-center relative overflow-hidden">
      {}
      <Suspense fallback={null}>
        <AuthGravityBackground />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[#6a6a7f] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.auth.forgotPassword.backToLogin}
        </Link>

        <div className="card p-8">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#00ffaa]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-[#00ffaa]" />
              </div>
              <h1 className="text-2xl font-bold mb-3">{t.auth.forgotPassword.success}</h1>
              <p className="text-[#6a6a7f] mb-6">
                <span className="text-white">{email}</span>
              </p>
              <Link
                href="/login"
                className="btn-primary inline-block px-6 py-3"
              >
                {t.auth.forgotPassword.backToLogin}
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#4488ff]/10 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-[#4488ff]" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{t.auth.forgotPassword.title}</h1>
                <p className="text-[#6a6a7f]">
                  {t.auth.forgotPassword.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-[#ff4466]/10 border border-[#ff4466]/20 text-[#ff4466] text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.auth.forgotPassword.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#00ffaa]/50 focus:outline-none focus:ring-1 focus:ring-[#00ffaa]/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {t.common.loading}
                    </span>
                  ) : (
                    t.auth.forgotPassword.submit
                  )}
                </button>
              </form>

              <p className="text-center text-[#6a6a7f] text-sm mt-6">
                <Link href="/login" className="text-[#00ffaa] hover:underline">
                  {t.auth.login.signIn}
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
