import * as fs from 'fs/promises';

interface Coin {
    id: string;
    symbol: string;
    name: string;
}

async function saveCoinsList(): Promise<void> {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=true', {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': 'CG-tyvnpsnUck4WDGkvkRjmbLPB'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const coinsData: Coin[] = await response.json();

        await fs.writeFile(
            'coins.json.json',
            JSON.stringify(coinsData, null, 2)
        );

        console.log('Данные успешно сохранены в coins.json.json');
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

saveCoinsList();
