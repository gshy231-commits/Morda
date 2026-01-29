import CryptoJS from "crypto-js";
import axios, { AxiosRequestConfig } from "axios";
import { writeFile } from "fs/promises";

const API_KEY = "zRMVyRrQz1gJ3lpWcW2M4y4DLbvHZnGNHCckNzJETZAlT1Ms8zgaWey1JM45OrjkVeTxVOUg1sS9yjH6bqNw";
const API_SECRET = "5adavgvvjyBK8pNLucXTpj2ywUDjorec8DXzz1xCerDIjQvMO8rLjSieYdUCDi0kSIP3qwEIFy2kv1vBJpvxQ";
const HOST = "open-api.bingx.com";

interface ApiConfig {
    uri: string;
    method: string;
    payload: Record<string, unknown>; 
    protocol: string;
}

const API: ApiConfig = {
    uri: "/openApi/wallets/v1/capital/config/getall",
    method: "GET",
    payload: {}, 
    protocol: "https"
};

async function main() {
    await bingXOpenApiTest(
        API.protocol,
        HOST,
        API.uri,
        API.method,
        API_KEY,
        API_SECRET
    );
}

function getParameters(
    apiConfig: ApiConfig,
    timestamp: number,
    urlEncode: boolean
): string {
    let parameters = "";
    for (const key in apiConfig.payload) {
        const value = apiConfig.payload[key];
        const encodedValue = urlEncode
            ? encodeURIComponent(value as string)
            : value.toString();
        parameters += `${key}=${encodedValue}&`;
    }

    parameters += `timestamp=${timestamp}`;
    return parameters;
}

main().catch(console.error);

async function bingXOpenApiTest(
    protocol: string,
    host: string,
    path: string,
    method: string,
    apiKey: string,
    apiSecret: string
): Promise<void> {
    const timestamp = Date.now();

    const paramsForSign = getParameters(API, timestamp, false);
    const sign = CryptoJS.enc.Hex.stringify(
        CryptoJS.HmacSHA256(paramsForSign, apiSecret)
    );

    const url = `${protocol}://${host}${path}?${getParameters(API, timestamp, true)}&signature=${sign}`;

    console.log("protocol:", protocol);
    console.log("method:", method);
    console.log("host:", host);
    console.log("path:", path);
    console.log("parameters:", paramsForSign);
    console.log("sign:", sign);
    console.log(method, url);

    const config: AxiosRequestConfig = {
        method: method,
        url: url,
        headers: {
            'X-BX-APIKEY': apiKey,
        },
        transformResponse: (resp: string) => resp 
    };

    try {
        const resp = await axios(config);
        console.log("Status:", resp.status);
        console.log("Response data:", resp.data);

        const fileName = `response_${Date.now()}.json`;
        await writeFile(fileName, JSON.stringify(resp.data, null, 2));
        console.log(`✅ Данные сохранены в файл: ${fileName}`);

        if (typeof resp.data === 'object' && resp.data !== null) {
            for (const key in resp.data) {
                const value = resp.data[key];
                if (typeof value === 'number' && value > Number.MAX_SAFE_INTEGER) {
                    resp.data[key] = BigInt(value.toString());
                }
            }
            console.log("Обработанные данные:", resp.data);
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}
