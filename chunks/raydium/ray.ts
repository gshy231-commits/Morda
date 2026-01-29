import * as fs from 'fs/promises';

type ArbitrageOpportunity = {
    buyExchange: string;
    sellExchange: string;
    buyType: "dex" | "cex";
    sellType: "dex" | "cex";
    profitMargin: number; 
    direction: string;    
};

type Coin = {
    baseContract: string;
    isDepositAllowed: { [exchange: string]: boolean };
    isWithdrawAllowed: { [exchange: string]: boolean };
    lastPrice: { [exchange: string]: number };
    spread: { [exchange: string]: number };
    maxSpread?: number;
    
    arbitrageOpportunities?: ArbitrageOpportunity[];
};
const excludedExchanges = ["poloniex"];

function calculateSpreadsAndSort(coins: Coin[]): Coin[] {
    
    const dexExchanges = ["jupiter"];

    coins.forEach(coin => {
        
        const availableExchanges: string[] = [];
        for (const exchange in coin.isDepositAllowed) {
            if (
                coin.isDepositAllowed[exchange] &&
                coin.isWithdrawAllowed[exchange] &&
                !excludedExchanges.includes(exchange)
            ) {
                availableExchanges.push(exchange);
            }
        }

        if (availableExchanges.length < 2) {
            coin.maxSpread = 0;
            coin.arbitrageOpportunities = [];
            return;
        }

        const validPrices: { [exchange: string]: number } = {};
        for (const exchange of availableExchanges) {
            if (
                coin.lastPrice[exchange] !== undefined &&
                !excludedExchanges.includes(exchange)
            ) {
                validPrices[exchange] = coin.lastPrice[exchange];
            }
        }

        const prices = Object.values(validPrices);
        
        if (prices.length < 2) {
            coin.maxSpread = 0;
            coin.arbitrageOpportunities = [];
            return;
        }

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        coin.maxSpread = ((maxPrice - minPrice) * 100) / minPrice;

        coin.spread = {};
        for (const exchange in validPrices) {
            const price = validPrices[exchange];
            const spread = ((price - minPrice) * 100) / minPrice;
            coin.spread[exchange] = spread;
        }

        const opportunities: ArbitrageOpportunity[] = [];
        for (let i = 0; i < availableExchanges.length; i++) {
            const buyExchange = availableExchanges[i];
            const buyPrice = validPrices[buyExchange];
            
            const buyType: "dex" | "cex" = dexExchanges.includes(buyExchange) ? "dex" : "cex";

            for (let j = 0; j < availableExchanges.length; j++) {
                
                if (i === j) continue;

                const sellExchange = availableExchanges[j];
                const sellPrice = validPrices[sellExchange];
                
                const sellType: "dex" | "cex" = dexExchanges.includes(sellExchange) ? "dex" : "cex";

                if (buyPrice < sellPrice) {
                    const profitMargin = ((sellPrice - buyPrice) * 100) / buyPrice;
                    const direction = `${buyType}-${sellType}`;
                    opportunities.push({
                        buyExchange,
                        sellExchange,
                        buyType,
                        sellType,
                        profitMargin,
                        direction
                    });
                }
            }
        }
        coin.arbitrageOpportunities = opportunities;
    });

    return coins.sort((a, b) => (b.maxSpread || 0) - (a.maxSpread || 0));
}

function logSpreads(coins: Coin[]): void {
    console.log("Результат сортировки и арбитражных возможностей:");
    coins.forEach((coin, index) => {
        console.log(`\nМонета ${index + 1}:`);
        console.log(`- Base Contract: ${coin.baseContract}`);
        console.log(`- Максимальный спред: ${coin.maxSpread?.toFixed(2)}%`);
        console.log(`- Спреды по биржам:`);
        for (const [exchange, spread] of Object.entries(coin.spread)) {
            console.log(`  ${exchange}: ${spread.toFixed(2)}%`);
        }
        
        if (coin.arbitrageOpportunities && coin.arbitrageOpportunities.length > 0) {
            console.log(`- Найденные возможности арбитража:`);
            coin.arbitrageOpportunities.forEach((opp, idx) => {
                console.log(`  Вариант ${idx + 1}:`);
                console.log(`    Купить на: ${opp.buyExchange} (${opp.buyType}) по цене ${validPriceString(coin.lastPrice[opp.buyExchange])}`);
                console.log(`    Продать на: ${opp.sellExchange} (${opp.sellType}) по цене ${validPriceString(coin.lastPrice[opp.sellExchange])}`);
                console.log(`    Доходность: ${opp.profitMargin.toFixed(2)}%`);
                console.log(`    Направление: ${opp.direction}`);
            });
        } else {
            console.log(`- Возможностей арбитража не найдено`);
        }
    });
}

function validPriceString(price: number | undefined): string {
    return price !== undefined ? price.toString() : '';
}

async function main() {
    try {
        
        const data = await fs.readFile('dicti.json', 'utf-8');
        const coins = JSON.parse(data) as Coin[];

        const processedCoins = calculateSpreadsAndSort(coins);

        logSpreads(processedCoins);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

main();
