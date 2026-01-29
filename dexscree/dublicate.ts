import fs from 'fs';
import path from 'path';

interface ExchangeData {
    [key: string]: string;
}

interface TokenData {
    baseContract: string;
    targetContract: string;
    targetCoin?: string;
    dexPrice: number;
    liquidity: number;
    fdv: number;
    capitalization: number;
    isChainsConflict: boolean;
    symbol?: ExchangeData;
    baseCoin?: ExchangeData;
    commitedChain?: ExchangeData;
    parsedChain?: ExchangeData;
    lastPrice: null | any;
    bidPrice: null | any;
    bidSize: null | any;
    askPrice: null | any;
    askSize: null | any;
    volume: null | any;
    spreadLP: null | any;
    spreadD: null | any;
    withdrawFee?: ExchangeData;
    isDepositAllowed?: ExchangeData;
    isWithdrawAllowed?: ExchangeData;
}

interface DuplicateEntry {
    contractAddress: string;
    count: number;
    exchanges: string[];
    firstOccurrence: TokenData;
    secondOccurrence?: TokenData;
}

const INPUT_FILE = path.resolve(__dirname, 'Dict (2).json');
const OUTPUT_FILE = path.resolve(__dirname, 'duplicate_contracts.json');

function getContractKey(contract: string): string {
    if (/^0x[a-fA-F0-9]{40}$/.test(contract)) {
        return contract.toLowerCase();
    }
    return contract;
}

try {
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');

    let tokens: TokenData[] = [];
    try {
        tokens = JSON.parse(rawData);
        if (!Array.isArray(tokens)) {
            throw new Error('JSON должен быть массивом');
        }
    } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError.message);
        process.exit(1);
    }

    const contractMap = new Map<string, TokenData[]>();

    tokens.forEach(token => {
        const key = getContractKey(token.baseContract);
        if (!contractMap.has(key)) {
            contractMap.set(key, []);
        }
        contractMap.get(key)?.push(token);
    });

    const duplicates: DuplicateEntry[] = [];

    contractMap.forEach((entries, contractAddress) => {
        if (entries.length > 1) {
            duplicates.push({
                contractAddress,
                count: entries.length,
                exchanges: Array.from(new Set(entries.flatMap(entry =>
                    Object.keys(entry.symbol || {})
                ))),
                firstOccurrence: entries[0],
                secondOccurrence: entries.length > 1 ? entries[1] : undefined
            });
        }
    });

    if (duplicates.length > 0) {
        fs.writeFileSync(
            OUTPUT_FILE,
            JSON.stringify(duplicates, null, 2),
            'utf-8'
        );
        console.log(`Найдено ${duplicates.length} дублирующихся контрактов`);
        console.log(`Результат сохранён в ${OUTPUT_FILE}`);
    } else {
        console.log('Дубликатов не найдено');
    }

} catch (error) {
    console.error('Ошибка при обработке файла:', error.message);
}
