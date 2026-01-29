"use client";

import { useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import Logo from "@/components/Logo";


const AuthGravityBackground = lazy(() => import("@/components/ui/AuthGravityBackground"));

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] flex">
      {}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-[#00ffaa]/10 border border-[#00ffaa]/30 rounded-2xl backdrop-blur-xl"
          >
            <CheckCircle className="w-6 h-6 text-[#00ffaa]" />
            <div>
              <p className="text-white font-semibold">Login successful!</p>
              <p className="text-[#00ffaa] text-sm">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <Link 
          href="/" 
          className="absolute top-6 left-6 flex items-center gap-2 text-[#6a6a7f] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center gap-3 mb-12">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-bold">TwinHeadSnake</span>
            </Link>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-2">
            Welcome back
          </motion.h1>
          <motion.p variants={itemVariants} className="text-[#6a6a7f] mb-8">
            Sign in to access your trading dashboard
          </motion.p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-[#ff4466]/10 border border-[#ff4466]/20 rounded-xl p-4 mb-6"
              >
                <p className="text-[#ff4466] text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="block text-sm text-[#8a8a9f] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a5a6f]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#4a4a5f] focus:outline-none focus:border-[#00ffaa]/50 focus:ring-1 focus:ring-[#00ffaa]/20 transition-all"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm text-[#8a8a9f] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a5a6f]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-[#4a4a5f] focus:outline-none focus:border-[#00ffaa]/50 focus:ring-1 focus:ring-[#00ffaa]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a5a6f] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-[#00ffaa] hover:underline">
                Forgot password?
              </Link>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="text-center text-[#6a6a7f] mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#00ffaa] hover:underline">
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#00ffaa]/5 to-[#4488ff]/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00ffaa]/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#4488ff]/20 rounded-full blur-[150px]" />
        
        {}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute z-20 text-center p-12 pointer-events-none"
        >
          <div className="text-6xl font-bold mb-4">
            <span className="text-[#00ffaa]">+417%</span>
          </div>
          <p className="text-xl text-[#8a8a9f]">Average yearly growth</p>
          <p className="text-[#5a5a6f] mt-2">Join 247+ profitable traders</p>
        </motion.div>

        {}
        <Suspense fallback={null}>
          <AuthGravityBackground />
        </Suspense>
      </div>
    </div>
  );
}
