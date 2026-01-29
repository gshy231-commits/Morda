"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link href={href}>
      <motion.div
        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ 
          backgroundColor: "rgba(0, 255, 170, 0.1)",
          borderColor: "rgba(0, 255, 170, 0.3)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="text-[#9a9aaf] group-hover:text-[#00ffaa] transition-colors"
          initial={{ x: 0 }}
          whileHover={{ x: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.div>
        <span className="text-sm text-[#9a9aaf] group-hover:text-white transition-colors">
          {label}
        </span>
      </motion.div>
    </Link>
  );
}
