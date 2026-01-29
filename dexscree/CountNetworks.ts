import * as fs from 'fs';

const filePath = 'Dict (2).json';

try {
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const tokens = JSON.parse(data); 

    const networkTokens: { [network: string]: Set<string> } = {};

    tokens.forEach(token => {
        
        const networks = Object.values(token.parsedChain);

        const symbols = Object.values(token.symbol)
            .map(s => s.toLowerCase().replace(/_/g, '')) 
            .filter(s => s.trim() !== ''); 

        networks.forEach(network => {
            if (!networkTokens[network]) {
                networkTokens[network] = new Set();
            }
            symbols.forEach(symbol => networkTokens[network].add(symbol));
        });
    });

    const result: { [network: string]: number } = {};
    for (const [network, symbols] of Object.entries(networkTokens)) {
        result[network] = symbols.size;
    }

    console.log('Уникальные токены по сетям:');
    for (const [network, count] of Object.entries(result)) {
        console.log(`- ${network}: ${count}`);
    }

} catch (error) {
    console.error(`Ошибка обработки файла: ${error.message}`);
}
