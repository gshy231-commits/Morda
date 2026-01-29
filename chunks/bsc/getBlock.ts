const axios = require('axios');

let config = {
    method: 'get',
    url: 'https://api-testnet.bybit.com/v5/market/tickers?category=spot',
    headers: { }
};

axios(config)
    .then((response) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
        console.log(error);
    });
