import fs from 'fs';
import path from 'path';

interface ChainInfo {
    chain: string;
    needTag: string;
    withdrawable: string;
    rechargeable: string;
    withdrawFee: string;
    extraWithdrawFee: string;
    depositConfirm: string;
    withdrawConfirm: string;
    minDepositAmount: string;
    minWithdrawAmount: string;
    browserUrl: string;
    contractAddress: string | null;
    withdrawStep: string;
    withdrawMinScale: string;
    congestion: string;
}

interface CoinData {
    coinId: string;
    coin: string;
    transfer: string;
    chains: ChainInfo[];
    areaCoin: string;
}

interface ApiResponse {
    code: string;
    msg: string;
    requestTime: number;
    data: CoinData[];
}

function extractUniqueChains(response: ApiResponse): string[] {
    const chainsSet = new Set<string>();
    response.data.forEach(coin => {
        coin.chains.forEach(chain => {
            chainsSet.add(chain.chain);
        });
    });
    return Array.from(chainsSet).sort();
}

const dataFilePath = path.join(__dirname, 'bitgetResponse.json');
const rawData = fs.readFileSync(dataFilePath, 'utf-8');
const originalData: ApiResponse = JSON.parse(rawData);

const uniqueChains = extractUniqueChains(originalData);
const output = { chains: uniqueChains };

const outputFilePath = path.join(__dirname, 'bitgetChains.json');
fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));

console.log(`Файл ${outputFilePath} успешно создан с ${uniqueChains.length} уникальными сетями`);
