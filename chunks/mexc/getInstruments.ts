import fs from "fs";

async function getInstruments() {
    const endpoint: string = "https://api.mexc.com/api/v3/exchangeInfo";
    try {
        const response = await fetch(endpoint, { method: "GET" });

        const data: any = await response.json();

        if (data.error) {
            throw new Error(`Error: ${data.error.message}`);
        }

        const filteredData = data.symbols.filter((item: any) => item.quoteAsset.toUpperCase() === "BTC");

        console.log(filteredData.length);

        fs.writeFileSync("./jsons/instruments.json", JSON.stringify(data.symbols));
    } catch (error) {
        console.error("Transactions error: ", error);
    }
}

getInstruments();
