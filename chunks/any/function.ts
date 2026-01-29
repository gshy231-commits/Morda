const API_URL = "http://89.111.154.133/api/data/all";

interface MarketData {
  symbol: string;
  contract: string;
  baseCoin: string;
  quoteCoin: string;
  lastPrice: { [exchange: string]: number };
}

const exchangeGroups = {
  CEX: ["bybit", "okx", "mexc"],
  DEX: ["jupiter"]
};

function calculateSpread(priceA: number, priceB: number): number {
  if (priceA === 0 || priceB === 0) return 0;
  const diff = Math.abs(priceA - priceB);
  return Math.round((diff * 100 / Math.min(priceA, priceB)) * 100) / 100;
}

function findArbitrageOpportunities(data: MarketData[]) {
  const opportunities: { symbol: string; from: string; to: string; spread: number }[] = [];

  data.forEach(market => {
    const { symbol, lastPrice } = market;

    const cexPrices = exchangeGroups.CEX
      .map(cex => ({ exchange: cex, price: lastPrice[cex] }))
      .filter(item => item.price > 0);

    const dexPrices = exchangeGroups.DEX
      .map(dex => ({ exchange: dex, price: lastPrice[dex] }))
      .filter(item => item.price > 0);

    for (const cex of cexPrices) {
      for (const dex of dexPrices) {
        const spread = calculateSpread(cex.price, dex.price);
        if (spread === 0) continue;

        if (cex.price > dex.price) {
          opportunities.push({ symbol, from: dex.exchange, to: cex.exchange, spread });
        }
        if (dex.price > cex.price) {
          opportunities.push({ symbol, from: cex.exchange, to: dex.exchange, spread });
        }
      }
    }
  });

  return opportunities.sort((a, b) => b.spread - a.spread);
}

async function fetchMarketData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);

    const marketData: MarketData[] = await response.json();
    const opportunities = findArbitrageOpportunities(marketData);

    if (opportunities.length > 0) {
      console.log("Найденные арбитражные возможности:");
      opportunities.forEach(op => {
        console.log(`Для ${op.symbol}: покупаем на ${op.from}, продаём на ${op.to}, спред: ${op.spread}%`);
      });
    } else {
      console.log("Нет арбитражных возможностей");
    }
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
}

fetchMarketData();
