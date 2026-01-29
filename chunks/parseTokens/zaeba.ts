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
    
    contract_addresses?: { [chain: string]: string };
}

async function main() {
    try {
        
        const fileContent = await fs.readFile('output.json', 'utf8');
        let tickers: Ticker[] = JSON.parse(fileContent);

        const uniqueCoins = Array.from(new Set(tickers.map(t => t.coin_id)));

        const contractsMap = await getContractsForCoins(uniqueCoins);

        const enhancedTickers = tickers.map(ticker => {
            const contractData = contractsMap.get(ticker.coin_id) || {};
            return {
                ...ticker,
                contract_addresses: contractData.platforms || {}
            };
        });

        await fs.writeFile(
            'output_with_contracts.json',
            JSON.stringify(enhancedTickers, null, 2),
            'utf8'
        );
        console.log('Данные сохранены с адресами контрактов');

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function getContractsForCoins(coins: string[]): Promise<Map<string, { platforms: Record<string, string> }>> {
    const contractsMap = new Map<string, { platforms: Record<string, string> }>();
    for (const coinId of coins) {
        const data = await fetchCoinData(coinId);
        if (data) contractsMap.set(coinId, data);
        await delay(2000); 
    }
    return contractsMap;
}

async function fetchCoinData(coinId: string): Promise<{ platforms: Record<string, string> } | null> {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-tyvnpsnUck4WDGkvkRjmbLPB'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) return null;
        const data = await response.json();
        return {
            platforms: data.platforms || {}
        };
    } catch (error) {
        console.error(`Ошибка для ${coinId}:`, error);
        return null;
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
