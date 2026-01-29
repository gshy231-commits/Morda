import * as fs from 'fs';
import * as path from 'path';

interface Coin {
    coinId: string;
    symbol: string;
    baseCoin: string;
    targetCoin: string;
    name: string;
    platforms: { [key: string]: string };
    lastPrice: { [key: string]: number };
    spread: { [key: string]: number };
    arbitrage: {
        direction: string | null;
        spread: number | null;
        bestPair: [string, string] | null;
    };
}

const DEX_EXCHANGES = ['jupiter'];
const CEX_EXCHANGES = [
    'okex', 'bybit_spot', 'mxc', 'bitget', 'lbank',
    'coinbase_international', 'gate', 'kraken', 'bingx', 'kucoin', 'huobi'
];

export function calculateSpreadsAndArbitrage(coins: Coin[]): void {
    coins.forEach(coin => {
        const dexPrices: { [key: string]: number } = {};
        const cexPrices: { [key: string]: number } = {};

        Object.entries(coin.lastPrice).forEach(([exchange, price]) => {
            if (price === 0) return;
            if (DEX_EXCHANGES.includes(exchange)) {
                dexPrices[exchange] = price;
            } else if (CEX_EXCHANGES.includes(exchange)) {
                cexPrices[exchange] = price;
            }
        });

        if (Object.keys(dexPrices).length === 0 || Object.keys(cexPrices).length === 0) {
            coin.arbitrage = { direction: null, spread: null, bestPair: null };
            return;
        }

        const maxDex = Math.max(...Object.values(dexPrices));
        const minCex = Math.min(...Object.values(cexPrices));
        const minDex = Math.min(...Object.values(dexPrices));
        const maxCex = Math.max(...Object.values(cexPrices));

        const arbitrageOptions = [
            {
                direction: 'CEX → DEX',
                spread: ((maxDex - minCex) / minCex) * 100,
                pair: [findKey(cexPrices, minCex), findKey(dexPrices, maxDex)] as [string, string]
            },
            {
                direction: 'DEX → CEX',
                spread: ((maxCex - minDex) / minDex) * 100,
                pair: [findKey(dexPrices, minDex), findKey(cexPrices, maxCex)] as [string, string]
            }
        ];

        const bestArbitrage = arbitrageOptions.reduce((prev, curr) =>
                Math.abs(curr.spread) > Math.abs(prev.spread) ? curr : prev,
            arbitrageOptions[0]
        );

        coin.arbitrage = {
            direction: Math.abs(bestArbitrage.spread) > 0.01 ? bestArbitrage.direction : null,
            spread: Math.abs(bestArbitrage.spread) > 0.01 ? Math.round(bestArbitrage.spread * 100) / 100 : null,
            bestPair: Math.abs(bestArbitrage.spread) > 0.01 ? bestArbitrage.pair : null
        };

        const allPrices = Object.values(coin.lastPrice).filter(p => p !== 0);
        if (allPrices.length === 0) return;

        const minPrice = Math.min(...allPrices);

        Object.keys(coin.lastPrice).forEach(exchange => {
            const price = coin.lastPrice[exchange];
            if (price === 0) {
                coin.spread[exchange] = 0;
            } else {
                const spreadVal = ((price - minPrice) / minPrice) * 100;
                coin.spread[exchange] = Math.round(spreadVal * 100) / 100;
            }
        });
    });
}

function findKey(obj: { [key: string]: number }, value: number): string {
    return Object.keys(obj).find(key => obj[key] === value)!;
}

async function processJsonFile(inputPath: string, outputPath: string): Promise<void> {
    try {
        const data = fs.readFileSync(inputPath, 'utf8');
        const coins: Coin[] = JSON.parse(data);

        coins.forEach(coin => {
            if (!coin.spread) coin.spread = {};
            if (!coin.arbitrage) coin.arbitrage = { direction: null, spread: null, bestPair: null };
        });

        calculateSpreadsAndArbitrage(coins);

        const allArbitrages = coins
            .filter(coin => coin.arbitrage.spread && Math.abs(coin.arbitrage.spread!) > 0.01)
            .map(coin => ({
                coinName: coin.name,
                direction: coin.arbitrage.direction!,
                spread: coin.arbitrage.spread!,
                pair: coin.arbitrage.bestPair!
            }));

        allArbitrages.sort((a, b) => b.spread - a.spread);

        console.log('\n\nТоп 10 арбитражных возможностей:');
        allArbitrages.slice(0, 10).forEach((arbitrage, idx) => {
            console.log(`#${idx + 1}`);
            console.log(`Монета: ${arbitrage.coinName}`);
            console.log(`Направление: ${arbitrage.direction}`);
            console.log(`Спред: ${arbitrage.spread.toFixed(2)}%`);
            console.log(`Пара: ${arbitrage.pair[0]} → ${arbitrage.pair[1]}`);
            console.log('------------------');
        });

        fs.writeFileSync(outputPath, JSON.stringify(coins, null, 2));
        console.log(`\nДанные сохранены в ${outputPath}`);

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

const inputPath = path.join(__dirname, 'input-coins.json.json');
const outputPath = path.join(__dirname, 'output.json');

processJsonFile(inputPath, outputPath).catch(console.error);
