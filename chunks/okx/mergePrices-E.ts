import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

interface OkxTicker {
    instType: string;
    instId: string;
    last: string;
    volCcy24h: string;
    ts: string;
}

interface CoinCapAsset {
    symbol: string;
    priceUsd: string;
    marketCapUsd?: string;
    volumeUsd24Hr?: string;
}

interface MergedTicker {
    symbol: string;
    okx: {
        price: number;
        volume24h: number;
        timestamp: number;
    };
    coinCap?: {
        price: number;
        marketCap?: number;
        volume?: number;
        timestamp: number;
    };
}

const mergeCryptoPrices = (): void => {
    try {
        
        const okxTickers: OkxTicker[] = require('./okxParser/jsons/prices.json');
        const coinCapAssets: CoinCapAsset[] = require('./coincap/jsons/coincap_prices.json');

        const coinCapMap = new Map<string, CoinCapAsset>();
        coinCapAssets.forEach(asset => {
            coinCapMap.set(asset.symbol.toUpperCase(), {
                ...asset,
                priceUsd: asset.priceUsd,
                marketCapUsd: asset.marketCapUsd || '0',
                volumeUsd24Hr: asset.volumeUsd24Hr || '0'
            });
        });

        const mergedData: MergedTicker[] = okxTickers.map(ticker => {
            const [baseSymbol] = ticker.instId.split('-');
            const normalizedSymbol = baseSymbol.toUpperCase();

            const coinCapAsset = coinCapMap.get(normalizedSymbol);

            const result: MergedTicker = {
                symbol: normalizedSymbol,
                okx: {
                    price: parseFloat(ticker.last),
                    volume24h: parseFloat(ticker.volCcy24h),
                    timestamp: parseInt(ticker.ts)
                }
            };

            if (coinCapAsset) {
                result.coinCap = {
                    price: parseFloat(coinCapAsset.priceUsd),
                    marketCap: coinCapAsset.marketCapUsd ?
                        parseFloat(coinCapAsset.marketCapUsd) : undefined,
                    volume: coinCapAsset.volumeUsd24Hr ?
                        parseFloat(coinCapAsset.volumeUsd24Hr) : undefined,
                    timestamp: Date.now()
                };
            }

            return result;
        });

        fs.writeFileSync(
            './jsons/merged_prices.json',
            JSON.stringify(mergedData, null, 2)
        );

        const withCoinCap = mergedData.filter(t => t.coinCap).length;
        console.log(`Обработано тикеров: ${mergedData.length}`);
        console.log(`Из них с данными CoinCap: ${withCoinCap}`);
        console.log(`Без данных CoinCap: ${mergedData.length - withCoinCap}`);

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Ошибка: ${error.message}`);
        } else {
            console.error('Неизвестная ошибка:', error);
        }
        process.exit(1);
    }
};

mergeCryptoPrices();
