import axios from 'axios';
import fs from 'fs/promises';

interface Currency {
    currency: string;
    name: string;
    network: string;
    contract_address: string | null;
    withdraw_enabled: boolean;
    deposit_enabled: boolean;
    withdraw_minsize: string;
    recharge_minsize: string;
    withdraw_minfee: string;
    withdraw_fee_estimate: string;
    withdraw_fee: string;
}

interface ApiResponse {
    data: {
        currencies: Currency[];
    };
}

async function fetchAllCurrencies(): Promise<Currency[]> {
    try {
        const response = await axios.get<ApiResponse>(
            'https://api-cloud.bitmart.com/account/v1/currencies'
        );
        return response.data.data.currencies;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        return [];
    }
}

async function saveToJson(data: any, filename: string): Promise<void> {
    try {
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Данные успешно сохранены в ${filename}`);
    } catch (error) {
        console.error('Ошибка при сохранении файла:', error);
    }
}

async function main() {
    const currencies = await fetchAllCurrencies();

    await saveToJson(currencies, 'BitmartCurrencies.json');

    const networks = Array.from(new Set(currencies.map(c => c.network))).sort();
    await saveToJson({ networks, count: networks.length }, 'networksBitmart.json');
}

main();
