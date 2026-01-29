import fs from 'fs/promises';
import path from 'path';

interface CoinInfo {
    minWithdrawAmount: number | string;
    stationDrawStatus: boolean;
    depositStatus: boolean;
    withdrawFee: number | string;
    withdrawStatus: boolean;
}

interface ApiResponse {
    result: string;
    data: Record<string, CoinInfo>;
}

class CoinParser {
    private response: ApiResponse;

    constructor(response: ApiResponse) {
        this.response = response;
    }

    getAllCoinNames(): string[] {
        return Object.keys(this.response.data);
    }

    getStringCoinNames(): string[] {
        return this.getAllCoinNames().filter(key => isNaN(Number(key)));
    }

    async saveToFile(
        filePath: string,
        options: { includeNumeric?: boolean } = {}
    ): Promise<void> {
        try {
            const coinNames = options.includeNumeric
                ? this.getAllCoinNames()
                : this.getStringCoinNames();

            const output = {
                count: coinNames.length,
                coins: coinNames,
                timestamp: new Date().toISOString()
            };

            await fs.writeFile(
                filePath,
                JSON.stringify(output, null, 2),
                'utf-8'
            );

            console.log(`Данные успешно сохранены в ${filePath}`);
        } catch (error) {
            throw new Error(`Ошибка записи файла: ${error.message}`);
        }
    }

    static async fromFile(filePath: string): Promise<CoinParser> {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const parsedData: ApiResponse = JSON.parse(data);

            if (parsedData.result !== "true") {
                throw new Error("Неверный формат данных");
            }

            return new CoinParser(parsedData);
        } catch (error) {
            throw new Error(`Ошибка чтения файла: ${error.message}`);
        }
    }
}

(async () => {
    try {
        
        const parser = await CoinParser.fromFile(
            path.join(__dirname, 'input-coins.json.json')
        );

        await parser.saveToFile(
            path.join(__dirname, 'output-all-input-coins.json.json'),
            { includeNumeric: true }
        );

        await parser.saveToFile(
            path.join(__dirname, 'output-string-input-coins.json.json')
        );

    } catch (error) {
        console.error('Ошибка:', error.message);
    }
})();
