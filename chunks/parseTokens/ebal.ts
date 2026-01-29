import * as fs from 'fs/promises';

interface Exchange {
    id: string;
    name: string;
}

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
    trade_url: string | null;
    token_info_url: string | null;
    coin_id: string;
    target_coin_id: string;
}

interface CoinContractData {
    id: string;
    platforms: {
        [chain: string]: {
            address: string;
            chain_id?: number;
        };
    };
}

interface AggregatedCoin {
    coin_id: string;
    name: string;
    contract_addresses: {
        [chain: string]: {
            address: string;
            chain_id?: number;
        };
    };
    pairs: {
        target: string;
        markets: Ticker[];
    }[];
}

const contractCache = new Map<string, CoinContractData>();
const chainIdMap: { [chain: string]: number } = {
    ethereum: 1,
    binance_smart_chain: 56,
    polygon_pos: 137,
    solana: 101,
    avalanche: 43114,
};

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTickers(exchangeId: string): Promise<Ticker[]> {
    const allTickers: Ticker[] = [];
    let page = 1;

    while (true) {
        const url = `https://api.coingecko.com/api/v3/exchanges/${exchangeId}/tickers?page=${page}`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': 'YOUR_API_KEY' 
            },
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
            const data = await response.json();
            allTickers.push(...data.tickers || []);
            page++;
            await delay(2000); 
        } catch (error) {
            console.error(`Ошибка при загрузке ${exchangeId} (страница ${page}):`, error);
            break;
        }
    }

    return allTickers;
}

async function getCoinContract(coinId: string): Promise<CoinContractData | null> {
    if (contractCache.has(coinId)) return contractCache.get(coinId);

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-tyvnpsnUck4WDGkvkRjmbLPB' 
        },
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) return null;
        const data = await response.json();

        const platformsWithData = Object.entries(data.platforms).reduce(
            (acc, [chain, address]) => {
                const chainId = chainIdMap[chain.toLowerCase()];
                acc[chain] = {address, chain_id: chainId};
                return acc;
            },
            {} as { [chain: string]: { address: string; chain_id?: number } }
        );

        const contractData: CoinContractData = {
            id: data.id,
            platforms: platformsWithData,
        };
        contractCache.set(coinId, contractData);
        return contractData;
    } catch (error) {
        console.error(`Ошибка при запросе контракта для ${coinId}:`, error);
        return null;
    }
}

async function aggregateCoins(tickers: Ticker[]): Promise<AggregatedCoin[]> {
    const coinsMap = new Map<string, AggregatedCoin>();
    const uniqueCoins = Array.from(new Set(tickers.map(t => t.coin_id)));

    const chunks = chunkArray(uniqueCoins, 10);
    for (const chunk of chunks) {
        const contracts = await Promise.all(chunk.map(getCoinContract));
        contracts.forEach(contract => {
            if (contract) contractCache.set(contract.id, contract);
        });
        await delay(2000); 
    }

    for (const ticker of tickers) {
        const coinId = ticker.coin_id;
        let coinEntry = coinsMap.get(coinId);

        if (!coinEntry) {
            const contract = contractCache.get(coinId) || {platforms: {}};
            coinEntry = {
                coin_id: coinId,
                name: getCoinNameFromId(coinId),
                contract_addresses: contract.platforms,
                pairs: [],
            };
            coinsMap.set(coinId, coinEntry);
        }

        const target = ticker.target;
        let pairEntry = coinEntry.pairs.find(p => p.target === target);
        if (!pairEntry) {
            pairEntry = {target, markets: []};
            coinEntry.pairs.push(pairEntry);
        }
        pairEntry.markets.push(ticker);
    }

    return Array.from(coinsMap.values());
}

function chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
        array.slice(i * size, (i + 1) * size)
    );
}

function getCoinNameFromId(coinId: string): string {
    const nameMap: { [key: string]: string } = {
        'bitcoin': 'Bitcoin',
        'ethereum': 'Ethereum',
        'mantra-dao': 'MANTRA DAO',
        
    };
    return nameMap[coinId] || coinId;
}

async function main() {
    try {
        
        const exchangeFileContent = await fs.readFile('cexes.json', 'utf8');
        const exchanges = JSON.parse(exchangeFileContent) as Exchange[];

        const allTickers: Ticker[] = [];
        for (const exchange of exchanges) {
            console.log(`Обработка биржи ${exchange.name}`);
            const tickers = await fetchTickers(exchange.id);
            allTickers.push(...tickers);
            await delay(2000); 
        }

        const filteredTickers = allTickers.filter(ticker =>
            ['tether', 'usd-coin'].includes(ticker.target_coin_id)
        );

        const uniqueTickers = filteredTickers.filter((ticker, index, self) => {
            return self.findIndex(t =>
                t.base === ticker.base &&
                t.target === ticker.target &&
                t.market.identifier === ticker.market.identifier
            ) === index;
        });

        const aggregatedCoins = await aggregateCoins(uniqueTickers);

        await fs.writeFile(
            'output.json',
            JSON.stringify(aggregatedCoins, null, 2),
            'utf8'
        );
        console.log(`Сохранено ${aggregatedCoins.length} агрегированных монет`);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

main().catch(console.error);
