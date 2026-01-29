import { writeFile } from 'fs/promises';

interface ApiResponse {
    code: number;
    data: Currency[];
}

interface Currency {
    currency: string;
    assetType: number;
    chains: Chain[];
    instStatus: string;
}

interface Chain {
    chain: string;
    displayName: string;
    fullName: string;
    baseChain: string;
    baseChainProtocol: string;
    isDynamic: boolean;
    numOfConfirmations: number;
    numOfFastConfirmations: number;
    depositStatus: string;
    minDepositAmt: string;
    withdrawStatus: string;
    minWithdrawAmt: string;
    withdrawPrecision: number;
    maxWithdrawAmt: string;
    withdrawQuotaPerDay: string;
    withdrawQuotaPerYear: string | null;
    withdrawQuotaTotal: string | null;
    withdrawFeeType: string;
    transactFeeWithdraw: string;
    addrWithTag: boolean;
    addrDepositTag: boolean;
}

async function fetchCurrencies(): Promise<Currency[]> {
    try {
        const response = await fetch('https://api.huobi.pro/v2/reference/currencies?');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        if (data.code !== 200) {
            throw new Error(`API error: ${data.code}`);
        }
        return data.data;
    } catch (error) {
        console.error('Error fetching currencies:', error);
        throw error;
    }
}
async function saveToFile(data: Currency[], filename = './currencies.json') {
    try {
        const json = JSON.stringify(data, null, 2);
        await writeFile(filename, json, 'utf-8');
        console.log(`Данные успешно сохранены в ${filename}`);
    } catch (error) {
        console.error('Ошибка записи в файл:', error);
        throw error;
    }
}

fetchCurrencies()
    .then(async currencies => {
        await saveToFile(currencies); 
        console.log('Поддерживаемые валюты:', currencies.map(c => c.currency));
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
