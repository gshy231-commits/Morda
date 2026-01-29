#!/usr/bin/env ts-node

import { readFileSync } from 'fs';

function loadJson(path: string): any[] {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw);
}

function extractChains(dict: any[]): string[] {
    return dict
        .map(item => (typeof item.chain === 'string' ? item.chain.trim() : ''))
        .filter(c => c && c.toUpperCase() !== 'NONE');
}

function countUniqueChains(fileA: string, fileB: string): number {
    const chainsA = extractChains(loadJson(fileA));
    const chainsB = extractChains(loadJson(fileB));
    const unique = new Set([...chainsA, ...chainsB].map(c => c.toUpperCase()));
    return unique.size;
}

if (process.argv.length < 4) {
    console.error('Usage: ts-node countChains.ts <exchange1.json> <exchange2.json>');
    process.exit(1);
}

const [file1, file2] = process.argv.slice(2, 4);
const total = countUniqueChains(file1, file2);
console.log(`Total unique chains: ${total}`);
