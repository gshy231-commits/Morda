import * as crypto from 'crypto';
import * as querystring from 'querystring';
import axios, {AxiosRequestConfig} from 'axios';
import {v4 as uuidv4} from 'uuid';
import * as fs from 'fs/promises';

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

async function getCurrencies(signer: KcSigner): Promise<void> {
    const endpoint = 'https://api.kucoin.com';
    const path = '/api/v3/currencies';
    const method = 'GET';

    const fullPath = `${endpoint}${path}`;
    const rawUrl = path;
    const payload = `${method}${rawUrl}`;

    const headers = signer.getHeaders(payload);

    try {
        const response = await axios.get(fullPath, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await fs.writeFile(`currencies_${timestamp}.json`, JSON.stringify(response.data, null, 2));
        console.log(`Данные сохранены в currencies_${timestamp}.json`);

    } catch (error) {
        console.error('Ошибка при получении данных о валютах:', error);
    }
}

async function main() {
    const key = "67eee3060db26300011a8409";
    const secret = "45b65e8a-4ed5-4fab-a2c6-5b73f4046d65";
    const passphrase = "niyaz1203";

    const signer = new KcSigner(key, secret, passphrase);

    await getCurrencies(signer);
}

main().catch(console.error);
