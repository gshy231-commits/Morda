import { WebSocket } from "ws";

const wsUrl: string = "wss://stream.bybit.com/v5/public/spot";
const ws: WebSocket = new WebSocket(wsUrl);

interface OrderBookMessage {
    topic: string;
    type: string;
    ts: number;
    data: {
        s: string; 
        b: [string, string][]; 
        a: [string, string][]; 
    };
}

ws.on("open", () => {
    console.log("WebSocket connected!");

    const subscribeMessage = {
        op: "subscribe",
        args: ["orderbook.1.BTCUSDT", "orderbook.1.ETHUSDT"]
    };

    ws.send(JSON.stringify(subscribeMessage));
});

ws.on("message", (data: string) => {
    try {
        const message: OrderBookMessage = JSON.parse(data);

        if (message.topic && message.topic.startsWith("orderbook")) {
            console.log(`Orderbook (${message.data.s}):`);
            console.log("Bids:", message.data.b);
            console.log("Asks:", message.data.a);
        }
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
