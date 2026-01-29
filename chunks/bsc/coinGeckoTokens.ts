import fs from "fs";

const endpoint = "https://api.coingecko.com/api/v3/coins/list?include_platform=true";

async function getAllTokens() {
    try {
        const response = await fetch(endpoint, { method: "GET" });
        const data = await response.json();

        const bscTokens = data.filter((token: { platforms: { [x: string]: any; }; }) => token.platforms && token.platforms["binance-smart-chain"]);

        console.log(data.length);

        fs.writeFileSync("./jsons/bsc_tokens.json", JSON.stringify(bscTokens, null, 2));
        console.log("BSC tokens list saved to jsons/bsc_tokens.json");
    } catch (error) {
        console.error("Error fetching BSC tokens: ", error);
    }
}

getAllTokens();
