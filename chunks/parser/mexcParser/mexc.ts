import fs from 'fs';
import path from 'path';

interface NetworkItem {
    netWork: string;
}

interface CoinData {
    networkList: NetworkItem[];
}

const extractUniqueNetworks = async () => {
    try {
        
        const filePath = path.join(__dirname, 'mexcResponse.json');
        const rawData: CoinData[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const allNetworks = rawData.flatMap(coin =>
            coin.networkList.map(item => item.netWork)
        );

        const uniqueNetworks = Array.from(new Set(allNetworks)).sort();

        const result = { networks: uniqueNetworks };

        const outputFilePath = path.join(__dirname, 'mexcNetworks1.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));

        console.log(`Успех! Создан файл ${outputFilePath} с ${uniqueNetworks.length} уникальными сетями`);
    } catch (error) {
        console.error('Ошибка обработки:', error.message);
        process.exit(1);
    }
};

extractUniqueNetworks();
