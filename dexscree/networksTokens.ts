import * as fs from 'fs';

const filePath = 'Dict (1).json';
const outputDir = './output/';
const undefinedFile = 'undefined_tokens.json';

try {
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputExi);
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const tokens = JSON.parse(data); 

    const undefinedTokens: { symbol: string; commitedChain: Record<string, string> }[] = [];
    const networkTokens: { [network: string]: { symbol: string; commitedChain: Record<string, string> }[] } = {};

    tokens.forEach(token => {
        
        const parsedNetworks = Object.values(token.parsedChain || {}).filter(
            network => network && network.trim() !== ''
        );

        const commitedNetworks = Object.values(token.commitedChain || {}).filter(
            network => network && network.trim() !== ''
        );

        const allNetworks = [...parsedNetworks, ...commitedNetworks];
        const uniqueNetworks = Array.from(new Set(allNetworks));

        const symbols = Object.values(token.symbol || {}).filter(
            symbol => symbol && symbol.trim() !== ''
        );

        if (uniqueNetworks.length === 0) {
            symbols.forEach(symbol => {
                undefinedTokens.push({
                    symbol,
                    commitedChain: token.commitedChain || { undefined: 'undefined' } 
                });
            });
        } else {
            
            symbols.forEach(symbol => {
                const tokenEntry = {
                    symbol,
                    commitedChain: token.commitedChain || {} 
                };

                if (uniqueNetworks.length > 0) {
                    const networkKey = uniqueNetworks[0]; 
                    if (!networkTokens[networkKey]) {
                        networkTokens[networkKey] = [];
                    }
                    networkTokens[networkKey].push(tokenEntry);
                }
            });
        }
    });

    for (const [network, tokensList] of Object.entries(networkTokens)) {
        const fileName = `${network}_tokens.json`;
        const filePath = `${outputDir}${fileName}`;

        fs.writeFileSync(
            filePath,
            JSON.stringify(tokensList, null, 2)
        );
        console.log(`Сохранено: ${fileName}`);
    }

    if (undefinedTokens.length > 0) {
        fs.writeFileSync(
            `${outputDir}${undefinedFile}`,
            JSON.stringify(undefinedTokens, null, 2)
        );
        console.log(`Неопределенные токены: ${undefinedFile}`);
    }

} catch (error) {
    console.error(`Ошибка: ${error.message}`);
}
