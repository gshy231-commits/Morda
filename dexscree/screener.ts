import fs from 'fs';

const ERROR_LOG_FILE = 'dexscreener_errors.log';
const LOG_FILE = 'dexscreener.log';
const CHAIN_ID = 'solana';
const TOKEN_ADDRESSES = [
    'WppXGfc63fwKSNpK42xVRxxV8dRBtHKRE6YQPhMpump',
    '8xbMY4atJXBNKR8Kk3u9y5XztXMd56uS8TXY9Gx5RwMJ',
    'Buoj8HCZMnLRwzDmjzaswhkVhLZD58PG4pZ7rnYp6pCr',
    '5hh9G4yyHAkgRoBhAuypg3njckEULUmV197LWycugyJc',
    'H84qihes12nVQarr8rzmw87hDXUbHtFKRm5joBcbpump',
    '7qmWe2vUhhV1PJyN5aYUK3D5gBPkyFiwc4x5FrDcnTHZ',
    '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2',
    '5wQFpZ2Xstd6khM8WwtVdhegiNEjM48DYErMVVknpump',
    'C29ebrgYjYoJPMGPnPSGY1q3mMGk4iDSqnQeQQA7moon',
    'FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P',
    'DehUesyqV7jg2RhEbkpprWuCTCNC5BLSdpRfYEtQpump',
    '8ncucXv6U6epZKHPbgaEBcEK399TpHGKCquSt4RnmX4f',
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn',
    'HNg5PYJmtqcmzXrv6S9zP1CDKk5BgDuyFBxbvNApump',
    '5UuVmAgRCX29qrjFor1gQwnAysVkaYrpBMwmKmfBpump',
    'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
    'KENJSUYLASHUMfHyy5o4Hp2FdNqZg1AsUPhfH2kYvEP',
    'J5DzAP6j17bXBXykvkQVM5ntfyWAdL88okBQvDH9pump',
    'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump',
    'A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump',
    '63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9',
    'FasH397CeZLNYWkd3wWK9vrmjd1z93n3b59DssRXpump',
    '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    'Dfh5DzRgSvvCFDoYc2ciTkMrbDfRKybA4SoFbPmApump',
    'AGF2AW8nosA9rDxgfkHpqN5tTxoqBPreS5MqhRxxzg6i',
    'E7W5ViSS3yvmdBn5qBhM9ZJV1sMuug7ph7joARPXpump',
    '9WyRszmxLf1e9nWAVf4p7j7S2ektkLu74PTLVVKLpump',
    '3SQSwa5PXDWoBjCGi5uXCgNZ7FDCD8gG8Ai5UkLppump',
    '4rwPNRSFgcS7EGphFdX7VwXuhjZGxph7gYyb7Zp2pump'

];
const BATCH_SIZE = 30;
const MAX_REQUESTS_PER_SECOND = 5;
const MS_BETWEEN_REQUESTS = 1000 / MAX_REQUESTS_PER_SECOND;

let failedRequests = 0;

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
const errorLogStream = fs.createWriteStream(ERROR_LOG_FILE, { flags: 'a' });

function chunkArray(array, size) {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, (i + 1) * size)
    );
}

async function logData(logEntries) {
    for (const entry of logEntries) {
        logStream.write(JSON.stringify(entry) + '\n');
    }
}

function logError(entry) {
    errorLogStream.write(JSON.stringify(entry) + '\n');
}

async function fetchTokenData(tokenBatch) {
    const url = `https://api.dexscreener.com/tokens/v1/${CHAIN_ID}/${tokenBatch.join(',')}`;
    const response = await fetch(url);
    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
    }

    if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected content-type ${contentType}: ${text}`);
    }

    const data = JSON.parse(text);
    return { status: response.status, data };
}

async function fetchAndLog(batch) {
    try {
        const result = await fetchTokenData(batch);

        if (result.status < 200 || result.status >= 300) {
            failedRequests++;
            const errorEntry = {
                timestamp: new Date().toISOString(),
                status: result.status,
                batch,
                response: result.data
            };
            logError(errorEntry);
            console.error(`Неуспешный запрос: ${result.status}`);
            return;
        }

        const logs = result.data.map(item => ({
            timestamp: new Date().toISOString(),
            status: result.status,
            chainId: CHAIN_ID,
            apiResponse: item
        }));

        await logData(logs);
        console.log(`Logged ${logs.length} entries`);
    } catch (error) {
        failedRequests++;
        const errorEntry = {
            timestamp: new Date().toISOString(),
            batch,
            message: error.message
        };
        logError(errorEntry);
        console.error(`Ошибка обработки пачки: ${error.message}`);
    }
}

function monitorTokens() {
    const batches = chunkArray(TOKEN_ADDRESSES, BATCH_SIZE);
    let batchIndex = 0;

    const timeUpdater = setInterval(() => {
        const currentTime = new Date().toLocaleTimeString();
        process.stdout.write(`\rТекущее время: ${currentTime} `);
    }, 1000);

    setInterval(() => {
        console.log(`\nНеуспешные запросы: ${failedRequests}`);
    }, 10_000);

    (async () => {
        while (true) {
            const currentBatch = batches[batchIndex % batches.length];
            batchIndex++;

            await fetchAndLog(currentBatch);
            await new Promise(resolve => setTimeout(resolve, MS_BETWEEN_REQUESTS));
        }
    })();
}

monitorTokens();
