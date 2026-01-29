import fs from "fs";

const endpoint = "https://api.bscscan.com/api";
const factoryAddress = "0xBCfCcbde45cE874adCB698cC183deBcF17952812";
const API_KEY = "KB34EW2XT9IBR67HNBETBJF3C2T3W2V5VX";

async function getLatestBlock() {
    const response = await fetch(`${endpoint}?module=proxy&action=eth_blockNumber&apikey=${API_KEY}`);
    const data = await response.json();
    return parseInt(data.result, 16);
}

async function getNewPairs() {
    try {
        const latestBlock = await getLatestBlock();
        const fromBlock = latestBlock - 5000; 

        const params = new URLSearchParams({
            module: "logs",
            action: "getLogs",
            fromBlock: "45539600", 
            toBlock: "latest",
            address: factoryAddress,
            topic0: "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9",
            apikey: API_KEY
        });

        const response = await fetch(`${endpoint}?${params.toString()}`);
        const data = await response.json();

        if (data.status !== "1" || !data.result.length) {
            console.log("❌ No new pairs found or API error.");
            return;
        }

        let pairs = [];

        for (let log of data.result) {
            if (log.topics.length < 3 || log.data.length < 66) continue; 

            const token0 = "0x" + log.topics[1].slice(26);
            const token1 = "0x" + log.topics[2].slice(26);
            const pairAddress = "0x" + log.data.slice(26, 66);

            console.log(`🆕 Новая пара: ${token0} / ${token1} -> ${pairAddress}`);

            pairs.push({ token0, token1, pairAddress });
        }

        if (pairs.length > 0) {
            fs.appendFileSync("./jsons/pairs.json", JSON.stringify(pairs, null, 2) + ",\n");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

getNewPairs();
