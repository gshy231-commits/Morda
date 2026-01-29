import fs from "fs";

async function getInstruments() {
    const endpoint: string = "https://api.mexc.com/api/v3/exchangeInfo";
    try {
        const response = await fetch(endpoint, { method: "GET" });
        const data: any = await response.json();

        if (data.error) {
            throw new Error(`Error: ${data.error.message}`);
        }

        const ethTickers = data.symbols
            .filter((item: any) => item.quoteAsset.toUpperCase() === "WETH")
            .map((item: any) => item.symbol);
        const solTickers = data.symbols
            .filter((item: any) => item.baseAsset
                && !item.baseAsset.startsWith("SOL")
                && item.baseAsset.endsWith("SOL"))
            .map((item: any) => item.symbol);

        const tickers = ethTickers.concat(solTickers);

        console.log(tickers);

    } catch (error) {
        console.error("Transactions error: ", error);
    }
}

getInstruments();
