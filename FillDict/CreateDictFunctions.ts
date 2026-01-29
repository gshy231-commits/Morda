import {promises as fs} from "fs";
import {pathToFileURL} from "url";
import crypto from "crypto";

const now = () => new Date().toISOString().split("T")[1].slice(0, 8); 
const log = (tag: string, ...m: unknown[]) => console.log(`${now()} [${tag}]`, ...m);

async function saveJson(name: string, data: unknown) {
    await fs.mkdir("output", {recursive: true}).catch(() => {
    });
    await fs.writeFile(`output/${name}`, JSON.stringify(data, null, 2), "utf8");
    log("FILE", `${name} saved`);
}

async function fetchJson<T>(
    tag: string,
    url: string,
    opts: RequestInit = {method: "GET", headers: {Accept: "application/json"}}
): Promise<T> {
    log(tag, "→", url);
    const r = await fetch(url, opts);
    log(tag, "←", r.status);
    if (!r.ok) throw Error(`${url} → ${r.status}`);
    return r.json() as Promise<T>;
}

export interface CoinRecord {
    contract: string;
    symbol: string;
    baseName: string;
    chain: string;
    priceFactor: number;
    isDepositAllowed: boolean;
    isWithdrawAllowed: boolean;
    depositAllowedChains: string[];
    depositDisabledChains: string[];
    withdrawAllowedChains: string[];
    withdrawDisabledChains: string[];
    indexConstituents: { exchange: string; symbols: string[] }[];
    multiChain: boolean;
    multiChainContracts: Record<string, string[]>;
    gateSymbol?: string;
    mexcSymbol?: string;
    bitgetSymbol?: string;
    bybitSymbol?: string;
    gateBase?: string;
    mexcBase?: string;
    bitgetBase?: string;
    bybitBase?: string;
}

interface CoinSummary {
    symbol: string;
    depositAllowedChains: string[];
    depositDisabledChains: string[];
    withdrawAllowedChains: string[];
    withdrawDisabledChains: string[];
}

namespace Gate {
    export interface Chain {
        name: string;
        addr: string;
        deposit_disabled: boolean;
        withdraw_disabled: boolean;
    }

    export interface Coin {
        currency: string;
        name: string;
        chain: string;
        chains: Chain[];
        deposit_disabled: boolean;
        withdraw_disabled: boolean;
    }

    export interface Fut {
        name: string;
        underlying: string;
    }

    export interface Wall {
        chain: string;
        contract_address: string;
        is_deposit_disabled: number;
        is_withdraw_disabled: number;
    }

    export interface Idx {
        constituents: { exchange: string; symbols: string[] }[];
    }

    const API = "https://api.gateio.ws/api/v4";
    const spot = () => fetchJson<Coin[]>("GATE", `${API}/spot/currencies`);
    const fut = () => fetchJson<Fut[]>("GATE", `${API}/futures/usdt/contracts`);
    const wallet = (c: string) => fetchJson<Wall[]>("GATE", `${API}/wallet/currency_chains?currency=${encodeURIComponent(c)}`).catch(() => []);
    const idx = (c: string) => fetchJson<Idx>("GATE", `${API}/futures/usdt/index_constituents/${c}_USDT`).catch(() => undefined);
    const under = (f: Fut) => (f.underlying || f.name).toUpperCase().replace(/_?USDT$/, "");

    function map(c: Coin): CoinRecord[] {
        
        const contracts: Record<string, string[]> = {};
        const chains = c.chains.length
            ? c.chains
            : [{
                name: c.chain || c.currency,
                addr: "",
                deposit_disabled: c.deposit_disabled,
                withdraw_disabled: c.withdraw_disabled
            }];

        chains.forEach(ch => {
            if (!contracts[ch.name]) contracts[ch.name] = [];
            if (ch.addr) contracts[ch.name].push(ch.addr);
        });
        const multi = Object.keys(contracts).length > 1;
        const depA = chains.filter(x => !x.deposit_disabled).map(x => x.name);
        const depD = chains.filter(x => x.deposit_disabled).map(x => x.name);
        const wdA = chains.filter(x => !x.withdraw_disabled).map(x => x.name);
        const wdD = chains.filter(x => x.withdraw_disabled).map(x => x.name);

        return chains.map(ch => ({
            contract: ch.addr || "",
            symbol: c.currency,
            baseName: c.name || c.currency,
            chain: ch.name,
            priceFactor: 1,
            isDepositAllowed: !ch.deposit_disabled,
            isWithdrawAllowed: !ch.withdraw_disabled,
            depositAllowedChains: depA,
            depositDisabledChains: depD,
            withdrawAllowedChains: wdA,
            withdrawDisabledChains: wdD,
            indexConstituents: [],
            multiChain: multi,
            multiChainContracts: contracts,
            gateSymbol: c.currency, gateBase: c.currency
        }));
    }

