import CryptoJS from 'crypto-js';
import axios from 'axios';
import WebSocket from 'ws';

const apiBaseUrl = 'https://www.okx.com'; 
const secretKey = 'A0A22FB91BEB63CF72BFE70DD02A1BDB'; 
const apiKey = '6b5264a9-e252-47df-a295-d4769b76cac2'; 
const passphrase = 'Emilfayzullin2001)'; 
const wsUrl = 'wss://ws.okxParser.com:8443/ws/v5/public'; 

function createSignature(timestamp: string, method: string, endpoint: string, body: string, secretKey: string): string {
    const message = timestamp + method.toUpperCase() + endpoint + body;
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, secretKey));
}

async function getTokens(chainId: string): Promise<{ [key: string]: string }> {
    const endpoint = '/api/v5/dex/aggregator/all-tokens';
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const body = '';

    const signature = createSignature(timestamp, method, endpoint, body, secretKey);

    const headers = {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
    };

    try {
        
        const response = await axios.get(`${apiBaseUrl}${endpoint}`, {
            headers,
            params: { chainId },
        });

        if (response.status === 200) {
            const tokens = response.data.data.reduce((acc: { [key: string]: string }, token: any) => {
                acc[token.tokenContractAddress] = token.tokenSymbol;
                return acc;
            }, {});
            console.log(`Fetched ${Object.keys(tokens).length} tokens for chainId ${chainId}`);
            return tokens;
        } else {
            throw new Error('Failed to fetch tokens');
        }
    } catch (error) {
        console.error('Error fetching tokens:', error.message);
        return {};
    }
}

function trackPricesWithWebSocket(chainId: string, tokens: { [key: string]: string }): void {
    const channels = Object.keys(tokens).map((tokenAddress) => ({
        channel: 'tickers',
        instId: `${tokens[tokenAddress]}-USDT`, 
    }));

    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
        console.log('Connected to OKX WebSocket');
        const subscribeMessage = {
            op: 'subscribe',
            args: channels,
        };
        ws.send(JSON.stringify(subscribeMessage));
    });

    ws.on('message', (data: Buffer) => {
        const message = JSON.parse(data.toString());
        if (message.event === 'subscribe') {
            console.log(`Subscribed to channels: ${message.arg.channel}`);
        } else if (message.table) {
            message.data.forEach((ticker: any) => {
                const [tokenSymbol, baseToken] = ticker.instId.split('-');
                console.log(
                    `Instrument: ${ticker.instId}, Price: ${ticker.last} ${baseToken}, ChainId: ${chainId}`
                );
            });
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.on('error', (err: Error) => {
        console.error('WebSocket error:', err);
    });
}

async function main(): Promise<void> {
    const chainId = '1'; 
    const tokens = await getTokens(chainId); 

    if (Object.keys(tokens).length > 0) {
        trackPricesWithWebSocket(chainId, tokens); 
    } else {
        console.error('No tokens found for the specified chainId.');
    }
}

main();
