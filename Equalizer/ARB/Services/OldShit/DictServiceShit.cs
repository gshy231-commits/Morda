using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using ARB.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ARB
{
    public sealed class DictServiceShit(IMemoryCache cache, ILogger<DictServiceShit> logger) : BackgroundService
    {
        private readonly IMemoryCache _cache = cache;
        private readonly ILogger<DictServiceShit> _logger = logger;
        private readonly HttpClient _http = new();
        private readonly string CG_API_KEY = "CG-KvnbzHqs557kDsTLejHMtXxK";
        private readonly int DelayMs = 2000;
        private DateTime _lastReqTime = DateTime.MinValue;
        private static JsonSerializerOptions serializerOptions = new() { WriteIndented = true };
        private static string? allGeckoJsonString = File.ReadAllText("./Temp/AllGeckoCoins.json");
        private static string? allGeckoCoinsJsonString = File.ReadAllText("./Temp/AllGeckoCoinsTwo.json");
        private List<FullTicker>? oldGeckoTokens = JsonSerializer.Deserialize<List<FullTicker>>(allGeckoJsonString ?? "");
        private List<CoinInfo>? oldGeckoCoins = JsonSerializer.Deserialize<List<CoinInfo>>(allGeckoJsonString ?? "");


        private static readonly string[] ExchangeIds =
        {
            "binance", "bitget", "bitmart", "bybit_spot", "gate", "huobi",
            "kucoin", "lbank", "mxc", "okex", "poloniex", "xt"
        };

        private static readonly HashSet<string> TargetChains = new(StringComparer.OrdinalIgnoreCase)
        {
            "ethereum", "solana", "arbitrum-one", "scroll", "zksync", "binance-smart-chain",
            "base", "zora-network", "sui", "optimistic-ethereum", "avalanche", "tron",
            "the-open-network", "aptos", "near-protocol", "kava", "celo", "linea", "polygon-pos", "osmosis"
        };

        private static readonly HashSet<string> AllowedTargets = new(StringComparer.OrdinalIgnoreCase)
        {
            "USDT", "USDC", "ETH", "SOL"
        };

        private static readonly Dictionary<string, Dictionary<string, AssetRec>> _assets =
            new(StringComparer.OrdinalIgnoreCase);

        private static decimal P(string s) =>
            decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var r) ? r : 0m;

        private async Task CalcDelay(CancellationToken ct)
        {
            DateTime now = DateTime.UtcNow;
            var el = (now - _lastReqTime).TotalMilliseconds;

            if (el < DelayMs)
            {
                await Task.Delay(DelayMs - (int)el, ct);
            }

            _lastReqTime = DateTime.UtcNow;
        }

        private async Task<List<FullTicker>> LoadAllTickersAsync(CancellationToken ct)
        {
            List<FullTicker> all = [];

            foreach (string? ex in ExchangeIds)
            {
                _logger.LogInformation($"Scanning tokens for {ex} exchange");
                int page = 1;

                while (true)
                {
                    await CalcDelay(ct);

                    string? url = $"https://api.coingecko.com/api/v3/exchanges/{ex}/tickers?page={page}";
                    using HttpResponseMessage? resp = await _http.GetAsync(url, ct);

                    if (!resp.IsSuccessStatusCode) 
                    {
                        _logger.LogWarning($"EX: {ex}, page: {page} - data for page is out");
                        break; 
                    }

                    ExchangeResponse? dto = JsonSerializer.Deserialize<ExchangeResponse>(
                        await resp.Content.ReadAsStringAsync(ct),
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    List<TickerItem>? arr = dto?.Tickers;

                    if (arr == null || arr.Count == 0) 
                    {
                        _logger.LogWarning($"EX: {ex}, page: {page} - tickers is null or empty");
                        break;
                    }

                    all.AddRange(arr.Select(t => new FullTicker
                    {
                        ExchangeName = ex,
                        Base = t.Base,
                        Target = t.Target,
                        Last = t.Last,
                        Volume = t.Volume,
                        TradeUrl = t.TradeUrl?.Trim(),
                        CoinId = t.CoinId
                    }));

                    page++;
                }
            }

            //string stringedDict = JsonSerializer.Serialize(all, serializerOptions);
            //File.WriteAllText(@$"./Temp/AllGeckoCoins.json", stringedDict);

            return all;
        }

        private async Task<List<CoinInfo>> LoadCoinsAsync(CancellationToken ct)
        {
            await CalcDelay(ct);

            string? url = "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
            using HttpResponseMessage? resp = await _http.GetAsync(url, ct);
            resp.EnsureSuccessStatusCode();

            List<CoinInfo>? data = JsonSerializer.Deserialize<List<CoinInfo>>(
                await resp.Content.ReadAsStringAsync(ct),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

            string stringedDict = JsonSerializer.Serialize(data, serializerOptions);
            File.WriteAllText(@$"./Temp/AllGeckoCoinsTwo.json", stringedDict);

            return data;
        }

        private void AddAsset(string ex, string contract, string committedChain, bool dep, bool wd, decimal fee)
        {
            if (string.IsNullOrWhiteSpace(contract)) return;
            var key = contract.ToLowerInvariant();
            if (!_assets.TryGetValue(key, out var dict))
                _assets[key] = dict = new(StringComparer.OrdinalIgnoreCase);
            dict[ex] = new AssetRec
            {
                Exchange = ex,
                CommitedChain = committedChain,
                Deposit = dep,
                Withdraw = wd,
                Fee = fee
            };
        }

        private async Task TryLoad(Func<Task> loader, string name)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(CancellationToken.None);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            try
            {
                await loader();
            }
            catch (Exception ex) when (ex is TaskCanceledException or TimeoutException or HttpRequestException)
            {
                _logger.LogWarning($"Exception: {ex.Message}");
            }
        }

        private async Task LoadAssetsAsync(CancellationToken ct)
        {
            _assets.Clear();
            var tasks = new[]
            {
                TryLoad(() => GetBybitAsync(ct), "bybit_spot"),
                TryLoad(() => GetOkxAsync(ct), "okx"),
                TryLoad(() => GetMexcAsync(ct), "mxc"),
                TryLoad(() => GetBitgetAsync(ct), "bitget"),
                TryLoad(() => GetHtxAsync(ct), "huobi"),
                TryLoad(() => GetBitmartAsync(ct), "bitmart"),
                TryLoad(() => GetGateAsync(ct), "gate"),
                TryLoad(() => GetKucoinAsync(ct), "kucoin"),
                TryLoad(() => GetXtAsync(ct), "xt")
            };
            await Task.WhenAll(tasks);
            _logger.LogInformation("Assets loaded: {Count}", _assets.Sum(kv => kv.Value.Count));
        }

        #region ---- BYBIT ----

        private async Task GetBybitAsync(CancellationToken ct)
        {
            const string ak = "QHWbs5oM6KUY6LXFvT", sk = "Ta1HqC3lwoiPH152WwunY9gRPszrVTjXwnxI";
            var ts = (DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - 10_000).ToString();
            const string recv = "30000";
            string sigSrc = ts + ak + recv;
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(sk));
            var sig = BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(sigSrc))).Replace("-", "")
                .ToLower();
            var req = new HttpRequestMessage(HttpMethod.Get, "https://api.bybit.com/v5/asset/coin/query-info");
            req.Headers.Add("X-BAPI-API-KEY", ak);
            req.Headers.Add("X-BAPI-SIGN", sig);
            req.Headers.Add("X-BAPI-SIGN-TYPE", "2");
            req.Headers.Add("X-BAPI-TIMESTAMP", ts);
            req.Headers.Add("X-BAPI-RECV-WINDOW", recv);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.SendAsync(req, cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            if (!doc.RootElement.TryGetProperty("result", out var res) ||
                !res.TryGetProperty("rows", out var rows) ||
                rows.ValueKind != JsonValueKind.Array) return;
            foreach (var coin in rows.EnumerateArray())
            {
                if (!coin.TryGetProperty("chains", out var chains) ||
                    chains.ValueKind != JsonValueKind.Array) continue;
                foreach (var ch in chains.EnumerateArray())
                {
                    if (!ch.TryGetProperty("contractAddress", out var contractEl) ||
                        !ch.TryGetProperty("chain", out var chainEl) ||
                        !ch.TryGetProperty("chainDeposit", out var depEl) ||
                        !ch.TryGetProperty("chainWithdraw", out var wdEl) ||
                        !ch.TryGetProperty("withdrawFee", out var feeEl)) continue;
                    AddAsset("bybit",
                        contractEl.GetString() ?? "",
                        chainEl.GetString() ?? "",
                        depEl.GetString() == "1",
                        wdEl.GetString() == "1",
                        P(feeEl.GetString() ?? ""));
                }
            }
        }

        #endregion

        #region ---- OKX ----

        private async Task GetOkxAsync(CancellationToken ct)
        {
            const string ak = "4ad7a621-70fd-4a3a-baba-8fcbf3c6b50c",
                sk = "60887C137411ACFE3A89630420588431",
                pw = "Emilfayzullin2001)";
            var ts = (DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() / 1000.0).ToString("F3",
                CultureInfo.InvariantCulture);
            const string ep = "/api/v5/asset/currencies", mtd = "GET";
            string msg = ts + mtd + ep;
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(sk));
            var sig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(msg)));
            var req = new HttpRequestMessage(HttpMethod.Get, "https://www.okx.com" + ep);
            req.Headers.Add("OK-ACCESS-KEY", ak);
            req.Headers.Add("OK-ACCESS-SIGN", sig);
            req.Headers.Add("OK-ACCESS-TIMESTAMP", ts);
            req.Headers.Add("OK-ACCESS-PASSPHRASE", pw);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.SendAsync(req, cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            if (!doc.RootElement.TryGetProperty("data", out var data) ||
                data.ValueKind != JsonValueKind.Array) return;
            foreach (var coin in data.EnumerateArray())
            {
                if (!coin.TryGetProperty("ctAddr", out var ctEl) ||
                    !coin.TryGetProperty("chain", out var ch) ||
                    !coin.TryGetProperty("canDep", out var dep) ||
                    !coin.TryGetProperty("canWd", out var wd) ||
                    !coin.TryGetProperty("fee", out var fee)) continue;
                AddAsset("okex",
                    ctEl.GetString() ?? "",
                    ch.GetString() ?? "",
                    dep.GetBoolean(),
                    wd.GetBoolean(),
                    P(fee.GetString() ?? ""));
            }
        }

        #endregion

        #region ---- MEXC ----

        private async Task GetMexcAsync(CancellationToken ct)
        {
            const string ak = "mx0vglC0x7lRK7PA8q", sk = "4e435923cfac41a9a08b59236bc4895c";
            var ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            const string recv = "30000";
            string qs = $"recvWindow={recv}&timestamp={ts}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(sk));
            var sig = BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(qs))).Replace("-", "").ToLower();
            var url = $"https://api.mexc.com/api/v3/capital/config/getall?{qs}&signature={sig}";
            var req = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.Add("X-MEXC-APIKEY", ak);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.SendAsync(req, cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            foreach (var coin in doc.RootElement.EnumerateArray())
            {
                if (!coin.TryGetProperty("networkList", out var nets) ||
                    nets.ValueKind != JsonValueKind.Array) continue;
                foreach (var net in nets.EnumerateArray())
                {
                    if (!net.TryGetProperty("contract", out var ctEl) ||
                        !net.TryGetProperty("netWork", out var nw) ||
                        !net.TryGetProperty("depositEnable", out var dep) ||
                        !net.TryGetProperty("withdrawEnable", out var wd) ||
                        !net.TryGetProperty("withdrawFee", out var fee)) continue;
                    AddAsset("mexc",
                        ctEl.GetString() ?? "",
                        nw.GetString() ?? "",
                        dep.GetBoolean(),
                        wd.GetBoolean(),
                        P(fee.GetString() ?? ""));
                }
            }
        }

        #endregion

        #region ---- BITGET ----

        private async Task GetBitgetAsync(CancellationToken ct)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.GetAsync("https://api.bitget.com/api/v2/spot/public/coins", cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            if (!doc.RootElement.TryGetProperty("data", out var data) ||
                data.ValueKind != JsonValueKind.Array) return;
            foreach (var coin in data.EnumerateArray())
            {
                if (!coin.TryGetProperty("chains", out var chains) ||
                    chains.ValueKind != JsonValueKind.Array) continue;
                foreach (var ch in chains.EnumerateArray())
                {
                    if (!ch.TryGetProperty("contractAddress", out var ctEl) ||
                        !ch.TryGetProperty("chain", out var nw) ||
                        !ch.TryGetProperty("rechargeable", out var dep) ||
                        !ch.TryGetProperty("withdrawable", out var wd) ||
                        !ch.TryGetProperty("withdrawFee", out var fee)) continue;
                    AddAsset("bitget",
                        ctEl.GetString() ?? "",
                        nw.GetString() ?? "",
                        bool.Parse(dep.GetString() ?? "false"),
                        bool.Parse(wd.GetString() ?? "false"),
                        P(fee.GetString() ?? ""));
                }
            }
        }

        #endregion

        #region ---- HTX ----

        private async Task GetHtxAsync(CancellationToken ct)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.GetAsync("https://api.huobi.pro/v1/settings/common/chains", cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            if (!doc.RootElement.TryGetProperty("data", out var data) ||
                data.ValueKind != JsonValueKind.Array) return;
            foreach (var coin in data.EnumerateArray())
            {
                if (!coin.TryGetProperty("ca", out var ctEl) ||
                    !coin.TryGetProperty("dn", out var nw) ||
                    !coin.TryGetProperty("de", out var dep) ||
                    !coin.TryGetProperty("we", out var wd)) continue;
                AddAsset("huobi",
                    ctEl.GetString() ?? "",
                    nw.GetString() ?? "",
                    dep.GetBoolean(),
                    wd.GetBoolean(),
                    0m);
            }
        }

        #endregion

        #region ---- BITMART ----

        private async Task GetBitmartAsync(CancellationToken ct)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.GetAsync("https://api-cloud.bitmart.com/account/v1/currencies", cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            if (!doc.RootElement.TryGetProperty("data", out var data) ||
                !data.TryGetProperty("currencies", out var curs) ||
                curs.ValueKind != JsonValueKind.Array) return;
            foreach (var coin in curs.EnumerateArray())
            {
                if (!coin.TryGetProperty("contract_address", out var ctEl) ||
                    !coin.TryGetProperty("network", out var nw) ||
                    !coin.TryGetProperty("deposit_enabled", out var dep) ||
                    !coin.TryGetProperty("withdraw_enabled", out var wd) ||
                    !coin.TryGetProperty("withdraw_fee", out var fee)) continue;
                AddAsset("bitmart",
                    ctEl.GetString() ?? "",
                    nw.GetString() ?? "",
                    dep.GetBoolean(),
                    wd.GetBoolean(),
                    P(fee.GetString() ?? ""));
            }
        }

        #endregion

        #region ---- GATE ----

        private async Task GetGateAsync(CancellationToken ct)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.GetAsync("https://api.gateio.ws/api/v4/spot/currencies", cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            foreach (var coin in doc.RootElement.EnumerateArray())
            {
                if (!coin.TryGetProperty("chains", out var chains) ||
                    chains.ValueKind != JsonValueKind.Array) continue;
                foreach (var ch in chains.EnumerateArray())
                {
                    if (!ch.TryGetProperty("addr", out var ctEl) ||
                        !ch.TryGetProperty("name", out var nw) ||
                        !ch.TryGetProperty("deposit_disabled", out var dep) ||
                        !ch.TryGetProperty("withdraw_disabled", out var wd)) continue;
                    AddAsset("gate",
                        ctEl.GetString() ?? "",
                        nw.GetString() ?? "",
                        !dep.GetBoolean(),
                        !wd.GetBoolean(),
                        0m);
                }
            }
        }

        #endregion

        #region ---- KUCOIN ----

        private async Task GetKucoinAsync(CancellationToken ct)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.GetAsync("https://api.kucoin.com/api/v3/currencies", cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            if (!doc.RootElement.TryGetProperty("data", out var data) ||
                data.ValueKind != JsonValueKind.Array) return;
            foreach (var coin in data.EnumerateArray())
            {
                if (!coin.TryGetProperty("chains", out var chains) ||
                    chains.ValueKind != JsonValueKind.Array) continue;
                foreach (var ch in chains.EnumerateArray())
                {
                    if (!ch.TryGetProperty("contractAddress", out var ctEl) ||
                        !ch.TryGetProperty("chainName", out var nw) ||
                        !ch.TryGetProperty("isDepositEnabled", out var dep) ||
                        !ch.TryGetProperty("isWithdrawEnabled", out var wd) ||
                        !ch.TryGetProperty("withdrawalMinFee", out var fee)) continue;
                    AddAsset("kucoin",
                        ctEl.GetString() ?? "",
                        nw.GetString() ?? "",
                        dep.GetBoolean(),
                        wd.GetBoolean(),
                        P(fee.GetString() ?? ""));
                }
            }
        }

        #endregion

        #region ---- XT ----

        private async Task GetXtAsync(CancellationToken ct)
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));
            var resp = await _http.GetAsync("https://sapi.xt.com/v4/public/wallet/support/currency", cts.Token);
            if (!resp.IsSuccessStatusCode) return;
            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(ct));
            if (!doc.RootElement.TryGetProperty("result", out var res) ||
                res.ValueKind != JsonValueKind.Array) return;
            foreach (var coin in res.EnumerateArray())
            {
                if (!coin.TryGetProperty("supportChains", out var chains) ||
                    chains.ValueKind != JsonValueKind.Array) continue;
                foreach (var ch in chains.EnumerateArray())
                {
                    if (!ch.TryGetProperty("contract", out var ctEl) ||
                        !ch.TryGetProperty("chain", out var nw) ||
                        !ch.TryGetProperty("depositEnabled", out var dep) ||
                        !ch.TryGetProperty("withdrawEnabled", out var wd)) continue;
                    decimal fee = 0;
                    if (ch.TryGetProperty("withdrawFeeAmount", out var feeEl))
                        fee = feeEl.ValueKind == JsonValueKind.String
                            ? P(feeEl.GetString() ?? "0")
                            : feeEl.GetDecimal();
                    AddAsset("xt",
                        ctEl.GetString() ?? "",
                        nw.GetString() ?? "",
                        dep.GetBoolean(),
                        wd.GetBoolean(),
                        fee);
                }
            }
        }

        #endregion

        #region ==========  BUILD + CLEAN  ==========

        private List<MarketData> BuildFinalList(List<FullTicker> tickers, List<CoinInfo> coins)
        {
            var byCoin = tickers.Where(t => !string.IsNullOrEmpty(t.CoinId))
                .GroupBy(t => t.CoinId!, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.ToList(), StringComparer.OrdinalIgnoreCase);

            var result = new List<MarketData>();
            foreach (var coin in coins)
            {
                if (string.IsNullOrEmpty(coin.Id) || coin.Platforms == null) continue;
                var symbol = coin.Symbol?.ToUpperInvariant() ?? coin.Id.ToUpperInvariant();
                foreach (var (chain, contract) in coin.Platforms)
                {
                    if (!TargetChains.Contains(chain) || string.IsNullOrWhiteSpace(contract)) continue;
                    if (!byCoin.TryGetValue(coin.Id, out var tlist)) continue;

                    var exchanges = tlist
                        .Where(t => !string.IsNullOrEmpty(t.Target) && AllowedTargets.Contains(t.Target))
                        .Select(t => new MarketEx
                        {
                            Name = t.ExchangeName,
                            Base = t.Base ?? symbol,
                            Target = t.Target!,
                            Last = t.Last ?? 0m,
                            Volume = t.Volume ?? 0m,
                            Turnover = 0m,
                            TradeUrl = t.TradeUrl ?? "",
                            Confirmed = false
                        }).ToList();

                    var key = contract.ToLowerInvariant();
                    if (_assets.TryGetValue(key, out var dict))
                    {
                        foreach (var ex in exchanges)
                        {
                            if (dict.TryGetValue(ex.Name, out var asset))
                            {
                                ex.CommitedChain = asset.CommitedChain;
                                ex.Confirmed = true;
                                ex.IsDepositEnabled = asset.Deposit;
                                ex.IsWithdrawEnabled = asset.Withdraw;
                                ex.WithdrawFee = asset.Fee;
                            }
                        }
                    }

                    exchanges.RemoveAll(ex => !ex.Confirmed);
                    if (exchanges.Count > 0)
                        result.Add(new MarketData
                        {
                            Symbol = symbol,
                            Chain = chain,
                            ContractAddress = contract,
                            Exchanges = exchanges
                        });
                }
            }

            return result;
        }

        private static List<MarketData> LeaveOnlyRealChains(List<MarketData> src)
        {
            return src
                .GroupBy(t => (t.Symbol, t.ContractAddress))
                .SelectMany(g =>
                {
                    var confirmed = g.Where(t => t.Exchanges.Any(e => e.Confirmed)).ToList();
                    if (confirmed.Count == 0) return g;

                    var realChains = confirmed
                        .Select(t => t.Exchanges.First(e => e.Confirmed).CommitedChain)
                        .Select(NormalizeChain)
                        .Where(c => !string.IsNullOrEmpty(c))
                        .Distinct()
                        .ToList();

                    if (realChains.Count == 1)
                        return g.Where(t => t.Chain.Equals(realChains[0], StringComparison.OrdinalIgnoreCase));

                    return g;
                })
                .ToList();
        }

        #endregion

        #region ==========  DICTIONARY SPLITTER  ==========

        private static (List<MarketData> All, List<MarketData> Usdt, List<MarketData> SolEth) SplitDictionaries(
            List<MarketData> final)
        {
            var all = final;
            var usdtTargets = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "USDT" };
            var solEthTargets = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "SOL", "ETH" };

            static List<MarketData> FilterByTargets(List<MarketData> src, HashSet<string> targets)
            {
                var list = new List<MarketData>(src.Count);
                foreach (var t in src)
                {
                    var filteredEx = t.Exchanges.Where(e => targets.Contains(e.Target)).ToList();
                    if (filteredEx.Count == 0) continue;
                    list.Add(new MarketData
                    {
                        Symbol = t.Symbol,
                        Chain = t.Chain,
                        ContractAddress = t.ContractAddress,
                        DexPrice = t.DexPrice,
                        DexQuotePrice = t.DexQuotePrice,
                        DexQuotePriceImpact = t.DexQuotePriceImpact,
                        Liquidity = t.Liquidity,
                        FDV = t.FDV,
                        Capitalization = t.Capitalization,
                        IsChainsConflict = t.IsChainsConflict,
                        Exchanges = filteredEx
                    });
                }

                return list;
            }

            var usdt = FilterByTargets(all, usdtTargets);
            var solEth = FilterByTargets(all, solEthTargets);
            return (all, usdt, solEth);
        }

        #endregion

        #region ==========  NORMALIZER  ==========

        private static string NormalizeChain(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "";
            var s = raw.Trim().ToUpperInvariant();

            if (s is "ETH" or "ERC20" or "ETHEREUM" or "ETH-ERC20") return "ethereum";
            if (s is "SOL" or "SOL-SOL" or "SOLANA" or "SPL") return "solana";
            if (s is "ARBITRUM" or "ARBITRUMONE" or "ARBI" or "ARBEVM" or "ANIME-ARBITRUM ONE" or "ARBITRUM-ONE")
                return "arbitrum-one";
            if (s is "SCROLL" or "SCROLLETH" or "SCROLL-ETH") return "scroll";
            if (s is "ZKSYNC" or "ZKSYNCERA" or "ZKSERA" or "ZKSYNK") return "zksync";
            if (s is "BSC" or "BEP20" or "BNB SMART CHAIN" or "BSC_BNB" or "BNB" or "BNBCHAIN")
                return "binance-smart-chain";
            if (s is "BASE" or "BASEEVM" or "BASE-ETH" or "Base") return "base";
            if (s is "ZORA" or "ZORA-NETWORK") return "zora-network";
            if (s is "SUI") return "sui";
            if (s is "OPTIMISM" or "OP" or "OPETH" or "OPT" or "OPTIMISTIC-ETHEREUM") return "optimistic-ethereum";
            if (s is "AVAX" or "AVAX_C" or "C-CHAIN" or "CAVAX" or "AVALANCHE") return "avalanche";
            if (s is "TRON" or "TRX" or "TRC20" or "TRC") return "tron";
            if (s is "TON" or "TONCOIN") return "the-open-network";
            if (s is "APTOS" or "APT") return "aptos";
            if (s is "NEAR" or "NEAR PROTOCOL") return "near-protocol";
            if (s is "KAVA") return "kava";
            if (s is "CELO") return "celo";
            if (s is "LINEA" or "LINEAETH" or "LINEA-ETH") return "linea";
            if (s is "POLYGON" or "MATIC" or "POLYGON POS" or "POLYGON-POS") return "polygon-pos";
            if (s is "OSMOSIS") return "osmosis";

            return "";
        }

        #endregion





        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _http.DefaultRequestHeaders.Add("x-cg-demo-api-key", CG_API_KEY);

            while (!stoppingToken.IsCancellationRequested)
            {
                //var tickers = oldGeckoTokens;
                //var coins = oldGeckoCoins;

                var tickers = LoadAllTickersAsync(CancellationToken.None);
                var coins = LoadCoinsAsync(CancellationToken.None);
                var assetsTask = LoadAssetsAsync(CancellationToken.None);

                //await Task.WhenAll(tickersTask, coinsTask, assetsTask);
                await Task.WhenAll(tickers, coins, assetsTask);

                var final = BuildFinalList(tickers.Result, coins.Result);
                final = LeaveOnlyRealChains(final);

                var outPath = Path.Combine(AppContext.BaseDirectory, "filtered_output.json");
                await File.WriteAllTextAsync(outPath,
                    JsonSerializer.Serialize(final, new JsonSerializerOptions { WriteIndented = true }));

                _cache.Set("dict", final);
                _logger.LogInformation("Сохранено: {Count} токенов → {Path}", final.Count, outPath);

                // Дополнительно: сформировать 3 словаря и вывести их размеры
                var (allDict, usdtDict, solEthDict) = SplitDictionaries(final);

                // Сохраняем отфильтрованные словари в кэш для API
                //_cache.Set("dict_usdt", usdtDict);
                //_cache.Set("dict_sol_eth", solEthDict);

                //var outPathUsdt = Path.Combine(AppContext.BaseDirectory, "filtered_output_usdt.json");
                //var outPathSolEth = Path.Combine(AppContext.BaseDirectory, "filtered_output_sol_eth.json");


                await File.WriteAllTextAsync(@$"./Temp/UsdtTestDict.json",
                    JsonSerializer.Serialize(usdtDict, new JsonSerializerOptions { WriteIndented = true }));
                //await File.WriteAllTextAsync(outPathSolEth,
                //    JsonSerializer.Serialize(solEthDict, new JsonSerializerOptions { WriteIndented = true }));

                _logger.LogInformation("Размеры словарей → all: {All}, usdt: {Usdt}, sol/eth: {SolEth}", allDict.Count,
                    usdtDict.Count, solEthDict.Count);

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}