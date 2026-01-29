const fs = require('fs');

async function fetchUniqueChains() {
    try {
        const response = await fetch('https://api.poloniex.com/v2/currencies');
        const data = await response.json();

        const blockchains = data.flatMap(item =>
            item.networkList?.map(network => network.blockchain) || []
        );

        const uniqueBlockchains = [...new Set(blockchains.filter(chain => chain))];

        fs.writeFileSync('poloniexChains.json', JSON.stringify(uniqueBlockchains, null, 2));
        console.log(`Сохранено ${uniqueBlockchains.length} уникальных blockchain`);

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

fetchUniqueChains();
