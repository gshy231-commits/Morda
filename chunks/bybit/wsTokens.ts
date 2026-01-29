import { WebSocket } from "ws";

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
        args: ["tickers.BTCUSDT", "tickers.ETHUSDT"]
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