    export async function records(): Promise<CoinRecord[]> {
        log("GATE", "fetching…");
        const [spotList, futList] = await Promise.all([spot(), fut()]);
        const futSet = new Set(futList.map(under));
        let base = spotList.flatMap(map).filter(r => futSet.has(r.symbol.toUpperCase()));
        log("GATE", `after futures filter: ${base.length}`);

        const uniq = [...new Set(base.map(r => r.symbol))];
        const wMap = new Map<string, Wall[]>();
        const iMap = new Map<string, Idx["constituents"]>();
        for (const s of uniq) {
            wMap.set(s, await wallet(s));
            const i = await idx(s);
            if (i) iMap.set(s, i.constituents);
        }

        base = base.map(r => {
            const ws = wMap.get(r.symbol) || [];
            const info = ws.find(c => c.chain.toUpperCase() === r.chain.toUpperCase());

            const depA = [...new Set(ws.filter(c => c.is_deposit_disabled === 0).map(c => c.chain))];
            const depD = [...new Set(ws.filter(c => c.is_deposit_disabled !== 0).map(c => c.chain))];
            const wdA = [...new Set(ws.filter(c => c.is_withdraw_disabled === 0).map(c => c.chain))];
            const wdD = [...new Set(ws.filter(c => c.is_withdraw_disabled !== 0).map(c => c.chain))];

            return {
                ...r,
                contract: info?.contract_address || r.contract,
                isDepositAllowed: info ? info.is_deposit_disabled === 0 : r.isDepositAllowed,
                isWithdrawAllowed: info ? info.is_withdraw_disabled === 0 : r.isWithdrawAllowed,
                depositAllowedChains: depA,
                depositDisabledChains: depD,
                withdrawAllowedChains: wdA,
                withdrawDisabledChains: wdD,
                indexConstituents: iMap.get(r.symbol) || []
            };
        });

        return base;
    }
}

namespace MEXC {
    export interface Net {
        network: string;
        depositEnable: boolean;
        withdrawEnable: boolean;
        contract: string;
    }

    export interface Coin {
        coin: string;
        Name: string;
        networkList: Net[];
    }

    export interface Fut {
        symbol: string;
        futureType: number;
        state: number;
        indexOrigin: string[];
    }

    const HOST = "https://api.mexc.com", KEY = process.env.MEXC_API_KEY || "mx0vgllu77z1DsbJHe", SEC = process.env.MEXC_API_SECRET || "3037f870a29e42b2ae6de2495a91ff8d";
    const sign = o => {
        const qs = new URLSearchParams(o).toString();
        const h = crypto.createHmac("sha256", SEC).update(qs).digest("hex");
        return `${qs}&signature=${h}`;
    };
    const spot = () => KEY ? fetchJson<Coin[]>("MEXC", `${HOST}/api/v3/capital/config/getall?${sign({
        timestamp: Date.now(),
        recvWindow: 5000
    })}`, {headers: {"X-MEXC-APIKEY": KEY}}) : Promise.resolve([]);
    const fut = () => fetchJson<{ data: Fut[] }>("MEXC", "https://contract.mexc.com/api/v1/contract/detail")
        .then(r => r.data.filter(x => x.futureType === 1 && x.state === 0));

    function map(c: Coin, idxArr: string[]): CoinRecord[] {
        const contracts: Record<string, string[]> = {}, depA: string[] = [], depD: string[] = [], wdA: string[] = [],
            wdD: string[] = [];
        c.networkList.forEach(n => {
            if (!contracts[n.network]) contracts[n.network] = [];
            if (n.contract) contracts[n.network].push(n.contract);
            (n.depositEnable ? depA : depD).push(n.network);
            (n.withdrawEnable ? wdA : wdD).push(n.network);
        });
        const multi = Object.keys(contracts).length > 1;
        const idx = idxArr.map(ex => ({exchange: ex, symbols: [`${c.coin}_USDT`]}));
        return c.networkList.map(n => ({
            contract: n.contract || "",
            symbol: c.coin,
            baseName: c.Name || c.coin,
            chain: n.network,
            priceFactor: 1,
            isDepositAllowed: n.depositEnable,
            isWithdrawAllowed: n.withdrawEnable,
            depositAllowedChains: depA,
            depositDisabledChains: depD,
            withdrawAllowedChains: wdA,
            withdrawDisabledChains: wdD,
            indexConstituents: idx,
            multiChain: multi,
            multiChainContracts: contracts,
            mexcSymbol: c.coin,
            mexcBase: c.coin
        }));
    }

