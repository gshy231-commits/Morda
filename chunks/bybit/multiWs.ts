import { WebSocket } from "ws";
import fs from "fs";

const tickers = [
    ["tickers.BTCUSDT", "tickers.ETHUSDT"],
    ["tickers.APEUSDT", "tickers.PEPEUSDT"] 
];

interface WebSocketEntry {
    id: number;
    tickers: string[];
    socket: WebSocket;
}

const socketList: WebSocketEntry[] = [];

tickers.forEach((tickersChunk, index) => {
    const wsUrl: string = "wss://stream.bybit.com/v5/public/spot";
    const ws: WebSocket = new WebSocket(wsUrl);

    interface WebSocketMessage {
        op: string;
        args?: string[];
        success?: boolean;
        ret_msg?: string;
    }

    ws.on("open", () => {
        console.log("WebSocket connected!");

        const subscribeMessage: WebSocketMessage = {
            op: "subscribe",
            args: tickersChunk
        };

        ws.send(JSON.stringify(subscribeMessage));
    });

    ws.on("message", (data: string) => {
        try {
            const message: WebSocketMessage = JSON.parse(data);
            console.log("New message:", message);
        } catch (error) {
            console.error("Message parsing error:", error);
        }
    });

    ws.on("error", (error: Error) => {
        console.error("WebSocket error:", error.message);
    });

    ws.on("close", (code: number, reason: Buffer) => {
        console.log(`WebSocket disconnected (code: ${code}, reason: ${reason.toString()})`);
    });

    socketList.push({ id: index, tickers: tickersChunk, socket: ws });
});

fs.writeFileSync("./jsons/sockets.json", JSON.stringify(socketList, null, 2));

function findWebSocket(ticker: string): WebSocket | undefined {
    return socketList.find((wsEntry) => wsEntry.tickers.includes(ticker))?.socket;
}

function closeWebSocket(id: number) {
    const entry = socketList.find((ws) => ws.id === id);
    if (entry) {
        entry.socket.close();
    }
}

function closeAllWebSockets() {
    socketList.forEach((ws) => ws.socket.close());
}
