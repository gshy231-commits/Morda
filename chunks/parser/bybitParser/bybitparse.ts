import fs from 'fs';
import path from 'path';

interface Chain {
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

const chainTypes = new Set<string>();
for (const row of parsedData.result.rows) {
    for (const chain of row.chains) {
        chainTypes.add(chain.chain);
    }
}

const result = Array.from(chainTypes).sort();

const outputFilePath = path.join(__dirname, 'bybitChains.json');
fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));

console.log(`Успешно сохранено ${result.length} уникальных chainType в ${outputFilePath}`);
