import fs from "fs";

const endpoint = "https://api.bscscan.com/api";
const tokenAddress = "0xA8780473CEDeD1589bFCc75E3291462E3C84fD5E";
const holder = "0xc88703da1abb02ab73792a059b7f0d497e423c24";
const API_KEY = "KB34EW2XT9IBR67HNBETBJF3C2T3W2V5VX";

const params = new URLSearchParams({
    module: "account",
    action: "tokenbalance",
    contractaddress: tokenAddress,
    address: holder,
    tag: "latest",
    apikey: API_KEY
});

async function getBalance() {
    try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const data = await response.json();

        if (data.status !== "1") {
            console.log(`Commit error!`);
        }

        const balance = parseInt(data.result) / Math.pow(10, 18);

        console.log(`Adr: ${holder}, Balance: ${balance}`);

        const holderData = { address: holder, balance };
        fs.appendFileSync("./jsons/holder_balance.json", JSON.stringify(holderData, null, 2) + ",\n");

    } catch (error) {
        console.error(`Error:`, error);
    }
}

getBalance();
