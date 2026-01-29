import * as crypto from 'crypto';
import * as querystring from 'querystring';
import axios, { AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

class KcSigner {
    constructor(
        private apiKey: string = '',
        private apiSecret: string = '',
        private apiPassphrase: string = ''
    ) {
        if (this.apiPassphrase && this.apiSecret) {
            this.apiPassphrase = this.sign(
                Buffer.from(this.apiPassphrase, 'utf-8'),
                Buffer.from(this.apiSecret, 'utf-8')
            );
        }

        if (![this.apiKey, this.apiSecret, this.apiPassphrase].every(Boolean)) {
            console.warn('API token is empty. Access is restricted to public interfaces only.');
        }
    }

    private sign(plain: Buffer, key: Buffer): string {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(plain);
        return hmac.digest('base64');
    }

    public getHeaders(plain: string): { [key: string]: string } {
        const timestamp = Date.now().toString();
        const signature = this.sign(
            Buffer.from(timestamp + plain, 'utf-8'),
            Buffer.from(this.apiSecret, 'utf-8')
        );

        return {
            'KC-API-KEY': this.apiKey,
            'KC-API-PASSPHRASE': this.apiPassphrase,
            'KC-API-TIMESTAMP': timestamp,
            'KC-API-SIGN': signature,
            'KC-API-KEY-VERSION': '2'
        };
    }
}

async function getTradeFees(signer: KcSigner): Promise<void> {
    const endpoint = 'https://api.kucoin.com';
    const path = '/api/v1/trade-fees';
    const method = 'GET';
    const queryParams = { symbols: 'BTC-USDT' };
    const queryString = querystring.stringify(queryParams);

    const fullPath = `${endpoint}${path}?${queryString}`;
    const rawUrl = `${path}?${queryString}`;
    const payload = `${method}${rawUrl}`;

    const headers = signer.getHeaders(payload);

    try {
        const response = await axios.get(fullPath, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching trade fees:', error);
    }
}

async function addLimitOrder(signer: KcSigner): Promise<void> {
    const endpoint = 'https://api.kucoin.com';
    const path = '/api/v1/hf/orders';
    const method = 'POST';

    const orderData = {
        clientOid: uuidv4(),
        side: 'buy',
        symbol: 'BTC-USDT',
        type: 'limit',
        price: '10000',
        size: '0.001'
    };

    const body = JSON.stringify(orderData);
    const fullPath = `${endpoint}${path}`;
    const rawUrl = path;
    const payload = `${method}${rawUrl}${body}`;

    const headers = signer.getHeaders(payload);

    try {
        const response = await axios.post(fullPath, body, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error placing limit order:', error);
    }
}

async function main() {
    const key = "67eee3060db26300011a8409"; 
    const secret = "45b65e8a-4ed5-4fab-a2c6-5b73f4046d65"; 
    const passphrase = "niyaz1203"; 

    const signer = new KcSigner(key, secret, passphrase);

    await getTradeFees(signer);
    await addLimitOrder(signer);
}

main().catch(console.error);
