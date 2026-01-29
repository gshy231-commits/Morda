import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

interface TokenEntry {
    Exchange: string;
    Contract: string;
    Symbol: string;
    BaseName: string;
    Chain: string;
    PriceFactor: number;
    IsDepositAllowed: boolean | null;
    IsWithdrawAllowed: boolean | null;
    Note: string;
    ChainConflict?: Record<string, string>; 
}

const CG_API_KEY = process.env.CG_API_KEY ?? "CG-tyvnpsnUck4WDGkvkRjmbLPB";
const BYBIT_ENDPOINT =
    "https://api.coingecko.com/api/v3/derivatives/exchanges/bybit?include_tickers=all";
const COINS_LIST_ENDPOINT =
    "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
const OUT_FILE = path.resolve("./bybit_tokens.json");

const CHAIN_PRIORITY = [
    "ethereum",
    "binance-smart-chain",
    "arbitrum-one",
    "polygon-pos",
    "optimism",
    "base",
];

const MAX_RPM = 25; 
const BASE_DELAY_MS = Math.ceil(60_000 / MAX_RPM);
const VERBOSE = !process.argv.includes("--quiet");

function log(...msg: any[]) {
    if (VERBOSE) console.log(new Date().toISOString(), "|", ...msg);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url: string, tries = 3, delay = BASE_DELAY_MS): Promise<any> {
    while (tries-- >= 0) {
        const res = await fetch(url, {
            headers: { Accept: "application/json", "x-cg-demo-api-key": CG_API_KEY },
        });
        if (res.status !== 429) {
            if (!res.ok) throw new Error(`${url} → ${res.status}`);
            return res.json();
        }
        const wait = Number(res.headers.get("Retry-After")) || delay / 1000;
        log("429", url, "retry in", wait, "s");
        await sleep(wait * 1000);
        delay *= 2;
    }
    throw new Error(`Too many 429s for ${url}`);
}

function parseBase(base: string): { factor: number; name: string } {
    const m = base.match(/^(\d+)?([A-Z0-9]+)$/i);
    if (!m) return { factor: 1, name: base.toUpperCase() };
    const [, digits, token] = m;
    return { factor: digits ? Number(digits) : 1, name: token.toUpperCase() };
}

function pickPrimary(plats: Record<string, string>): [string, string] {
    for (const c of CHAIN_PRIORITY) if (plats[c]) return [c, plats[c]];
    const [c = "", a = ""] = Object.entries(plats)[0] ?? [];
    return [c, a];
}

async function buildSkeleton(): Promise<TokenEntry[]> {
    log("Fetching Bybit tickers…");
    const { tickers } = await fetchJSON(BYBIT_ENDPOINT);
    const usdtTickers = (tickers as any[]).filter((t) => t.target === "USDT");
    log(`Total ${tickers.length} tickers, kept ${usdtTickers.length} USDT pairs.`);

    return usdtTickers.map((t) => {
        const { factor, name } = parseBase(t.base as string);
        return {
            Exchange: "Bybit",
            Contract: "",
            Symbol: t.symbol as string,
            BaseName: name,
            Chain: "",
            PriceFactor: factor,
            IsDepositAllowed: null,
            IsWithdrawAllowed: null,
            Note: "",
        } as TokenEntry;
    });
}

async function symbolIdMap(): Promise<Record<string, string>> {
    log("Fetching /coins/list…");
    const list = (await fetchJSON(COINS_LIST_ENDPOINT)) as { id: string; symbol: string }[];
    const map: Record<string, string> = {};
    list.forEach(({ id, symbol }) => (map[symbol.toUpperCase()] = id));
    return map;
}

function detailURL(id: string) {
    return `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false&dex_pair_format=contract_address`;
}

async function enrich(dict: TokenEntry[]) {
    const idMap = await symbolIdMap();
    let done = 0,
        skip = 0;

    for (const [i, e] of dict.entries()) {
        if (e.Contract) {
            done++;
            continue;
        }

        const cid = idMap[e.BaseName];
        if (!cid) {
            e.Note = "symbol_not_found";
            skip++;
            log(`[${i + 1}/${dict.length}]`, e.BaseName, "– symbol not found");
            await sleep(BASE_DELAY_MS);
            continue;
        }

        const { platforms } = await fetchJSON(detailURL(cid));
        const plats = Object.fromEntries(
            Object.entries(platforms || {}).filter(([, addr]) => addr)
        );
        if (!Object.keys(plats).length) {
            e.Note = "no_contract";
            skip++;
            log(`[${i + 1}/${dict.length}]`, e.BaseName, "– no contract address");
            await sleep(BASE_DELAY_MS);
            continue;
        }

        const [chain, contract] = pickPrimary(plats);
        e.Chain = chain;
        e.Contract = contract;

        if (Object.keys(plats).length > 1) {
            e.ChainConflict = plats;
            e.Note = "multiple_chains";
        }

        done++;
        log(`[${i + 1}/${dict.length}]`, e.BaseName, "→", chain, contract);
        await sleep(BASE_DELAY_MS);
    }
    log(`Enrichment complete: ${done} resolved, ${skip} skipped`);
}

(async () => {
    const t0 = Date.now();
    let dict: TokenEntry[];
    try {
        dict = JSON.parse(await readFile(OUT_FILE, "utf-8"));
        log("Loaded", dict.length, "existing entries");
    } catch {
        dict = await buildSkeleton();
    }

    await enrich(dict);
    await writeFile(OUT_FILE, JSON.stringify(dict, null, 2), "utf-8");
    log(`Saved → ${OUT_FILE} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
})();
