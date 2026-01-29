import { WebSocket } from "ws";

const wsUrl: string = "wss://wbs.mexcParser.com/ws";
const ws: WebSocket = new WebSocket(wsUrl);

interface WebSocketMessage {
    method: string;
    params?: string[];
    id?: number;
}

ws.on("open", () => {
    console.log("WebSocket connected!");

    const subscribeMessage: WebSocketMessage = {
        method: "SUBSCRIPTION",
        params: ["spot@public.bookTicker.v3.api@BTCUSDT", "spot@public.bookTicker.v3.api@ETHUSDT"],
        id: 1
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

ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error.message);
});

ws.on("close", (code: number, reason: Buffer) => {
    console.log(`WebSocket disconnected (code: ${code}, reason: ${reason.toString()})`);
});
