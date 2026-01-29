import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export - no server needed!
  output: 'export',
  
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Powered by header removal for security
  poweredByHeader: false,
  
  // Image optimization (required for static export)
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for static hosting
  trailingSlash: true,
};

export default nextConfig;
