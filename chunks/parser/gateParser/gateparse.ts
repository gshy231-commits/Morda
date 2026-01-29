import fetch from 'node-fetch';

interface Chain {
    name: string;
}

interface Currency {
    chains: Chain[];
}

async function fetchCurrencies(): Promise<Currency[]> {
    try {
        const response = await fetch('https://api.gateio.ws/api/v4/spot/currencies');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        return [];
    }
}

function extractUniqueChains(currencies: Currency[]): string[] {
    const chainSet = new Set<string>();
    currencies.forEach(currency =>
        currency.chains.forEach(chain => chainSet.add(chain.name))
    );
    return Array.from(chainSet).sort();
}

async function generateChainsJson(outputFile: string = 'chainsGate.json'): Promise<void> {
    try {
        const currencies = await fetchCurrencies();
        const chains = extractUniqueChains(currencies);

        const fs = require('fs');
        fs.writeFileSync(outputFile, JSON.stringify(chains, null, 2));
        console.log(`Данные успешно сохранены в ${outputFile}`);
    } catch (error) {
        console.error('Ошибка при генерации JSON:', error);
    }
}

generateChainsJson();
