import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const allowedChains = [1, 324, 8453, 5000, 137, 10, 34443, 43114, 59144, 534352, 42161, 146, 56, 250, 252];

const chainMapping: Record<string, number> = {
    BSC: 56,
    ETH: 1,
    BASE: 8453,
    MATIC: 137,
    OPTIMISM: 10,
    ARBI: 42161,
    AURORA: 5000,
    HARMONY: 324,
    ZKSYNC_ERA: 34443,
    AVAX: 43114,
    POLYGON_ZKEVM: 59144,
    SCROLL: 534352,
    ZKSYNC_1: 146,
    FTM: 250,
    CELO: 252,
};

interface BybitToken {
    name: string;
    coin: string;
    remainAmount: string;
    chains: Array<{
        chainType: string;
        confirmation: string;
        withdrawFee: string;
        depositMin: string;
        withdrawMin: string;
        chain: string;
        chainDeposit: string;
        chainWithdraw: string;
        minAccuracy: string;
        withdrawPercentageFee: string;
        contractAddress: string;
    }>;
}

interface BybitData {
    retCode: number;
    retMsg: string;
    result: {
        rows: BybitToken[];
    };
}

async function loadBybitData(filePath: string): Promise<BybitData> {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        throw new Error(`Ошибка загрузки файла: ${error.message}`);
    }
}

function collectTokenAddresses(data: BybitData): Record<number, { name: string; address: string }[]> {
    
    const result: Record<number, { name: string; address: string }[]> = Object.fromEntries(
        allowedChains.map(id => [id, []])
    );

    for (const token of data.result.rows) {
        for (const chain of token.chains) {
            
            const contractAddress = chain.contractAddress.trim();
            if (!contractAddress || contractAddress === '""') continue;

            const chainName = chain.chain.trim();
            
            if (!chainMapping.hasOwnProperty(chainName)) {
                console.warn(`Цепь ${chainName} не поддерживается`);
                continue;
            }
            const chainId = chainMapping[chainName];

            if (allowedChains.includes(chainId)) {
                result[chainId].push({
                    name: token.name,
                    address: contractAddress,
                });
            } else {
                console.warn(`Цепь ${chainName} (ID ${chainId}) не входит в разрешённые`);
            }
        }
    }
    return result;
}

async function fetchPrices(
    tokenAddressesByChain: Record<number, { name: string; address: string }[]>
): Promise<Record<number, any[]>> {
    const results: Record<number, any[]> = {};

    const requestFunctions = Object.entries(tokenAddressesByChain).map(([chainIdStr, addresses]) => {
        return async () => {
            const chainId = parseInt(chainIdStr);
            if (addresses.length === 0) return;

            const chunkSize = 30;
            const chunks = [];
            for (let i = 0; i < addresses.length; i += chunkSize) {
                chunks.push(addresses.slice(i, i + chunkSize));
            }

            for (const chunk of chunks) {
                const params = chunk
                    .map(addr => `token_addresses=${encodeURIComponent(addr.address)}`)
                    .join('&');
                const url = `https://api.odos.xyz/pricing/token/${chainId}?${params}`;

                try {
                    const response = await axios.get(url);
                    if (response.status === 200) {
                        const prices = response.data.prices || [];
                        results[chainId] = [...(results[chainId] || []), ...prices];
                        console.log(`✅ Успешно: ${chainId} (${prices.length} цен)`);
                    }
                } catch (error: any) {
                    if (axios.isAxiosError(error)) {
                        console.error(`❌ Ошибка ${error.response?.status} для ${url}: ${error.message}`);
                    } else {
                        console.error(`❌ Ошибка для ${url}: ${error.message}`);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }
        };
    });

    const MAX_CONCURRENT_REQUESTS = 5;
    const inFlight: Promise<void>[] = [];

    for (const reqFn of requestFunctions) {
        while (inFlight.length >= MAX_CONCURRENT_REQUESTS) {
            await Promise.race(inFlight);
            
            inFlight.shift();
        }
        const p = reqFn();
        inFlight.push(p);
    }
    await Promise.all(inFlight);
    return results;
}

async function main() {
    const filePath = path.join(__dirname, 'Bybit_Contracts.json');
    const bybitData = await loadBybitData(filePath);

    const tokenAddresses = collectTokenAddresses(bybitData);
    const prices = await fetchPrices(tokenAddresses);

    for (const [chainId, chainPrices] of Object.entries(prices)) {
        console.log(`\nЦены для сети ${chainId}:`);
        if (chainPrices.length === 0) {
            console.log('  Нет данных');
            continue;
        }
        for (const price of chainPrices) {
            const tokenInfo = tokenAddresses[parseInt(chainId)].find(
                t => t.address === price.tokenAddress
            );
            console.log(`  Название: ${tokenInfo?.name || 'Неизвестный'}`);
            console.log(`  Адрес: ${price.tokenAddress}`);
            console.log(`  Цена: ${price.price || 'N/A'}`);
            console.log(`  USD-цена: ${price.priceUsd || 'N/A'}`);
            console.log('  -----------------------------');
        }
    }
}

main().catch(error => {
    console.error('Произошла ошибка:', error);
});
