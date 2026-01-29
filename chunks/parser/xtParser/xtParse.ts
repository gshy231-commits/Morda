const fs = require('fs');

async function fetchUniqueChains() {
    try {
        const response = await fetch('https://sapi.xt.com/v4/public/wallet/support/currency');
        const data = await response.json();

        const chains = data.result.flatMap(currency =>
            currency.supportChains?.map(chain => chain.chain) || []
        );

        const uniqueChains = [...new Set(chains.filter(chain => chain))];

        fs.writeFileSync('xtcomChains.json', JSON.stringify(uniqueChains, null, 2));
        console.log(`Сохранено ${uniqueChains.length} уникальных chain`);

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

fetchUniqueChains();
