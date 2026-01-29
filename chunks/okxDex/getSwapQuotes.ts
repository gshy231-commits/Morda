import CryptoJS from 'crypto-js';
import fs from "fs";

const config = {
    baseUrl: "https://web3.okx.com",
    apiKey: "4b7361c2-4153-4731-9cde-47594e63b352",
    secretKey: "5C0CD9294180A6423CFF15091CF1E668",
    passphrase: "Stalker12)",

    amount: "1000000000",
    chainId: "501",
    toTokenAddress: "So11111111111111111111111111111111111111112",
    fromTokenAddress: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump"
};

const endpoint = `/api/v5/dex/aggregator/quote?amount=${config.amount}&chainId=${config.chainId}&toTokenAddress=${config.toTokenAddress}&fromTokenAddress=${config.fromTokenAddress}`;

async function getTokens() {
    const timestamp = new Date().toISOString();
    const method = "GET";
    const body = "";

    const message = timestamp + method + endpoint + body;
    const signature = CryptoJS.enc.Base64.stringify(
        CryptoJS.HmacSHA256(message, config.secretKey)
    );

    const headers = {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': config.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': config.passphrase,
    };

    try {
        const response = await fetch(config.baseUrl + endpoint, {
            method: "GET",
            headers: headers,
        });

        const data = await response.json();
        fs.writeFileSync("./jsons/swapQuotes.json", JSON.stringify(data, null, 2));
        console.log("Данные успешно сохранены в файл swapQuotes.json");

    } catch (error) {
        console.error("Ошибка при получении данных: ", error);
    }
}

setInterval(getTokens, 500);
