import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

(async () => {
    const connection = new Connection(
        clusterApiUrl("http://127.0.0.1:8899"),
        "confirmed"
    );

    const tokenAccount = new PublicKey(
        "37iT6V7Y7EtnyiNcdbGVnjPRbMdzLJayKJ197jFXwpdB"
    );

    let tokenAmount = await connection.getTokenAccountBalance(tokenAccount);
    console.log(`amount: ${tokenAmount.value.amount}`);
    console.log(`decimals: ${tokenAmount.value.decimals}`);
})();
