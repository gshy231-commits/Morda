import fs from "fs";

const jsonData = fs.readFileSync('./jsons/instruments.json', 'utf-8');
const instruments = JSON.parse(jsonData);

const symbols = instruments.map((item: { symbol: string }) => item.symbol);

function chunkSymbols<T>(array: T[], chunkSize: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function chunkInstruments(instruments: any[], chunkSize: number): any[][] {
    const chunks = [];
    for (let i = 0; i < instruments.length; i += chunkSize) {
        chunks.push(instruments.slice(i, i + chunkSize));
    }
    return chunks;
}

const chunkedInstruments = chunkSymbols(symbols, 10);

console.log(chunkedInstruments.at(-1));
