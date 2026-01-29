import fs from "fs";

async function getPrice() {
    const url: string = "https://api.jup.ag";
    const endpoint: string = "/price/v2";
    const baseIds: string = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN, So11111111111111111111111111111111111111112";
    const quoteId: string = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

    try {
        const request: string = `${url + endpoint}?ids=${baseIds}&vsToken=${quoteId}`; 

        const response: any = await fetch(request, { method: "GET" });
        const data = await response.json();

        fs.writeFileSync("./jsons/groupPrices.json", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Request error: ", error);
    }
}

getPrice();
