import fs from "fs";

interface Token {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    platforms?: {
        [key: string]: string;
    };
}

async function getBSCtokens() {
    const endpoint = "https://api.coingecko.com/api/v3/coins/markets";
    const params = new URLSearchParams({
        vs_currency: "usd",  
        order: "market_cap_desc", 
        per_page: "100",  
        page: "1",  
    });

    try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const data: Token[] = await response.json();  

        const bscTokens = data.filter((token: Token) => token.platforms?.bsc);

        if (bscTokens.length === 0) {
            throw new Error("Нет токенов в сети BSC.");
        }

        fs.writeFileSync("./jsons/bsc_tokens.json", JSON.stringify(bscTokens, null, 2));
        console.log("📊 Данные о токенах на BSC сохранены в jsons/bsc_tokens.json");
    } catch (error) {
        console.error("Ошибка при получении данных: ", error);
    }
}

getBSCtokens();
