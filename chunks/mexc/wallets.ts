import fs from "fs";

async function getWalletInfo() {
    const endpoint: string = "https://api.mexc.com/api/v3/capital/config/getall";
    try {
        const response = await fetch(endpoint, { method: "GET" });

        const data: any = await response.json();

        if (data.error) {
            throw new Error(`Error: ${data.error.message}`);
        }

        console.log(data.data.length);

        fs.writeFileSync("./jsons/wallets_info.json", JSON.stringify(data.data));
    } catch (error) {
        console.error("Transactions error: ", error);
    }
}

getWalletInfo();
