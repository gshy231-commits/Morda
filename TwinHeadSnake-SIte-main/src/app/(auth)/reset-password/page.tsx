"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react";


const AuthGravityBackground = lazy(() => import("@/components/ui/AuthGravityBackground"));

const AUTH_API = "/api/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${AUTH_API}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#ff4466]/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-[#ff4466]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Invalid Link</h1>
        <p className="text-[#6a6a7f] mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="btn-primary inline-block px-6 py-3">
          Request New Link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-full bg-[#00ffaa]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-[#00ffaa]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Password Reset!</h1>
        <p className="text-[#6a6a7f] mb-6">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
        <Link href="/login" className="btn-primary inline-block px-6 py-3">
          Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#4488ff]/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[#4488ff]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-[#6a6a7f]">Enter your new password below.</p>
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
          <label className="block text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#00ffaa]/50 focus:outline-none focus:ring-1 focus:ring-[#00ffaa]/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
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
              Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[#6a6a7f] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="card p-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#00ffaa] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
