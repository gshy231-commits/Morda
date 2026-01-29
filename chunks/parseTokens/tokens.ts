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
    trade_url: string;
    token_info_url: string | null;
    coin_id: string;
    target_coin_id: string;
}

async function main() {
    try {
        const fileContent = await fs.readFile('cexes.json', 'utf8');
        const exchanges: Exchange[] = JSON.parse(fileContent);

        const allTickers: Ticker[] = [];

        for (const exchange of exchanges) {
            console.log(`Обработка биржи ${exchange.name}`);
            const tickers = await getAllTickersForExchange(exchange.id);
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

        await fs.writeFile(
            'output.json',
            JSON.stringify(uniqueTickers, null, 2),
            'utf8'
        );
        console.log(`Сохранено ${uniqueTickers.length} уникальных тикеров`);

    } catch (error) {
        console.error('Ошибка выполнения:', error);
    }
}

async function getAllTickersForExchange(exchangeId: string): Promise<Ticker[]> {
    const allTickers: Ticker[] = [];
    let page = 1;

    while (true) {
        const tickers = await getTickersPage(exchangeId, page);
        if (tickers.length === 0) break;
        allTickers.push(...tickers);
        page++;
        await delay(2000); 
    }

    return allTickers;
}

async function getTickersPage(exchangeId: string, page: number): Promise<Ticker[]> {
    const url = `https://api.coingecko.com/api/v3/exchanges/${exchangeId}/tickers?page=${page}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-tyvnpsnUck4WDGkvkRjmbLPB'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.tickers || [];
    } catch (error) {
        console.error(`Ошибка страницы ${page} для ${exchangeId}:`, error);
        return [];
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
