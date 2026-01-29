import fs from 'fs';
import path from 'path';

interface Chain {
    chainType: string;
    chain: string;
}

interface Row {
    chains: Chain[];
}

interface ApiResponse {
    result: {
        rows: Row[];
    };
}

const dataFilePath = path.join(__dirname, 'Bybit_Contracts.json');
const rawData = fs.readFileSync(dataFilePath, 'utf-8');
const parsedData = JSON.parse(rawData) as ApiResponse;

const chainDictionary: { [chain: string]: string } = {};
const duplicates: { chain: string; oldType: string; newType: string }[] = [];

for (const row of parsedData.result.rows) {
    for (const chain of row.chains) {
        if (chainDictionary[chain.chain]) {
            
            duplicates.push({
                chain: chain.chain,
                oldType: chainDictionary[chain.chain],
                newType: chain.chainType
            });
        }
        chainDictionary[chain.chain] = chain.chainType;
    }
}

const result = {
    dictionary: chainDictionary,
    conflicts: duplicates
};

const outputFilePath = path.join(__dirname, 'bybitDict.json');
fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));

if (duplicates.length > 0) {
    console.warn(`⚠️ Обнаружено ${duplicates.length} конфликтов:`);
    duplicates.forEach(conflict => {
        console.warn(`- Цепь ${conflict.chain}: ${conflict.oldType} → ${conflict.newType}`);
    });
} else {
    console.log('✅ Конфликты не обнаружены');
}

console.log(`Результат сохранен в ${outputFilePath}`);
