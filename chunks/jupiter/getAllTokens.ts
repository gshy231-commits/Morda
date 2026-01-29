import fs from "fs";

async function getAllTokens() {
    const url: string = "https://api.jup.ag";
    const endpoint: string = "/tokens/v1/all";

    try {
        const request: string = `${url + endpoint}`;

        const response: any = await fetch(request, { method: "GET" });
        const data = await response.json();

        console.log(data.length);
        fs.writeFileSync("./jsons/allTokens.json", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Request error: ", error);
    }
}

getAllTokens();
