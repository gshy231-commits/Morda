async function fetchUniqueChains() {
    try {
        const response = await fetch('https://api.huobi.pro/v1/settings/common/chains');
        const data = await response.json();

        const chains = [...new Set(data.data.map((item: { dn: string }) => item.dn))];

        const fs = require('fs');
        fs.writeFileSync('chains.json', JSON.stringify(chains, null, 2));
        console.log(`Сохранено ${chains.length} уникальных chain`);

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

fetchUniqueChains();