    export async function records(): Promise<CoinRecord[]> {
        log("MEXC", "fetching…");
        const [spotList, futList] = await Promise.all([spot(), fut()]);
        const futSet = new Set(futList.map(f => f.symbol.split("_")[0].toUpperCase()));
        const idxMap = new Map<string, string[]>();
        futList.forEach(f => idxMap.set(f.symbol.split("_")[0].toUpperCase(), f.indexOrigin));
        const res = spotList.filter(c => futSet.has(c.coin.toUpperCase()))
            .flatMap(c => map(c, idxMap.get(c.coin.toUpperCase()) || []));
        log("MEXC", `after futures filter: ${res.length}`);
        return res;
    }
}

namespace Bitget {
    export interface Chain {
        chain: string;
        withdrawable: string;
        rechargeable: string;
        contractAddress: string | null;
    }

    export interface Coin {
        coin: string;
        chains: Chain[];
    }

    export interface SpotResp {
        data: Coin[];
    }

    interface FutResp {
        data: { symbol: string }[];
    }

    const spot = () => fetchJson<SpotResp>("BITGET", "https://api.bitget.com/api/v2/spot/public/coins").then(r => r.data);
    const fut = () => fetchJson<FutResp>("BITGET", "https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES").then(r => r.data);
    const base = (s: string) => s.split("_")[0].replace(/^[0-9]+/, "").replace(/USDT?$/i, "").replace(/USD$/i, "").toUpperCase();

    function map(c: Coin): CoinRecord[] {
        const contracts: Record<string, string[]> = {}, depA: string[] = [], depD: string[] = [], wdA: string[] = [],
            wdD: string[] = [];
        c.chains.forEach(ch => {
            if (!contracts[ch.chain]) contracts[ch.chain] = [];
            if (ch.contractAddress) contracts[ch.chain].push(ch.contractAddress);
            (ch.rechargeable === "true" ? depA : depD).push(ch.chain);
            (ch.withdrawable === "true" ? wdA : wdD).push(ch.chain);
        });
        const multi = Object.keys(contracts).length > 1;
        return c.chains.map(ch => ({
            contract: ch.contractAddress || "",
            symbol: c.coin,
            baseName: c.coin,
            chain: ch.chain,
            priceFactor: 1,
            isDepositAllowed: ch.rechargeable === "true",
            isWithdrawAllowed: ch.withdrawable === "true",
            depositAllowedChains: depA,
            depositDisabledChains: depD,
            withdrawAllowedChains: wdA,
            withdrawDisabledChains: wdD,
            indexConstituents: [],
            multiChain: multi,
            multiChainContracts: contracts,
            bitgetSymbol: c.coin,
            bitgetBase: c.coin
        }));
    }

    export async function records(): Promise<CoinRecord[]> {
        log("BITGET", "fetching…");
        const [spotList, futList] = await Promise.all([spot(), fut()]);
        const futSet = new Set(futList.map(f => base(f.symbol)));
        const res = spotList.filter(c => futSet.has(c.coin.toUpperCase()))
            .flatMap(map);
        log("BITGET", `after futures filter: ${res.length}`);
        return res;
    }
}

namespace Bybit {
    export interface Chain {
        chain: string;
        rechargable: number;
        withdrawable: number;
        contractAddress?: string;
    }

    export interface Coin {
        coin: string;
        name: string;
        chains: Chain[];
    }

    export interface SpotResp {
        retCode: number;
        retMsg: string;
        result: { rows: Coin[] }
    }

    export interface FutResp {
        retCode: number;
        retMsg: string;
        result: { list: { symbol: string; }[] }
    }

    const KEY = process.env.BYBIT_API_KEY || "CE2BhOFHvQkTlawr5t", SEC = process.env.BYBIT_API_SECRET || "7PVmRxUleClqRl5cs0NLGKGpnhELDYqtL5sL", REC = "30000";
    const head = ts => ({
        "X-BAPI-API-KEY": KEY,
        "X-BAPI-SIGN": crypto.createHmac("sha256", SEC).update(ts + KEY + REC).digest("hex").toLowerCase(),
        "X-BAPI-SIGN-TYPE": "2",
        "X-BAPI-TIMESTAMP": ts,
        "X-BAPI-RECV-WINDOW": REC
    });
    const spot = async () => {
        if (!KEY || !SEC) {
            log("BYBIT", "keys not set – skip");
            return [];
        }
        const ts = Date.now().toString();
        const txt = await fetch("https://api.bybit.com/v5/asset/coin/query-info", {headers: head(ts)}).then(r => r.text());
        const j: SpotResp = JSON.parse(txt);
        if (j.retCode !== 0) throw Error(j.retMsg);
        return j.result.rows;
    };
    const fut = () => fetchJson<FutResp>("BYBIT", "https://api.bybit.com/v5/market/tickers?category=linear").then(r => r.result.list);
    const clean = s => s.replace(/^1000000000|^100000000|^10000000|^1000000|^100000|^10000|^1000|^100|^10/, "").replace(/USDT$/, "").replace(/USD$/, "").toUpperCase();

