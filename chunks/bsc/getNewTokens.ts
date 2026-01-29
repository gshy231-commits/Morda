import fs from "fs";

const API_KEY = "KB34EW2XT9IBR67HNBETBJF3C2T3W2V5VX";

async function getNewTokens() {
    const endpoint = "https://api.bscscan.com/api";

    const params = new URLSearchParams({
        module: "account",
        action: "txlist",       
        address: "0x0000000000000000000000000000000000000000", 
        startblock: "46969828",        
        endblock: "latest",     
        page: "1",              
        offset: "100",          
        sort: "asc",            
        apikey: API_KEY         
    });

    try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const data = await response.json();

        if (data.status !== "1") {
            throw new Error(data.message || "Ошибка при получении данных");
        }

        const transactions = data.result;

        const newContracts = transactions.filter((tx: { input: string; }) => {
            return tx.input.startsWith("0x60806040"); 
        });

        console.log("Найдено новых контрактов:", newContracts.length);

        fs.writeFileSync("./jsons/new_tokens.json", JSON.stringify(newContracts, null, 2));
        console.log("Данные успешно записаны в файл new_tokens.json");

    } catch (error) {
        console.error("Ошибка при получении данных о новых токенах:", error);
    }
}

getNewTokens();
