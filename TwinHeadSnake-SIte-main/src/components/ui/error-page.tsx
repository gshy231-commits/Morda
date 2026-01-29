"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
    },
  },
};

const iconVariants = {
  hidden: { scale: 0.5, opacity: 0, rotate: -10 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
    },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  },
};

const glowVariants = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.2, 1],
    transition: {
      duration: 3,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  },
};

const orbitVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      ease: "linear" as const,
      repeat: Infinity,
    },
  },
};

interface ErrorPageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

export default function ErrorPage({
  title = "Something Went Wrong",
  message = "An unexpected error occurred. Please try again later or contact support if the problem persists.",
  showBackButton = true,
  showRetryButton = false,
  onRetry,
}: ErrorPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030306] px-4 overflow-hidden relative">
      {}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#ff4466]/5 blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#4488ff]/5 blur-[100px]"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {}
          <motion.div
            className="relative w-32 h-32 mx-auto mb-8"
            variants={itemVariants}
          >
            {}
            <motion.div
              className="absolute inset-0"
              variants={orbitVariants}
              animate="animate"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ff4466]/60" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#4488ff]/60" />
            </motion.div>

            {}
            <motion.div
              className="absolute inset-0 rounded-full bg-[#ff4466]/20 blur-xl"
              variants={glowVariants}
              animate="animate"
            />

            {}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff4466]/20 to-[#ff4466]/5 border border-[#ff4466]/30"
              variants={iconVariants}
              animate="pulse"
            />

            {}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={iconVariants}
              whileHover={{ rotate: [0, -5, 5, -5, 0] }}
            >
              <AlertTriangle className="w-14 h-14 text-[#ff4466] drop-shadow-[0_0_20px_rgba(255,68,102,0.5)]" />
            </motion.div>
          </motion.div>

          {}
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 select-none"
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          {}
          <motion.p
            className="text-lg md:text-xl text-[#6a6a7f] mb-10 max-w-md mx-auto select-none"
            variants={itemVariants}
          >
            {message}
          </motion.p>

          {}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            variants={itemVariants}
          >
            {showBackButton && (
              <motion.button
                onClick={() => router.back()}
                className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[#2a2a3f] bg-[#0a0a12]/80 text-[#9a9aaf] hover:text-white hover:border-[#00ffaa]/40 hover:bg-[#00ffaa]/5 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Go Back
              </motion.button>
            )}

            {showRetryButton && onRetry && (
              <motion.button
                onClick={onRetry}
                className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[#ff4466]/30 bg-[#ff4466]/10 text-[#ff4466] hover:bg-[#ff4466]/20 hover:border-[#ff4466]/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                Try Again
              </motion.button>
            )}

            <Link
              href="/"
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-[#00ffaa] text-black font-semibold hover:bg-[#00dd99] hover:shadow-[0_0_30px_rgba(0,255,170,0.4)] transition-all duration-300 hover:scale-105 active:scale-98"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </motion.div>

          {}
          <motion.div
            className="mt-12 px-6 py-4 rounded-xl bg-[#0a0a12]/60 border border-[#2a2a3f]/50 max-w-sm mx-auto"
            variants={itemVariants}
          >
            <code className="font-mono text-sm text-[#6a6a7f]">
              <span className="text-[#ff4466]">Error</span>
              <span className="text-white">:</span>{" "}
              <span className="text-[#4488ff]">unexpected_failure</span>
            </code>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
