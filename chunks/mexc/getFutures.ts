import fs from "fs";
 
 async function getFutures() {
     const endpoint: string = "https://contract.mexc.com/api/v1/contract/detail";
     try {
         const response = await fetch(endpoint, { method: "GET" });
 
         const data: any = await response.json();
 
         if (data.error) {
             throw new Error(`Error: ${data.error.message}`);
         }
 
         console.log(data.data.length);
 
         fs.writeFileSync("./jsons/futures.json", JSON.stringify(data.data));
     } catch (error) {
         console.error("Transactions error: ", error);
     }
 }
 
 getFutures();
