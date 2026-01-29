import fs from 'fs';
import path from 'path';

const inputFilePath = 'tokens.json';

const outputDir = 'solana_tokens';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const rawData = fs.readFileSync(inputFilePath, 'utf-8');
const tokens: any[] = JSON.parse(rawData);

const solanaTokens = tokens.filter(token => token.platforms && token.platforms.solana);

solanaTokens.forEach((token, index) => {
    const fileName = path.join(outputDir, `${index + 1}_${token.coinId}.json`);
    fs.writeFileSync(fileName, JSON.stringify(token, null, 2));
    console.log(`Сохранен: ${fileName}`);
});

console.log(`Готово! Сохранено ${solanaTokens.length} токенов.`);
