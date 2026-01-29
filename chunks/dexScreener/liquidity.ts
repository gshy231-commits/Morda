import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

interface TokenData {
    baseContract: string;
    chain: string;
    
    targetContract?: string;
    targetCoin?: string;
    symbol?: Record<string, string>;
    baseCoin?: Record<string, string>;
    spreads?: Record<string, number>;
    prices?: Record<string, number>;

    liquidity_usd?: number | null;
    liquidity_base?: number | null;
    liquidity_quote?: number | null;
}

async function main() {
    
    const filePath = path.resolve(__dirname, 'TestDictSol.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const tokens: TokenData[] = JSON.parse(fileContent);

    const uniqueTokens = Array.from(
        new Map(tokens.map(item => [item.baseContract, item])).values()
    );

    const tokensWithLiquidity: TokenData[] = [];

    const requests = uniqueTokens.map(async (token) => {
        const tokenAddress = token.baseContract;
        
        const apiUrl = `https://api.dexscreener.com/tokens/v1/$solana/${tokenAddress}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            let liquidityData = null;
            if (data && data.liquidity) {
                liquidityData = data.liquidity;
            } else if (Array.isArray(data) && data.length > 0 && data[0].liquidity) {
                liquidityData = data[0].liquidity;
            } else {
                console.warn(`Нет данных о ликвидности для токена ${tokenAddress}`);
            }

            if (liquidityData) {
                token.liquidity_usd = liquidityData.usd ?? null;
                token.liquidity_base = liquidityData.base ?? null;
                token.liquidity_quote = liquidityData.quote ?? null;
            } else {
                token.liquidity_usd = null;
                token.liquidity_base = null;
                token.liquidity_quote = null;
            }

            tokensWithLiquidity.push(token);

            console.log(`Токен ${tokenAddress} обновлен:`);
            console.log(`  liquidity_usd: ${token.liquidity_usd}`);
            console.log(`  liquidity_base: ${token.liquidity_base}`);
            console.log(`  liquidity_quote: ${token.liquidity_quote}`);
            console.log('-------------------------');
        } catch (error: any) {
            console.error(`Ошибка для ${tokenAddress}:`, error.message);
        }
    });

    await Promise.all(requests);

    const outputPath = path.resolve(__dirname, 'TestDictSol_with_separated_liquidity.json');
    fs.writeFileSync(outputPath, JSON.stringify(tokensWithLiquidity, null, 2), 'utf-8');
    console.log(`Обновленные данные сохранены в ${outputPath}`);
}

main().catch(console.error);
