import { WebSocket } from "ws";
import tokens from './jsons/tokens.json';
import fs from "fs";

const wsUrl = "wss://ws.okxParser.com:8443/ws/v5/public";

const channels: any = tokens.data.map((token) => ({
    channel: 'tickers',
    instId: `${token.tokenSymbol}-USDT`,
}));

fs.writeFileSync("./jsons/channels.json", JSON.stringify(channels, null, 2));

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('Connected to OKX WebSocket');
    const subscribeMessage = {
        op: 'subscribe',
        args: channels,
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
