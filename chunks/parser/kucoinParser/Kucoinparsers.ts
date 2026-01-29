import fs from 'fs';
import path from 'path';

interface ChainInfo {
    chainName: string;
}

interface CurrencyItem {
    chains: ChainInfo[];
}

interface ApiResponse {
    code: string;
    data: CurrencyItem[];
}

const extractChainNames = async () => {
    try {
        
        const filePath = path.join(__dirname, 'kucoinResponse.json');

        if (!fs.existsSync(filePath)) {
            throw new Error(`Файл не найден: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const rawData: ApiResponse = JSON.parse(fileContent);

        if (!rawData?.data || !Array.isArray(rawData.data)) {
            throw new Error('Неверный формат данных: отсутствует массив data');
        }

        const allChainNames = rawData.data
            .flatMap(currency =>
                currency.chains?.map(chain => chain.chainName) || []
            )
            .filter(name => typeof name === 'string');

        const uniqueChainNames = Array.from(new Set(allChainNames)).sort();

        const result = { chainNames: uniqueChainNames };

        const outputFilePath = path.join(__dirname, 'kucoinChains.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));

        console.log(`Успех! Создан файл ${outputFilePath} с ${uniqueChainNames.length} уникальными сетями`);
    } catch (error) {
        console.error('Ошибка обработки:', error.message);
        process.exit(1);
    }
};

extractChainNames();
