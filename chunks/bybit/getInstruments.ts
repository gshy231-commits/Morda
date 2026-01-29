import fs from "fs";

async function getInstruments() {
    const endpoint: string = "https://api.bybit.com/v5/market/instruments-info?category=spot";
    try {
        const response = await fetch(endpoint, { method: "GET" });

        const data: any = await response.json();

        if (data.error) {
            throw new Error(`Error: ${data.error.message}`);
        }

        fs.writeFileSync("./jsons/instruments.json", JSON.stringify(data.result.list));
    } catch (error) {
        console.error("Transactions error: ", error);
    }
}

getInstruments();
