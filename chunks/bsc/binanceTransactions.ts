import fs from "fs";

const bscRpcUrl = 'https://bsc-dataseed.binance.org/';

const callRPC = async (method: string, params: any[] = []) => {
	const response = await fetch(bscRpcUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			method: method,
			params: params,
		}),
	});

	const data = await response.json();
	return data.result;
};

const getLatestBlockNumber = async () => {
	const blockNumber = await callRPC('eth_blockNumber');
	console.log(`Current block: ${parseInt(blockNumber, 16)}`);
	return blockNumber;
};

const getBlockByNumber = async (blockNumber: number) => {
	const block = await callRPC('eth_getBlockByNumber', [
		`0x${blockNumber.toString(16)}`,
		true,
	]);

	fs.writeFileSync("./jsons/blockData.json", JSON.stringify(block, null, 2));
	console.log(`Data of block #${blockNumber}:`, block);
};

const getTransactionByHash = async (txHash: string) => {
	const tx = await callRPC('eth_getTransactionByHash', [txHash]);
	
};

const main = async () => {
	const currentBlock = parseInt(await getLatestBlockNumber(), 16); 

	await getBlockByNumber(currentBlock - 1);

	const txHash = '0xc39395a926876f3807dfcb91648734f762e5ef5cf8adb17601819a063126cdd3';
	await getTransactionByHash(txHash);
};

main();
