"use client";

import { Gravity, MatterBody } from "@/components/ui/gravity";


const BitcoinIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M22.5 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.8-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2v0l-2.3-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4 1-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.5-5.4c-.5 1.9-3.4.9-4.3.7l.8-3.3c.9.2 4 .6 3.5 2.6z" fill="white"/>
  </svg>
);

const EthereumIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16 4v8.9l7.5 3.3L16 4z" fill="white" fillOpacity="0.6"/>
    <path d="M16 4L8.5 16.2l7.5-3.3V4z" fill="white"/>
    <path d="M16 21.9v6.1l7.5-10.4-7.5 4.3z" fill="white" fillOpacity="0.6"/>
    <path d="M16 28v-6.1l-7.5-4.3L16 28z" fill="white"/>
    <path d="M16 20.6l7.5-4.4L16 13v7.6z" fill="white" fillOpacity="0.2"/>
    <path d="M8.5 16.2l7.5 4.4V13l-7.5 3.2z" fill="white" fillOpacity="0.6"/>
  </svg>
);

const TetherIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.9 17.9v0c-.1 0-.7.1-1.9.1-1 0-1.6 0-1.9-.1v0c-3.7-.2-6.5-.9-6.5-1.8 0-.9 2.8-1.6 6.5-1.8v2.9c.3 0 .9.1 1.9.1 1.2 0 1.7 0 1.9-.1v-2.9c3.7.2 6.4.9 6.4 1.8 0 .9-2.7 1.6-6.4 1.8zm0-3.9v-2.6h5.3V8h-14.4v3.4h5.3V14c-4.2.2-7.3 1.1-7.3 2.2 0 1.1 3.1 2 7.3 2.2v7.9h3.8v-7.9c4.2-.2 7.3-1.1 7.3-2.2 0-1.1-3.1-2-7.3-2.2z" fill="white"/>
  </svg>
);

const BnbIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
    <path d="M12.1 14.1L16 10.2l3.9 3.9 2.3-2.3L16 5.6l-6.2 6.2 2.3 2.3zm-6.5 1.9l2.3-2.3 2.3 2.3-2.3 2.3-2.3-2.3zm6.5 1.9L16 21.8l3.9-3.9 2.3 2.3-6.2 6.2-6.2-6.2 2.3-2.3zm8.8-1.9l2.3-2.3 2.3 2.3-2.3 2.3-2.3-2.3zM18.4 16L16 13.6 14.1 15.5l-.2.2-.3.3L16 18.4l2.4-2.4z" fill="white"/>
  </svg>
);

const SolanaIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#000"/>
    <defs>
      <linearGradient id="sol" x1="6" y1="24" x2="26" y2="8">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
    </defs>
    <path d="M9.2 20.5c.1-.1.3-.2.5-.2h14.1c.3 0 .5.4.3.6l-2.8 2.8c-.1.1-.3.2-.5.2H6.7c-.3 0-.5-.4-.3-.6l2.8-2.8z" fill="url(#sol)"/>
    <path d="M9.2 8.1c.1-.1.3-.2.5-.2h14.1c.3 0 .5.4.3.6l-2.8 2.8c-.1.1-.3.2-.5.2H6.7c-.3 0-.5-.4-.3-.6l2.8-2.8z" fill="url(#sol)"/>
    <path d="M20.8 14.3c-.1-.1-.3-.2-.5-.2H6.2c-.3 0-.5.4-.3.6l2.8 2.8c.1.1.3.2.5.2h14.1c.3 0 .5-.4.3-.6l-2.8-2.8z" fill="url(#sol)"/>
  </svg>
);

const XrpIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#23292F"/>
    <path d="M23.1 8h2.5l-5.8 5.6c-2.1 2-5.5 2-7.6 0L6.4 8h2.5l4.5 4.3c1.4 1.3 3.6 1.3 5 0L23.1 8zM8.9 24H6.4l5.8-5.6c2.1-2 5.5-2 7.6 0l5.8 5.6h-2.5l-4.5-4.3c-1.4-1.3-3.6-1.3-5 0L8.9 24z" fill="white"/>
  </svg>
);

const DogeIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#C2A633"/>
    <path d="M13.2 8.5h4.5c4.4 0 6.8 2.9 6.8 7.5s-2.4 7.5-6.8 7.5h-4.5V8.5zm2.8 12.3h1.4c2.8 0 4.2-1.7 4.2-4.8s-1.4-4.8-4.2-4.8H16v9.6z" fill="white"/>
    <path d="M11 14.5h7v2.5h-7z" fill="white"/>
  </svg>
);

const BinanceIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="6" fill="#1E2026"/>
    <path d="M16 7l2.5 2.5-4.6 4.6-2.5-2.5L16 7zm-6.4 6.4l2.5-2.5 2.5 2.5-2.5 2.5-2.5-2.5zm0 6.2l2.5-2.5 4.6 4.6-2.5 2.5-4.6-4.6zm12.8-6.2l2.5 2.5-2.5 2.5-2.5-2.5 2.5-2.5zM16 13.9l2.5 2.5L16 18.9l-2.5-2.5L16 13.9z" fill="#F3BA2F"/>
  </svg>
);

const BybitIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="6" fill="#F7A600"/>
    <path d="M8 10h6v3H8v-3zm0 9h6v3H8v-3zm10-9h6v12h-6V10z" fill="white"/>
  </svg>
);

const OkxIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="6" fill="#000"/>
    <rect x="7" y="7" width="6" height="6" rx="1" fill="white"/>
    <rect x="13" y="13" width="6" height="6" rx="1" fill="white"/>
    <rect x="19" y="7" width="6" height="6" rx="1" fill="white"/>
    <rect x="7" y="19" width="6" height="6" rx="1" fill="white"/>
    <rect x="19" y="19" width="6" height="6" rx="1" fill="white"/>
  </svg>
);


