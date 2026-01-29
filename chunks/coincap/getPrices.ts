import fs from "fs";

async function getCoinCapPrices() {
    const endpoint = "https://api.coincap.io/v2/assets";
    try {
        const response = await fetch(endpoint, { method: "GET" });
        const data = await response.json();

        if (!data.data) {
            throw new Error("Data commit error!");
        }

        fs.writeFileSync("./jsons/coincap_prices.json", JSON.stringify(data.data, null, 2));
        console.log(`Tickers count: ${data.data.length}`);
    } catch (error) {
        console.error("Data commit error: ", error);
    }
}

getCoinCapPrices();
