import fs from "fs";

async function getQuote() {
    const url: string = "https://quote-api.jup.ag";
    const endpoint: string = "/v6/quote";
    const inputMint: string = "So11111111111111111111111111111111111111112"; 
    const outputMint: string = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; 
    const amount: string = "100000000"; 
    const slippageBps: string = "50"; 

    try {
        const request: string = `${url + endpoint}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
        const response: any = await fetch(request, { method: "GET" });
        const data = await response.json();

        fs.writeFileSync("./jsons/price.json", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Request error: ", error);
    }
}

getQuote();
