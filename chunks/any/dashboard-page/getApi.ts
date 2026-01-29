import fs from "fs";

async function getInstruments() {
    const endpoint: string = "http://89.111.154.133/api/data/all";
    try {
        const response = await fetch(endpoint, { method: "GET", headers: {
            "Content-Type": "application/json",
        }, });

        const data: any = await response.json();

        if (data.error) {
            throw new Error(`Error: ${data.error.message}`);
        }

        fs.writeFileSync("./jsons/apiResp.json", JSON.stringify(data));
    } catch (error) {
        console.error("Transactions error: ", error);
    }
}

getInstruments();