    function map(c: Coin): CoinRecord[] {
        const contracts: Record<string, string[]> = {}, depA: string[] = [], depD: string[] = [], wdA: string[] = [],
            wdD: string[] = [];
        c.chains.forEach(ch => {
            if (!contracts[ch.chain]) contracts[ch.chain] = [];
            if (ch.contractAddress) contracts[ch.chain].push(ch.contractAddress);
            (ch.rechargable === 1 ? depA : depD).push(ch.chain);
            (ch.withdrawable === 1 ? wdA : wdD).push(ch.chain);
        });
        const multi = Object.keys(contracts).length > 1;
        return c.chains.map(ch => ({
            contract: ch.contractAddress || "",
            symbol: c.coin,
            baseName: c.name || c.coin,
            chain: ch.chain,
            priceFactor: 1,
            isDepositAllowed: ch.rechargable === 1,
            isWithdrawAllowed: ch.withdrawable === 1,
            depositAllowedChains: depA,
            depositDisabledChains: depD,
            withdrawAllowedChains: wdA,
            withdrawDisabledChains: wdD,
            indexConstituents: [],
            multiChain: multi,
            multiChainContracts: contracts,
            bybitSymbol: c.coin,
            bybitBase: c.coin
        }));
    }

    export async function records(): Promise<CoinRecord[]> {
        log("BYBIT", "fetching…");
        const [spotList, futList] = await Promise.all([spot(), fut()]);
        const futSet = new Set(futList.map(f => clean(f.symbol)));
        const res = spotList.filter(c => futSet.has(c.coin.toUpperCase()))
            .flatMap(map);
        log("BYBIT", `after futures filter: ${res.length}`);
        return res;
    }
}

function aggregate(arr: CoinRecord[]): CoinSummary[] {
    const m = new Map<string, CoinSummary>();
    arr.forEach(r => {
        let s = m.get(r.symbol);
        if (!s) {
            s = {
                symbol: r.symbol,
                depositAllowedChains: [],
                depositDisabledChains: [],
                withdrawAllowedChains: [],
                withdrawDisabledChains: []
            };
            m.set(r.symbol, s);
        }
        r.depositAllowedChains.forEach(c => !s.depositAllowedChains.includes(c) && s.depositAllowedChains.push(c));
        r.depositDisabledChains.forEach(c => !s.depositDisabledChains.includes(c) && s.depositDisabledChains.push(c));
        r.withdrawAllowedChains.forEach(c => !s.withdrawAllowedChains.includes(c) && s.withdrawAllowedChains.push(c));
        r.withdrawDisabledChains.forEach(c => !s.withdrawDisabledChains.includes(c) && s.withdrawDisabledChains.push(c));
    });
    return [...m.values()];
}

const dictKey = (r: CoinRecord) => r.symbol ? r.symbol.toUpperCase() : r.contract.toLowerCase();

function buildUnifiedDictionary(...lists: CoinRecord[]): CoinRecord[] {
    const all = lists.flat();
    all.sort((a, b) => dictKey(a).localeCompare(dictKey(b)));
    return all;
}

function standalone() {
    try {
        if (typeof import.meta !== "undefined") return pathToFileURL(process.argv[1]).href === import.meta.url;
    } catch {
    }
    
    return typeof require === "function" && require.main === module;
}

if (standalone()) {
    (async () => {
        log("APP", "start");

        const [gate, mexc, bitget, bybit] = await Promise.all([
            Gate.records(),
            MEXC.records(),
            Bitget.records(),
            Bybit.records()
        ]);

        await saveJson("gate_chain.json", gate);
        await saveJson("gate_symbol.json", aggregate(gate));
        await saveJson("mexc_chain.json", mexc);
        await saveJson("mexc_symbol.json", aggregate(mexc));
        await saveJson("bitget_chain.json", bitget);
        await saveJson("bitget_symbol.json", aggregate(bitget));
        await saveJson("bybit_chain.json", bybit);
        await saveJson("bybit_symbol.json", aggregate(bybit));

        const unified = buildUnifiedDictionary(gate, mexc, bitget, bybit);
        log("APP", `unified records: ${unified.length}`);
        await saveJson("all_exchanges_unified.json", unified);

        log("APP", "Done ✔");
    })().catch(e => {
        console.error(e);
        process.exit(1);
    });
}
