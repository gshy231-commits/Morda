"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#030306] flex items-center justify-center">
      <div className="text-center">
        {}
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid rgba(0,255,170,0.1)",
            }}
          />
          <div 
            className="absolute inset-0 rounded-full will-change-transform"
            style={{
              border: "2px solid transparent",
              borderTopColor: "#00ffaa",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
        <div className="text-[#5a5a6f] text-xs uppercase tracking-widest">Loading</div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
