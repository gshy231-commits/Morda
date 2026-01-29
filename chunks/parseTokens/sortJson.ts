import * as fs from 'fs/promises';

interface Ticker {
    base: string;
    target: string;
    market: {
        name: string;
        identifier: string;
        has_trading_incentive: boolean;
    };
    last: number;
    volume: number;
    converted_last: {
        btc: number;
        eth: number;
        usd: number;
    };
    converted_volume: {
        btc: number;
        eth: number;
        usd: number;
    };
    trust_score: string;
    bid_ask_spread_percentage: number;
    timestamp: string;
    last_traded_at: string;
    last_fetch_at: string;
    is_anomaly: boolean;
    is_stale: boolean;
    trade_url: string;
    token_info_url: string | null;
    coin_id: string;
    target_coin_id: string;
}

interface AggregatedCoin {
    coin_id: string;
    name: string;
    pairs: {
        target: string;
        markets: Ticker[];
    }[];
}

async function main() {
    try {
        const fileContent = await fs.readFile('output.json', 'utf8');
        const tickers: Ticker[] = JSON.parse(fileContent);

        const aggregatedCoins = aggregateByCoins(tickers);

        await fs.writeFile(
            'aggregated_coins_full.json',
            JSON.stringify(aggregatedCoins, null, 2),
            'utf8'
        );
        console.log(`Сохранено ${aggregatedCoins.length} монет`);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function aggregateByCoins(tickers: Ticker[]): AggregatedCoin[] {
    const coinsMap = new Map<string, AggregatedCoin>();

    for (const ticker of tickers) {
        const coinId = ticker.coin_id;
        let coinEntry = coinsMap.get(coinId);

        if (!coinEntry) {
            coinEntry = {
                coin_id: coinId,
                name: getCoinNameFromId(coinId),
                pairs: []
            };
            coinsMap.set(coinId, coinEntry);
        }

        const target = ticker.target;
        let pairEntry = coinEntry.pairs.find(p => p.target === target);

        if (!pairEntry) {
            pairEntry = { target, markets: [] };
            coinEntry.pairs.push(pairEntry);
        }

        pairEntry.markets.push(ticker); 
    }

    return Array.from(coinsMap.values());
}

function getCoinNameFromId(coinId: string): string {
    const nameMap: { [key: string]: string } = {
        'bitcoin': 'Bitcoin',
        'ethereum': 'Ethereum',
        'solana': 'Solana',
        
    };
    return nameMap[coinId] || coinId;
}

main().catch(console.error);
