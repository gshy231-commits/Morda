import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { URLSearchParams } from 'url';

const API_KEY = 'facce948-059d-40ef-8cc8-599538cdbac7';
const SECRET_KEY = '53BC60AEB303758AB2593C51AAF22784';
const ASSET_DETAIL_URL = 'https://api.lbkex.com/v2/supplement/asset_detail.do';
const ASSET_CONFIG_URL = 'https://api.lbkex.com/v2/assetConfigs.do';

interface CoinInfo {
    assetCode: string;
    chainName: string;
    canDraw: boolean;
    canStationDraw: boolean;
    canDeposit: boolean;
    hasMemo: boolean;
    assetFee: {
        type: number;
        feeCode: string;
        scale: number;
        minAmt: string;
        feeAmt: string;
        feeRate: string;
        stationFeeAmt: string;
        stationScale: number;
        stationMinAmt: string;
        minDepositAmt: string;
        depositFee: string;
    };
}

interface AssetConfigResponse {
    result: string;
    data: CoinInfo[];
}

interface AssetDetailResponse {
    result: string;
    data: Record<string, any>;
}

function createSignature(params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');

    const md5Digest = crypto.createHash('md5').update(sortedParams).digest('hex').toUpperCase();
    return crypto.createHmac('sha256', SECRET_KEY).update(md5Digest).digest('hex');
}

async function fetchAssetDetails(): Promise<AssetDetailResponse> {
    const timestamp = (await axios.get('https://api.lbank.info/v2/timestamp.do')).data.data;
    const echostr = crypto.randomBytes(20).toString('hex');

    const params = {
        api_key: API_KEY,
        signature_method: 'HmacSHA256',
        timestamp,
        echostr
    };

    params['sign'] = createSignature(params);

    const response = await axios.post(ASSET_DETAIL_URL, new URLSearchParams(params).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data;
}

async function fetchAssetConfig(assetCode: string): Promise<CoinInfo[]> {
    const timestamp = Date.now().toString();
    const params = { assetCode };

    const headers = {
        'X-API-KEY': API_KEY,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': createSignature({ ...params, timestamp })
    };

    const response = await axios.get(ASSET_CONFIG_URL, { params, headers });
    return response.data.result === 'true' ? response.data.data : [];
}

async function main() {
    try {
        
        const assetDetails = await fetchAssetDetails();
        await fs.writeFile('input-coins.json.json', JSON.stringify(assetDetails, null, 2));

        const coinNames = Object.keys(assetDetails.data || {});

        const detailedData: Record<string, any> = {};

        for (const coin of coinNames) {
            console.log(`Processing ${coin}...`);
            detailedData[coin] = {
                basic: assetDetails.data[coin],
                config: await fetchAssetConfig(coin)
            };
        }

        await fs.writeFile('output-complete.json', JSON.stringify({
            timestamp: new Date().toISOString(),
            data: detailedData
        }, null, 2));

        console.log('Все данные успешно сохранены!');

    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

main();