const TrendingUpIcon = ({ size = 24, color = "#00ffaa" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TrendingDownIcon = ({ size = 24, color = "#ff4466" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

const CandlestickIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="8" width="4" height="8" fill="#00ffaa" rx="1"/>
    <line x1="5" y1="4" x2="5" y2="8" stroke="#00ffaa" strokeWidth="2"/>
    <line x1="5" y1="16" x2="5" y2="20" stroke="#00ffaa" strokeWidth="2"/>
    <rect x="10" y="6" width="4" height="10" fill="#ff4466" rx="1"/>
    <line x1="12" y1="2" x2="12" y2="6" stroke="#ff4466" strokeWidth="2"/>
    <line x1="12" y1="16" x2="12" y2="22" stroke="#ff4466" strokeWidth="2"/>
    <rect x="17" y="9" width="4" height="6" fill="#00ffaa" rx="1"/>
    <line x1="19" y1="5" x2="19" y2="9" stroke="#00ffaa" strokeWidth="2"/>
    <line x1="19" y1="15" x2="19" y2="19" stroke="#00ffaa" strokeWidth="2"/>
  </svg>
);

export default function AuthGravityBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto">
      <Gravity gravity={{ x: 0, y: 0.6 }} grabCursor={true} resetOnResize={false} addTopWall={false}>
        {}
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="25%" y={-100}>
          <div className="bg-[#00ffaa] text-black font-bold text-2xl px-6 py-3 rounded-2xl shadow-lg hover:cursor-grab">+$12,450</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="70%" y={-180}>
          <div className="bg-[#00ffaa] text-black font-bold text-xl px-5 py-2.5 rounded-xl shadow-lg hover:cursor-grab">+$5,890</div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="45%" y={-250}>
          <div className="bg-[#00cc88] text-black font-bold text-lg px-4 py-2 rounded-xl shadow-lg hover:cursor-grab">+$2,340</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="15%" y={-320}>
          <div className="bg-[#00ffaa] text-black font-bold text-base px-4 py-2 rounded-lg shadow-lg hover:cursor-grab">+$1,780</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="80%" y={-280}>
          <div className="bg-[#00cc88] text-black font-bold text-base px-4 py-2 rounded-lg shadow-lg hover:cursor-grab">+$3,210</div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="35%" y={-380}>
          <div className="bg-[#00ffaa]/90 text-black font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg hover:cursor-grab">+$890</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="60%" y={-420}>
          <div className="bg-[#00ffaa]/90 text-black font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg hover:cursor-grab">+$456</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="50%" y={-480}>
          <div className="bg-[#00cc88] text-black font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg hover:cursor-grab">+$1,120</div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="20%" y={-550}>
          <div className="bg-gradient-to-r from-[#00ffaa] to-[#00cc88] text-black font-bold text-lg px-5 py-2 rounded-full shadow-lg hover:cursor-grab">+24.5%</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="75%" y={-500}>
          <div className="bg-gradient-to-r from-[#00ffaa] to-[#00cc88] text-black font-bold text-base px-4 py-1.5 rounded-full shadow-lg hover:cursor-grab">+18.7%</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="40%" y={-600}>
          <div className="bg-[#00ffaa]/80 text-black font-bold text-sm px-3 py-1 rounded-full shadow-lg hover:cursor-grab">+8.3%</div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.3 }} x="55%" y={-700}>
          <div className="bg-[#ff4466] text-white font-bold text-xs px-3 py-1 rounded-lg shadow-lg hover:cursor-grab">-$85</div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="30%" y={-150} bodyType="circle">
          <div className="hover:cursor-grab"><BitcoinIcon size={56} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="65%" y={-220} bodyType="circle">
          <div className="hover:cursor-grab"><EthereumIcon size={52} /></div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="20%" y={-300} bodyType="circle">
          <div className="hover:cursor-grab"><SolanaIcon size={44} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="50%" y={-350} bodyType="circle">
          <div className="hover:cursor-grab"><BnbIcon size={44} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="80%" y={-400} bodyType="circle">
          <div className="hover:cursor-grab"><TetherIcon size={40} /></div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="40%" y={-450} bodyType="circle">
          <div className="hover:cursor-grab"><XrpIcon size={36} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="70%" y={-520} bodyType="circle">
          <div className="hover:cursor-grab"><DogeIcon size={36} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="25%" y={-580} bodyType="circle">
          <div className="hover:cursor-grab"><BitcoinIcon size={32} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="85%" y={-550} bodyType="circle">
          <div className="hover:cursor-grab"><EthereumIcon size={32} /></div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="35%" y={-280}>
          <div className="hover:cursor-grab shadow-lg rounded-lg"><BinanceIcon size={48} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="60%" y={-620}>
          <div className="hover:cursor-grab shadow-lg rounded-lg"><BybitIcon size={44} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="15%" y={-480}>
          <div className="hover:cursor-grab shadow-lg rounded-lg"><OkxIcon size={40} /></div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.2 }} x="55%" y={-130}>
          <div className="bg-gradient-to-r from-[#00ffaa] to-[#00cc88] text-black font-bold text-sm px-4 py-2 rounded-full shadow-lg hover:cursor-grab">87% Win Rate</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.5, restitution: 0.2 }} x="30%" y={-680}>
          <div className="bg-[#4488ff] text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg hover:cursor-grab">+247% ROI</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.3 }} x="75%" y={-720}>
          <div className="bg-[#00ffaa]/20 border border-[#00ffaa]/40 text-[#00ffaa] font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg hover:cursor-grab backdrop-blur-sm">LONG</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.3 }} x="18%" y={-760}>
          <div className="bg-[#00ffaa]/20 border border-[#00ffaa]/40 text-[#00ffaa] font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg hover:cursor-grab backdrop-blur-sm">LONG</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.3 }} x="45%" y={-800}>
          <div className="bg-[#ff4466]/20 border border-[#ff4466]/40 text-[#ff4466] font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg hover:cursor-grab backdrop-blur-sm">SHORT</div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="22%" y={-850} bodyType="circle">
          <div className="bg-[#00ffaa]/20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:cursor-grab border border-[#00ffaa]/30">
            <TrendingUpIcon size={28} />
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="78%" y={-820} bodyType="circle">
          <div className="bg-[#00ffaa]/20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:cursor-grab border border-[#00ffaa]/30">
            <TrendingUpIcon size={24} />
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.5 }} x="50%" y={-900} bodyType="circle">
          <div className="bg-[#ff4466]/20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:cursor-grab border border-[#ff4466]/30">
            <TrendingDownIcon size={20} />
          </div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.4 }} x="65%" y={-860}>
          <div className="bg-[#1a1a2e] p-2 rounded-lg shadow-lg hover:cursor-grab border border-white/10">
            <CandlestickIcon size={32} />
          </div>
        </MatterBody>

        {}
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.6 }} x="12%" y={-950} bodyType="circle">
          <div className="hover:cursor-grab"><BitcoinIcon size={28} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.3, restitution: 0.6 }} x="88%" y={-920} bodyType="circle">
          <div className="hover:cursor-grab"><EthereumIcon size={28} /></div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="38%" y={-980}>
          <div className="bg-[#00ffaa]/80 text-black font-bold text-xs px-2 py-1 rounded shadow-lg hover:cursor-grab">+$234</div>
        </MatterBody>
        <MatterBody matterBodyOptions={{ friction: 0.4, restitution: 0.4 }} x="62%" y={-1000}>
          <div className="bg-[#00cc88] text-black font-bold text-xs px-2 py-1 rounded shadow-lg hover:cursor-grab">+$567</div>
        </MatterBody>
      </Gravity>
    </div>
  );
}
