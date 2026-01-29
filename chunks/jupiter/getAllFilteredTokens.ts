import fs from "fs";

async function getAllTokens() {
    const url: string = "https://api.jup.ag";
    const endpoint: string = "/tokens/v1/all";

    try {
        const request: string = `${url + endpoint}`;
        const response: any = await fetch(request, { method: "GET" });
        const data = await response.json();

        const filteredData = data.filter((token: any) => token.tags?.includes("verified"));

        console.log(`Total tokens: ${data.length}`);
        console.log(`Filtered tokens: ${filteredData.length}`);

        fs.writeFileSync("./jsons/verifiedTokens.json", JSON.stringify(filteredData, null, 2));
    } catch (error) {
        console.error("Request error: ", error);
    }
}

getAllTokens();
