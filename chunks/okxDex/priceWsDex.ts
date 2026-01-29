import { WebSocket } from "ws";
import tokens from './jsons/tokens.json';
import fs from "fs";

const wsUrl = "wss://exchainws.okex.org:8443";

const channels: any = tokens.data.map((token) => ({
    channel: 'tickers',
    instId: `${token.tokenSymbol}-USDT`,
}));

const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
    console.log('WebSocket connection established.');
    const subscribeMessage = {
        id: "1",
        method: 'eth_subscribe',
        params: ['newHeads']
    };
    ws.send(JSON.stringify(subscribeMessage));
});

ws.on("message", (data: string) => {
    try {
        const message = JSON.parse(data);
        console.log("New message:", message);
    } catch (error) {
        console.error("Message parsing error:", error);
    }
});

ws.on('close', () => {
    console.log('WebSocket connection closed');
});

ws.on('error', (err: Error) => {
    console.error('WebSocket error:', err);
});
