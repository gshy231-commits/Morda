"use client";


const mockData = [
  { name: "BTC", jupiter: { price: 42500 }, okx: { price: 42480 }, mexc: { price: 42510 } },
  { name: "ETH", jupiter: { price: 3200 }, okx: { price: 3190 }, mexc: { price: 3210 } },
  { name: "SOL", jupiter: { price: 110 }, okx: { price: 108 }, mexc: { price: 109 } },
  { name: "ADA", jupiter: { price: 1.2 }, okx: { price: 1.18 }, mexc: { price: 1.19 } },
  { name: "XRP", jupiter: { price: 0.75 }, okx: { price: 0.73 }, mexc: { price: 0.74 } },
  { name: "DOT", jupiter: { price: 25 }, okx: { price: 24.8 }, mexc: { price: 24.9 } },
  { name: "LINK", jupiter: { price: 15 }, okx: { price: 14.8 }, mexc: { price: 14.9 } },
  { name: "LTC", jupiter: { price: 180 }, okx: { price: 178 }, mexc: { price: 179 } },
];

const calculateDifference = (dex: number, cex: number) => {
  return ((cex - dex) / dex * 100).toFixed(2);
};

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-gray-100 p-4">
      <header className="w-full bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto py-3 px-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">ToTheMoon</h1>
          <nav>
            <ul className="flex space-x-3 text-base">
              <li className="font-medium cursor-pointer text-gray-100">Dashboard</li>
              <li className="font-medium cursor-pointer text-gray-400 hover:text-gray-200">Settings</li>
              <li className="font-medium cursor-pointer text-gray-400 hover:text-gray-200">Profile</li>
            </ul>
          </nav>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 w-full max-w-6xl">
        {mockData.map((item, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-200">🔄</button>
            <h2 className="text-xl font-bold mb-2 text-left">{item.name}</h2>
            <div className="text-left">Jupiter: <span className="text-green-400">${item.jupiter.price}</span></div>
            <div className="text-left">OKX: <span className="text-blue-400">${item.okx.price}</span> <span className="text-red-400">({calculateDifference(item.jupiter.price, item.okx.price)}%)</span></div>
            <div className="text-left">MEXC: <span className="text-yellow-400">${item.mexc.price}</span> <span className="text-red-400">({calculateDifference(item.jupiter.price, item.mexc.price)}%)</span></div>
            <br></br>
            <div className="text-left font-semibold">DEX → CEX</div>
            <button className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-200">➡️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
