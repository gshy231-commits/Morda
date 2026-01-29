import fs from "fs";

async function getTokensWithJupiterPrices() {
    const jupiterTokensUrl = "https://api.jup.ag/tokens/v1/tagged/verified";
    const jupiterPriceUrl = "https://api.jup.ag/price/v2";

    try {
        
        const tokenResponse = await fetch(jupiterTokensUrl);
        if (!tokenResponse.ok) throw new Error(`HTTP error! Status: ${tokenResponse.status}`);

        const tokens = await tokenResponse.json();

        const first100Tokens = tokens.slice(0, 100);
        const tokenAddresses = first100Tokens.map((token: any) => token.address);

        console.log(tokenAddresses);
        
        const priceRequestUrl = `${jupiterPriceUrl}?ids=${tokenAddresses.join(",")}&vsToken=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`;
        console.log(`📡 Fetching prices for first 100 tokens...`);
        console.log(`🔍 Request URL: ${priceRequestUrl}`);

        const priceResponse = await fetch(priceRequestUrl);
        if (!priceResponse.ok) throw new Error(`HTTP error! Status: ${priceResponse.status}`);

        const priceData = await priceResponse.json();
        console.log("✅ Prices fetched successfully!");

        const tokensWithPrices = priceData;

        fs.writeFileSync("./jsons/tokensWithJupiterPrices.json", JSON.stringify(tokensWithPrices, null, 2));

        console.log("✅ Data saved to file!");
    } catch (error) {
        console.error("❌ Request error:", error);
    }
}

getTokensWithJupiterPrices();
