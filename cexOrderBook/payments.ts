import { createHmac } from 'crypto';
import { URL } from 'url';

const OKX_API_URL = 'https://web3.okx.com/api/v5/dex/aggregator/quote';

const params = {
    amount: '10000000000000000000',
    chainIndex: '1',
    fromTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
};

const apiKey = '4c5aa51f-463d-4f41-9ef0-ede76f36432f';
const secretKey = 'BCF6190D305E2C33E811598B89CCECDA'; 
const apiPassphrase = 'Stalker12)';

function generateSignature(
    timestamp: string,
    method: string,
    endpoint: string,
    query: Record<string, string>
): string {
   
    const sortedParams = Object.keys(query)
        .sort()
        .map(k => `${k}=${query[k]}`)
        .join('&');

    const message = `${timestamp}${method.toUpperCase()}${endpoint}?${sortedParams}`;

    return createHmac('sha256', Buffer.from(secretKey, 'base64')) 
        .update(message)
        .digest('base64');
}

async function main() {
    try {
        
        const now = new Date();
        const timestamp = now.toISOString(); 

        const signature = generateSignature(timestamp, 'GET', '/api/v5/dex/aggregator/quote', params);

        const url = new URL(OKX_API_URL);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'OK-ACCESS-KEY': apiKey,
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-PASSPHRASE': apiPassphrase,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${await response.text()}`);
        }

        const data = await response.json();
        console.log('Swap Quote:', JSON.stringify(data, null, 2));
    } catch (error: any) {
        console.error('Error fetching quote:', error.message);
    }
}

main();
