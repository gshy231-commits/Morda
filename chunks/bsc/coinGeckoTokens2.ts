import fs from "fs";

async function getCoinGeckoTokens() {
    const endpoint = "https://api.coingecko.com/api/v3/coins/markets";
    const params = new URLSearchParams({
        vs_currency: "usd",  
        order: "market_cap_desc", 
        per_page: "100",  
        page: "1"  
    });

    try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error("Нет данных для получения токенов.");
        }

        fs.writeFileSync("./jsons/input-coins.json.json", JSON.stringify(data, null, 2));
        console.log("📊 Данные о токенах сохранены в jsons/input-coins.json.json");
    } catch (error) {
        console.error("Ошибка при получении данных: ", error);
    }
}

getCoinGeckoTokens();
