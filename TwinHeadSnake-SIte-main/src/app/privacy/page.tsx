"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#030306] pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-invert prose-gray">
            <p className="text-[#8a8a9f] mb-6">Last updated: January 2025</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-[#8a8a9f] mb-4">
              We collect information you provide directly, including email, name, and payment information when you register.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-[#8a8a9f] mb-4">
              We use your information to provide trading signals, process payments, and improve our services.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Security</h2>
            <p className="text-[#8a8a9f] mb-4">
              We implement industry-standard security measures including encryption and secure data storage.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Contact</h2>
            <p className="text-[#8a8a9f]">
              Questions? Email us at <a href="mailto:twinheadsnake@proton.me" className="text-[#00ffaa]">twinheadsnake@proton.me</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
