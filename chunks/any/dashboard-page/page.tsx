"use client";

import { useEffect, useState } from "react";

interface RowData {
  name: string;
  OKX: { price: string; ping: string };
  MEXC: number;
  CoinCap: number;
  Bybit: number;
  "5": number;
  "6": number;
  "7": number;
  "8": number;
}

export default function Dashboard() {
  const [data, setData] = useState<RowData[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/okxDataCollector");
      const json = await res.json();

      if (json.tickers && json.tickers.length > 0) {
        const now = Date.now(); 

        const tickers = json.tickers.map((ticker: any) => ({
          name: ticker.instId,
          OKX: {
            price: `${parseFloat(ticker.last).toFixed(4)} usdt`,
            ping: `${now - ticker.ts} ms`
          },
          MEXC: 0,
          CoinCap: 0,
          Bybit: 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
        }));

        setData(tickers);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-gray-100">
      {/* Хедер */}
      <header className="w-full bg-gray-800 shadow-md">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
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

      {/* Контейнер с таблицей */}
      <div className="container mx-auto p-4 bg-gray-800 shadow-md rounded-lg mt-4 w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              {["#", "OKX", "MEXC", "CoinCap", "Bybit", "5", "6", "7", "8"].map((col) => (
                <th key={col} className="border border-gray-700 p-2 font-bold text-center w-1/9">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="text-center border border-gray-700 bg-gray-800">
                <td className="border border-gray-700 p-2 font-bold w-1/9">{row.name}</td>
                <td className="border border-gray-700 p-2 w-1/9">
                  <span>{row.OKX.price}</span>
                  <br />
                  <span className="text-sm text-gray-400">{row.OKX.ping}</span>
                </td>
                <td className="border border-gray-700 p-2 w-1/9">{row.MEXC}</td>
                <td className="border border-gray-700 p-2 w-1/9">{row.CoinCap}</td>
                <td className="border border-gray-700 p-2 w-1/9">{row.Bybit}</td>
                <td className="border border-gray-700 p-2 w-1/9">{row["5"]}</td>
                <td className="border border-gray-700 p-2 w-1/9">{row["6"]}</td>
                <td className="border border-gray-700 p-2 w-1/9">{row["7"]}</td>
                <td className="border border-gray-700 p-2 w-1/9">{row["8"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
