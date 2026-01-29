import CryptoJS from 'crypto-js';
import fs from "fs";

const baseUrl: string = "https://www.okx.com";
const apiKey: string = "6b5264a9-e252-47df-a295-d4769b76cac2";
const secretKey: string = "A0A22FB91BEB63CF72BFE7A5D3F84C3D41120C302";
const passphrase: string = "Emilfayzullin2001)";
const projectId: string = "efc344a1a614e9a6622db26b331bcd5c"; 

function getTokensFromJson(filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        if (jsonData.code === "0" && Array.isArray(jsonData.data)) {
            return jsonData.data.map(token => ({
                chainIndex: "1", 
                tokenAddress: token.tokenContractAddress
            }));
        } else {
            throw new Error("Неверный формат JSON или отсутствуют данные");
        }
    } catch (error) {
        console.error("Ошибка при чтении или парсинге JSON:", error);
        return [];
    }
}

async function getRealTimePrices(tokens) {
    const endpoint = "/api/v5/wallet/token/real-time-price";
    const timestamp = new Date().toISOString();
    const method = "POST";
    const body = JSON.stringify(tokens);

    const message = timestamp + method + endpoint + body;
    console.log("Message:", message);

    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, secretKey));
    console.log("Signature:", signature);

    const headers = {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'OK-ACCESS-PROJECT': projectId,
    };

    try {
        const response = await fetch(baseUrl + endpoint, {
            method: "POST",
            headers: headers,
            body: body,
        });

        const data = await response.json();
        console.log("Полный ответ от API:", data);

        if (data.data && Array.isArray(data.data)) {
            return data.data.filter(item => item.price !== undefined);
        } else {
            console.warn("Цены не найдены в ответе API.");
            return [];
        }
    } catch (error) {
        console.error("Ошибка при запросе к API:", error);
        return null;
    }
}

const jsonFilePath: string = "./jsons/tokens.json";

const tokens = getTokensFromJson(jsonFilePath);
console.log("Загруженные токены:", tokens);

if (tokens.length > 0) {
    
    const batchSize = 50;
    for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        getRealTimePrices(batch).then(prices => {
            console.log("Полученные цены:", prices);
        });
    }
} else {
    console.log("Токены для запроса не найдены.");
}
