"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Menu, X, Heart, Copy, Check, LogIn } from "lucide-react";
import Logo from "./Logo";

interface NavbarProps {
  currentPage?: TabId;
}

type TabId = "home" | "positions" | "top-coins" | "about" | "pricing" | "api";

const navItems: { name: string; url: string; id: TabId }[] = [
  { name: "Home", url: "/", id: "home" },
  { name: "Positions", url: "/#positions", id: "positions" },
  { name: "Top Coins", url: "/#top-coins", id: "top-coins" },
  { name: "About", url: "/#about", id: "about" },
  { name: "Pricing", url: "/#pricing", id: "pricing" },
];

const SOL_WALLET = "8GtgLcg2vT29Peoa5E2hsrb7h6uR6DS7fW6rpS5UdyrK";


function NavItem({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: { name: string; id: TabId }; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 origin-center hover:scale-110 ${
        isActive ? "text-[#00ffaa]" : "text-[#7a7a8f] hover:text-white"
      }`}
    >
      <span className="relative z-10 whitespace-nowrap">{item.name}</span>
      {isActive && (
        <motion.div
          layoutId="navbar-tubelight"
          className="absolute inset-0 w-full bg-[#00ffaa]/10 rounded-full -z-0 border border-[#00ffaa]/20"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#00ffaa] rounded-full">
            <div className="absolute w-10 h-3 bg-[#00ffaa]/40 rounded-full blur-md -top-1 -left-1" />
          </div>
        </motion.div>
      )}
    </button>
  );
}

export default function Navbar({ currentPage = "home" }: NavbarProps) {
  const [activeTab, setActiveTab] = useState(currentPage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const copyWallet = async () => {
    await navigator.clipboard.writeText(SOL_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      if (pathname !== '/') return;
      
      const sections = ['positions', 'top-coins', 'about', 'pricing'];
      const scrollPosition = window.scrollY + 150;
      
      if (scrollPosition < 400) {
        setActiveTab('home');
        return;
      }
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(sectionId as TabId);
            return;
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const timer = setTimeout(() => {
          scrollToElement(hash);
          setActiveTab(hash as TabId);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, scrollToElement]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#030306]/90 backdrop-blur-xl border-b border-white/5" : ""
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between relative">
            {}
            <Link href="/" className="flex items-center gap-3 group z-10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ffaa] to-[#00cc88] flex items-center justify-center shadow-lg shadow-[#00ffaa]/20 p-1.5 group-hover:shadow-[#00ffaa]/40 transition-shadow">
                <Logo className="w-full h-full text-black" />
              </div>
              <span className="font-bold text-white text-base hidden sm:block">TwinHeadSnake</span>
            </Link>

            {}
            <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 bg-[#0a0a12]/60 border border-white/10 backdrop-blur-xl py-2 px-3 rounded-full">
                {navItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={activeTab === item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      const isHashLink = item.url.includes('#');
                      const hash = item.url.split('#')[1];
                      
                      if (item.id === 'home') {
                        if (pathname === '/') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          router.push('/');
                        }
                      } else if (isHashLink && hash) {
                        if (pathname === '/') {
                          scrollToElement(hash);
                        } else {
                          router.push(item.url);
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {}
            <div className="hidden lg:flex items-center gap-2 z-10">
              <div className="relative">
                <button
                  onClick={() => setDonateOpen(!donateOpen)}
                  className="flex items-center gap-1.5 text-[#9945FF] hover:text-[#14F195] text-sm font-medium px-3 py-2 rounded-full border border-[#9945FF]/30 hover:border-[#14F195]/30 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 transition-all"
                >
                  <Heart size={14} />
                  <span>Donate</span>
                </button>
                
                <AnimatePresence>
                  {donateOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setDonateOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 p-5 rounded-xl bg-[#0a0a12] border border-white/10 shadow-xl z-50"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-base">Support Us</h4>
                            <p className="text-[#6a6a7f] text-sm">SOL donations welcome</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/10 mb-4">
                          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 128 128" fill="none">
                            <defs>
                              <linearGradient id="solGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#9945FF" />
                                <stop offset="100%" stopColor="#14F195" />
                              </linearGradient>
                            </defs>
                            <path d="M25.4 99.5c.8-.8 1.8-1.2 3-1.2h91.2c1.9 0 2.8 2.3 1.5 3.6l-17.6 17.6c-.8.8-1.8 1.2-3 1.2H9.3c-1.9 0-2.8-2.3-1.5-3.6l17.6-17.6z" fill="url(#solGradNav)"/>
                            <path d="M25.4 8.5c.8-.8 1.9-1.2 3-1.2h91.2c1.9 0 2.8 2.3 1.5 3.6l-17.6 17.6c-.8.8-1.8 1.2-3 1.2H9.3c-1.9 0-2.8-2.3-1.5-3.6L25.4 8.5z" fill="url(#solGradNav)"/>
                            <path d="M102.6 53.7c-.8-.8-1.8-1.2-3-1.2H8.4c-1.9 0-2.8 2.3-1.5 3.6l17.6 17.6c.8.8 1.8 1.2 3 1.2h91.2c1.9 0 2.8-2.3 1.5-3.6L102.6 53.7z" fill="url(#solGradNav)"/>
                          </svg>
                          <span className="text-[#6a6a7f] text-xs font-mono truncate flex-1">
                            {SOL_WALLET}
                          </span>
                        </div>
                        
                        <button
                          onClick={copyWallet}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black font-semibold text-sm hover:opacity-90 transition-all"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Address
                            </>
                          )}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/api-docs"
                className="flex items-center gap-1.5 text-[#7a7a8f] hover:text-[#00ffaa] text-sm font-medium px-3 py-2 rounded-full border border-white/10 hover:border-[#00ffaa]/30 transition-all"
              >
                <Code size={14} />
                <span>API</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-[#7a7a8f] hover:text-white text-sm font-medium px-3 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all"
              >
                <LogIn size={14} />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 bg-[#00ffaa] hover:bg-[#00dd99] text-black font-medium px-4 py-2 rounded-full text-sm transition-all"
              >
                <span>Get Started</span>
              </Link>
            </div>

            {}
            <button
              className="lg:hidden text-white p-2.5 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 w-72 h-full bg-[#0a0a12]/98 backdrop-blur-xl border-l border-white/10 z-50 lg:hidden"
            >
              <div className="p-6">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-[#6a6a7f] hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-2 mb-10 mt-2">
                  <span className="font-bold text-white text-xl">TwinHeadSnake</span>
                </div>

                <div className="flex flex-col space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = activeTab === item.id;
                    const isHashLink = item.url.includes('#');
                    const hash = item.url.split('#')[1];

                    const handleClick = (e: React.MouseEvent) => {
                      e.preventDefault();
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      
                      if (item.id === 'home') {
                        if (pathname === '/') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          router.push('/');
                        }
                      } else if (isHashLink && hash) {
                        if (pathname === '/') {
                          setTimeout(() => scrollToElement(hash), 100);
                        } else {
                          router.push(item.url);
                        }
                      }
                    };

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <button 
                          onClick={handleClick} 
                          className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all ${
                            isActive
                              ? "bg-[#00ffaa]/10 text-[#00ffaa]"
                              : "text-[#7a7a8f] hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {item.name}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                  <button
                    onClick={copyWallet}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-[#9945FF]/30 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 text-base font-medium transition-all"
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="text-[#14F195]" />
                        <span className="text-[#14F195]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Heart size={18} className="text-[#9945FF]" />
                        <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Donate SOL</span>
                      </>
                    )}
                  </button>
                  <Link
                    href="/api-docs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-[#7a7a8f] hover:text-[#00ffaa] py-3 rounded-lg border border-white/10 hover:border-[#00ffaa]/30 text-base font-medium transition-all"
                  >
                    <Code size={18} />
                    API Docs
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-[#7a7a8f] hover:text-white py-3 rounded-lg border border-white/10 hover:border-white/30 text-base font-medium transition-all"
                  >
                    <LogIn size={18} />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-[#00ffaa] hover:bg-[#00dd99] text-black font-medium py-3 rounded-lg text-base transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
