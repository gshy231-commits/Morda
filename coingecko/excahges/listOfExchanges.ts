import fetch from 'node-fetch'; 
import fs from 'fs/promises';

const url = 'https://api.coingecko.com/api/v3/exchanges/list';
const options = {
    method: 'GET' as const,
    headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': 'CG-tyvnpsnUck4WDGkvkRjmbLPB'
    }
};

(async () => {
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data: any = await res.json();
        console.log(data);

        await fs.writeFile('exchanges.json', JSON.stringify(data, null, 2));
        console.log('Данные сохранены в exchanges.json');
    } catch (err) {
        console.error('Произошла ошибка:', err);
    }
})();
