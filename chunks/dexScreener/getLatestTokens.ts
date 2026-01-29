import fs from "fs";

async function getPrices() {
    const endpoint = "https://api.dexscreener.com/token-profiles/latest/v1";
    try {
        const response = await fetch(endpoint, { method: "GET" });
        const data = await response.json();

        fs.writeFileSync("./jsons/latestTokens.json", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error: ", error);
    }
}

getPrices();
