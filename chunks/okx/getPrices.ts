import fs from "fs";

async function getPrices() {
    const endpoint = "https://www.okx.com/api/v5/market/tickers?instType=SPOT";
    try {
        const response = await fetch(endpoint, { method: "GET" });
        const data = await response.json();

        if (data.code !== "0") {
            throw new Error(`Error: ${data.msg}`);
        }

        fs.writeFileSync("./jsons/prices.json", JSON.stringify(data.data, null, 2));
        console.log(`Tickers count: ${data.data.length}`);
    } catch (error) {
        console.error("Error: ", error);
    }
}

getPrices();
