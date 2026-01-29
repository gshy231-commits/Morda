"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#030306] pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-invert prose-gray">
            <p className="text-[#8a8a9f] mb-6">Last updated: January 2025</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-[#8a8a9f] mb-4">
              By using TwinHeadSnake, you agree to these terms. If you disagree, please do not use our service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Risk Disclosure</h2>
            <p className="text-[#8a8a9f] mb-4">
              Trading cryptocurrencies involves significant risk. Past performance does not guarantee future results. 
              Only trade with funds you can afford to lose.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Service Description</h2>
            <p className="text-[#8a8a9f] mb-4">
              We provide trading signals and analytics. We do not provide financial advice or manage your funds.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Subscription & Refunds</h2>
            <p className="text-[#8a8a9f] mb-4">
              Subscriptions are billed monthly. 7-day free trial available for new users.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Contact</h2>
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
