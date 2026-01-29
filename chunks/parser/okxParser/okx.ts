import fs from 'fs';
import path from 'path';

interface ChainItem {
    chain: string;
}

interface RawData {
    data: ChainItem[];
}

const processChains = async () => {
    try {
        
        const filePath = path.join(__dirname, 'okxResponse.json');
        const rawData: RawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const processedChains = rawData.data.map(item => {
            const firstDashIndex = item.chain.indexOf('-');
            return firstDashIndex !== -1
                ? item.chain.slice(firstDashIndex + 1)
                : item.chain;
        });

        const uniqueChains = Array.from(new Set(processedChains)).sort((a, b) =>
            a.localeCompare(b)
        );

        const result = { chains: uniqueChains };

        const outputFilePath = path.join(__dirname, 'okxChains.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));

        console.log(`Успех! Создан файл ${outputFilePath} с ${uniqueChains.length} уникальными сетями`);
    } catch (error) {
        console.error('Ошибка:', error.message);
        process.exit(1);
    }
};

processChains();
