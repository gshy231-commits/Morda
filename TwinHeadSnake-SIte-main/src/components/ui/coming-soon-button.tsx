"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ComingSoonButtonProps {
  variant?: "primary" | "secondary" | "outline" | "nav";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function ComingSoonButton({ 
  variant = "primary", 
  size = "md",
  className = "",
  children 
}: ComingSoonButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-semibold transition-all cursor-not-allowed overflow-hidden";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#2a2a3a] to-[#1a1a2a] text-[#6a6a7f] border border-white/10",
    secondary: "bg-white/5 text-[#6a6a7f] border border-white/10",
    outline: "bg-transparent text-[#6a6a7f] border border-white/20",
    nav: "bg-transparent text-[#5a5a6f] text-sm px-4 py-2",
  };

  return (
    <motion.button
      disabled
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {}
      <div className="absolute inset-0 rounded-inherit opacity-50">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ffaa]/0 via-[#00ffaa]/20 to-[#00ffaa]/0 animate-shimmer" />
      </div>
      
      <Clock className="w-4 h-4" />
      <span>{children || "Coming Soon"}</span>
      
      {}
      <motion.div
        className="absolute inset-0 bg-[#00ffaa]/5 rounded-inherit"
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}


export function ComingSoonCTA({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative px-10 py-4 rounded-2xl bg-gradient-to-r from-[#1a1a2a] to-[#0a0a15] border border-[#00ffaa]/20 cursor-not-allowed overflow-hidden">
        {}
        <div className="absolute inset-0 rounded-2xl">
          <div className="absolute inset-[-2px] bg-gradient-to-r from-[#00ffaa]/0 via-[#00ffaa]/30 to-[#00ffaa]/0 rounded-2xl animate-shimmer" />
        </div>
        
        {}
        <div className="relative flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="w-5 h-5 text-[#00ffaa]" />
          </motion.div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#6a6a7f] to-[#8a8a9f] bg-clip-text text-transparent">
            Coming Soon
          </span>
        </div>
        
        {}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
