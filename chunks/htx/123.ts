import axios from 'axios';
import { writeFile } from 'fs/promises';

interface ChainInfo {
    chainName: string;
    withdrawalMinSize: string;
    depositMinSize: string | null;
    withdrawFeeRate: string;
    withdrawalMinFee: string;
    isWithdrawEnabled: boolean;
    isDepositEnabled: boolean;
    confirms: number;
    preConfirms: number;
    contractAddress: string;
    withdrawPrecision: number;
    maxWithdraw: string | null;
    maxDeposit: string | null;
    needTag: boolean;
    chainId: string;
}

interface Currency {
    currency: string;
    name: string;
    fullName: string;
    precision: number;
    confirms: string | null;
    contractAddress: string | null;
    isMarginEnabled: boolean;
    isDebitEnabled: boolean;
    chains?: ChainInfo[]; 
}

interface ApiResponse {
    code: string;
    data: Currency[];
}

async function fetchCurrencies() {
    try {
        const response = await axios.get<ApiResponse>('https://api.kucoin.com/api/v3/currencies');

        if (response.data.code === '200000' && response.data.data) {
            const formattedData = response.data.data.map(currency => ({
                ...currency,
                chains: currency.chains?.map(chain => ({
                    ...chain,
                    withdrawalMinSize: parseFloat(chain.withdrawalMinSize),
                    withdrawalMinFee: parseFloat(chain.withdrawalMinFee),
                })) ?? [] 
            }));

            await writeFile('currencies.json', JSON.stringify(formattedData, null, 2));
            console.log('Данные успешно сохранены в currencies.json');
        } else {
            console.error(`Ошибка API: ${response.data.code}`);
        }
    } catch (error) {
        console.error('Произошла ошибка:', error.message);
    }
}

fetchCurrencies();
