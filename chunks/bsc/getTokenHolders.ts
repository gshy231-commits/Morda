import fs from "fs";

const API_KEY = "KB34EW2XT9IBR67HNBETBJF3C2T3W2V5VX";
const tokenAddress = "0xA8780473CEDeD1589bFCc75E3291462E3C84fD5E";
async function getTokenTransfers() {
    const endpoint = "https://api.bscscan.com/api";
    
    const params = new URLSearchParams({
        module: "account",
        action: "tokentx",
        contractaddress: tokenAddress,
        startblock: "0", 
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
            throw new Error("Ошибка при получении данных с BscScan");
        }

        const transfers = data.result;

        const holders: Set<string> = new Set();
        
        transfers.forEach((tx: any) => {
            holders.add(tx.from); 
            holders.add(tx.to); 
        });

        console.log(`Найдено ${holders.size} уникальных адресов владельцев токена.`);

        fs.writeFileSync("./jsons/holders.json", JSON.stringify([...holders], null, 2));
        console.log("Список владельцев токена сохранен в jsons/holders.json");

        await getBalances([...holders]); 

    } catch (error) {
        console.error("Ошибка при получении данных о транзакциях: ", error);
    }
}

async function getBalances(holders: string[]) {
    const endpoint = "https://api.bscscan.com/api";

    for (const holder of holders) {
        const params = new URLSearchParams({
            module: "account",
            action: "tokenbalance",
            contractaddress: tokenAddress,
            address: holder,
            tag: "latest", 
            apikey: API_KEY
        });

        try {
            const response = await fetch(`${endpoint}?${params.toString()}`);
            const data = await response.json();

            if (data.status !== "1") {
                console.log(`Ошибка при получении баланса для адреса ${holder}`);
                continue;
            }

            const balance = parseInt(data.result) / Math.pow(10, 18); 

            console.log(`Адрес: ${holder}, Баланс: ${balance} токенов`);

            const holderData = { address: holder, balance };
            fs.appendFileSync("./jsons/holder_balances.json", JSON.stringify(holderData, null, 2) + ",\n");

        } catch (error) {
            console.error(`Ошибка при получении баланса для адреса ${holder}:`, error);
        }
    }

    console.log("Все балансы сохранены в jsons/holder_balances.json");
}

getTokenTransfers();
