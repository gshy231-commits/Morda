import React, { useState, useEffect } from "react";
import CryptoTile from "./CryptoTile";
import { ExchangeData, TileData } from "../interfaces/types";

// URL API (замени на свой)
const API_URL = "http://89.111.154.133/api/data/all";

const transformRecordToTile = (rec: ExchangeData): TileData => {
    console.log("Преобразование данных из API:", rec);

    const pair = `${rec.baseCoin} / ${rec.quoteCoin}`;

    const bid = rec.bidPrice.bybit || 0;
    const ask = rec.askPrice.bybit || 0;
    const percent = bid !== 0 ? (((ask - bid) / bid) * 100).toFixed(2) : "0.00";
    const direction = parseFloat(percent) >= 0 ? "🔺" : "🔻";

    return {
        pair,
        priceChange: {
            oldPrice: bid,
            newPrice: ask,
            percent,
            direction,
        },
        network: rec.baseCoin || "Unknown",
        liquidity: rec.bidSize.bybit || 0,
        fdv: 0,
        direction: "N/A",
        contract: rec.contract || "N/A",
        spreads: [
            {
                exchange: "Bybit",
                price: rec.lastPrice.bybit || 0,
                dif: rec.spread.bybit ? rec.spread.bybit.toString() : "0",
                profit: 0,
                dwStatus: { deposit: "available", withdraw: "available" },
            },
            {
                exchange: "OKX",
                price: rec.lastPrice.okx || 0,
                dif: rec.spread.okx ? rec.spread.okx.toString() : "0",
                profit: 0,
                dwStatus: { deposit: "available", withdraw: "available" },
            },
        ],
    };
};

const CryptoDashboard: React.FC = () => {
    const [tokens, setTokens] = useState<TileData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchData = async () => {
        setIsLoading(true);
        console.log("📡 Отправка запроса на API:", API_URL);

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("📩 Ответ от API:", response);

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
            }

            const text = await response.text(); // Читаем ответ как текст
            console.log("📜 Сырой ответ API:", text);

            try {
                const data: ExchangeData[] = JSON.parse(text);
                console.log("✅ Данные после парсинга:", data);

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("API вернул пустой массив.");
                }

                const transformed = data.map(transformRecordToTile);
                setTokens(transformed);
                setError("");
            } catch (parseError) {
                if (parseError instanceof Error) {
                    throw new Error(`Ошибка парсинга JSON: ${parseError.message}`);
                } else {
                    throw new Error("Ошибка парсинга JSON: неизвестная ошибка.");
                }
            }


        } catch (err) {
            console.error("🚨 Ошибка при загрузке данных:", err);
            setError(`Ошибка загрузки: ${err instanceof Error ? err.message : "Неизвестная ошибка"}`);
            setTokens([]);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
        // Для автообновления данных раз в 60 секунд раскомментируй строку ниже
        // const intervalId = setInterval(fetchData, 60000);
        // return () => clearInterval(intervalId);
    }, []);

    const refreshTile = () => {
        console.log("Обновление данных...");
        fetchData();
    };

    return (
        <>
            <style>{`
        body {
          background-color: #111;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .dashboard {
          display: grid;
          gap: 40px;
          padding: 24px;
          margin: 0 auto;
          max-width: 1200px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 600px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
        }
        .error-message {
          color: red;
          text-align: center;
          margin: 20px 0;
        }
      `}</style>

            <div className="dashboard">
                {isLoading && <p>Загрузка данных...</p>}
                {error && <p className="error-message">{error}</p>}
                {!isLoading && tokens.length === 0 && <p>Нет данных. Попробуйте позже.</p>}
                {!isLoading &&
                    tokens.map((token, index) => (
                        <CryptoTile key={index} token={token} index={index} refreshTile={refreshTile} />
                    ))}
            </div>
        </>
    );
};

export default CryptoDashboard;
