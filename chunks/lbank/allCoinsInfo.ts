import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { URLSearchParams } from 'url';

const API_KEY = 'facce948-059d-40ef-8cc8-599538cdbac7';
const SECRET_KEY = '53BC60AEB303758AB2593C51AAF22784';
const API_URL = 'https://api.lbkex.com/v2/supplement/asset_detail.do';

type Params = Record<string, string>;

async function getTimestamp(): Promise<string> {
    const response = await axios.get('https://api.lbank.info/v2/timestamp.do');
    console.log('Timestamp API raw response:', response.data);
    const timestamp = response.data?.data;
    if (typeof timestamp === 'undefined') {
        throw new Error('Invalid timestamp response: ' + JSON.stringify(response.data));
    }
    return timestamp.toString();
}

function randomEchostr(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (40 - 30 + 1)) + 30;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function sortedParamString(params: Params): string {
    const sortedKeys = Object.keys(params).sort();
    let sortedParamStr = '';
    for (const key of sortedKeys) {
        sortedParamStr += `${key}=${params[key]}&`;
    }
    return sortedParamStr.slice(0, -1); 
}

function md5Upper(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

function hmacSha256Sign(preparedStr: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(preparedStr).digest('hex');
}

async function fetchUserCoinInfo(): Promise<any> {
    const timestamp = await getTimestamp();
    const echostr = randomEchostr();

    const baseParams: Params = {
        api_key: API_KEY,
        signature_method: 'HmacSHA256',
        timestamp,
        echostr,
    };

    const paramStr = sortedParamString(baseParams);
    const md5Digest = md5Upper(paramStr);
    const sign = hmacSha256Sign(md5Digest, SECRET_KEY);

    const finalParams = new URLSearchParams(baseParams);
    finalParams.append('sign', sign);

    const response = await axios.post(API_URL, finalParams.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
}

function saveJsonResponse(data: any, filename = 'input-coins.json.json') {
    fs.writeFileSync(path.resolve(filename), JSON.stringify(data, null, 2));
}

(async () => {
    try {
        const response = await fetchUserCoinInfo();
        saveJsonResponse(response);
        console.log('Raw API response saved to input-coins.json.json');
    } catch (error) {
        console.error('Error fetching user coin info:', error);
    }
})();
