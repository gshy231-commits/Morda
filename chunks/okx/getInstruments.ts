import fs from "fs";

async function getInstruments() {
    const endpoint = "https://www.okx.com/api/v5/public/instruments?instType=SPOT";
    try {
        const response = await fetch(endpoint, { method: "GET" });
        const data = await response.json();

        if (data.code !== "0") {
            throw new Error(`Error: ${data.msg}`);
        }

        fs.writeFileSync("./jsons/instruments.json", JSON.stringify(data.data));
    } catch (error) {
        console.error("Transactions error: ", error);
    }
}

getInstruments();
