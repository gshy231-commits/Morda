//using System.Globalization;
//using System.Text.Json;
//using Microsoft.Extensions.Caching.Memory;
//using Microsoft.Extensions.Hosting;
//using Microsoft.Extensions.Logging;
//using System.Diagnostics;

//namespace ARB
//{
//    public sealed class OldPriceService1(IMemoryCache cache, ILogger<OldPriceService1> logger) : BackgroundService
//    {
//        private readonly IMemoryCache _cache = cache;
//        private readonly ILogger<PriceService> _logger = logger;

//        private static readonly string[] DictionaryKeys = ["dict", "dict_usdt", "dict_sol_eth", "dict_usdc"];

//        private void UpdatePricesInDictionaries()
//        {
//            Dictionary<string, Func<string, decimal?>> exchangeParsers = CreateExchangeParsers();
//            int totalUpdated = 0;

//            foreach (string key in DictionaryKeys)
//            {
//                try
//                {
//                    List<OldDictService1.TokenResult>? dictionary = _cache.Get<List<OldDictService1.TokenResult>>(key);
                    
//                    if (dictionary == null)
//                    {
//                        _logger.LogWarning("Dictionary {Key} not found in cache", key);
//                        continue;
//                    }

//                    int updatedInDict = UpdateDictionaryPrices(dictionary, exchangeParsers);
//                    totalUpdated += updatedInDict;
                    
//                    _logger.LogDebug("Updated {Count} prices in {Key}", updatedInDict, key);
                    
//                    _cache.Set($"price_{key}", dictionary);
//                }
//                catch (Exception ex)
//                {
//                    _logger.LogError(ex, "Error processing dictionary {Key}", key);
//                }
//            }

//            _logger.LogInformation("Total prices updated: {TotalUpdated}", totalUpdated);
//        }

//        private Dictionary<string, Func<string, decimal?>> CreateExchangeParsers()
//        {
//            return new Dictionary<string, Func<string, decimal?>>(StringComparer.OrdinalIgnoreCase)
//            {
//                ["binance"] = BinanceParser(),
//                ["bybit"] = BybitParser(),
//                ["okx"] = OkxParser(),
//                ["kucoin"] = KucoinParser(),
//                ["gate"] = GateParser(),
//                ["mexc"] = MexcParser(),
//                ["bitget"] = BitgetParser(),
//                ["htx"] = HtxParser(),
//                ["bitmart"] = BitmartParser(),
//                ["xt"] = XtParser(),
//                ["lbank"] = LbankParser(),
//                ["poloniex"] = PoloniexParser()
//            };
//        }

//        private static int UpdateDictionaryPrices(
//            List<OldDictService1.TokenResult> dictionary, 
//            Dictionary<string, Func<string, decimal?>> exchangeParsers)
//        {
//            int updatedCount = 0;

//            foreach (OldDictService1.TokenResult token in dictionary)
//            {
//                if (token.Exchanges == null) continue;

//                foreach (var exchange in token.Exchanges)
//                {
//                    try
//                    {
//                        string normalizedExchange = NormalizeExchangeName(exchange.Name);

//                        if (!exchangeParsers.TryGetValue(normalizedExchange, out Func<string, decimal?>? parser) || parser == null)
//                        {
//                            continue;
//                        }

//                        string symbol = NormalizeSymbol(exchange.Base, exchange.Target);
//                        decimal? price = parser(symbol);

//                        if (price.HasValue && price.Value > 0)
//                        {
//                            exchange.Last = price.Value;
//                            updatedCount++;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }

//            return updatedCount;
//        }

//        #region Exchange Parsers

//        private Func<string, decimal?> BinanceParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("binance_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseBinanceData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating Binance parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseBinanceData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (doc.RootElement.ValueKind != JsonValueKind.Array) return priceDict;

//                foreach (JsonElement item in doc.RootElement.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("price", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbol = symbolEl.GetString();
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing Binance data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> BybitParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("bybit_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseBybitData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating Bybit parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseBybitData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("result", out JsonElement result) ||
//                    !result.TryGetProperty("list", out JsonElement list) ||
//                    list.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in list.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("lastPrice", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbol = symbolEl.GetString();
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing Bybit data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> OkxParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("okx_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseOkxData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating OKX parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseOkxData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("data", out JsonElement data) ||
//                    data.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in data.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("instId", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("last", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbolRaw = symbolEl.GetString();
//                        string? symbol = symbolRaw?.Replace("-", "");
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing OKX data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> KucoinParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("kucoin_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseKucoinData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating KuCoin parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseKucoinData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("data", out JsonElement data) ||
//                    !data.TryGetProperty("ticker", out JsonElement ticker) ||
//                    ticker.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in ticker.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("last", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbolRaw = symbolEl.GetString();
//                        string? symbol = symbolRaw?.Replace("-", "");
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing KuCoin data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> GateParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("gate_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseGateData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating Gate parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseGateData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (doc.RootElement.ValueKind != JsonValueKind.Array) return priceDict;

//                foreach (JsonElement item in doc.RootElement.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("currency_pair", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("last", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbolRaw = symbolEl.GetString();
//                        string? symbol = symbolRaw?.Replace("_", "");
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing Gate data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> MexcParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("mexc_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseMexcData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating MEXC parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseMexcData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (doc.RootElement.ValueKind != JsonValueKind.Array) return priceDict;

//                foreach (JsonElement item in doc.RootElement.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("lastPrice", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbol = symbolEl.GetString();
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing MEXC data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> BitgetParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("bitget_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseBitgetData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating Bitget parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseBitgetData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("data", out JsonElement data) ||
//                    data.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in data.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("lastPr", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbol = symbolEl.GetString();
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing Bitget data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> HtxParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("htx_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseHtxData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating HTX parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseHtxData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("data", out JsonElement data) ||
//                    data.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in data.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("close", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbol = symbolEl.GetString();
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing HTX data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> BitmartParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("bitmart_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseBitmartData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating BitMart parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseBitmartData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("data", out JsonElement data) ||
//                    !data.TryGetProperty("tickers", out JsonElement tickers) ||
//                    tickers.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in tickers.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("last_price", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbolRaw = symbolEl.GetString();
//                        string? symbol = symbolRaw?.Replace("_", "");
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing BitMart data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> XtParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("xt_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseXtData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating XT parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseXtData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("result", out JsonElement result) ||
//                    result.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in result.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("s", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("c", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbol = symbolEl.GetString();
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing XT data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> LbankParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("lbank_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParseLbankData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating LBank parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParseLbankData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (!doc.RootElement.TryGetProperty("data", out JsonElement data) ||
//                    data.ValueKind != JsonValueKind.Array)
//                {
//                    return priceDict;
//                }

//                foreach (JsonElement item in data.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("ticker", out JsonElement tickerEl) ||
//                            !tickerEl.TryGetProperty("latest", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbolRaw = symbolEl.GetString();
//                        string? symbol = symbolRaw?.Replace("_", "");
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing LBank data");
//            }

//            return priceDict;
//        }

//        private Func<string, decimal?> PoloniexParser()
//        {
//            try
//            {
//                string? cachedData = _cache.Get<string>("poloniex_spot");
//                if (string.IsNullOrWhiteSpace(cachedData)) return null;

//                Dictionary<string, decimal> priceDict = ParsePoloniexData(cachedData);
                
//                return symbol =>
//                {
//                    bool found = priceDict.TryGetValue(symbol, out decimal price);
//                    return found ? price : null;
//                };
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error creating Poloniex parser");
//                return null;
//            }
//        }

//        private Dictionary<string, decimal> ParsePoloniexData(string cachedData)
//        {
//            Dictionary<string, decimal> priceDict = new(StringComparer.OrdinalIgnoreCase);

//            try
//            {
//                using JsonDocument doc = JsonDocument.Parse(cachedData);
                
//                if (doc.RootElement.ValueKind != JsonValueKind.Array) return priceDict;

//                foreach (JsonElement item in doc.RootElement.EnumerateArray())
//                {
//                    try
//                    {
//                        if (!item.TryGetProperty("symbol", out JsonElement symbolEl) ||
//                            !item.TryGetProperty("price", out JsonElement priceEl))
//                        {
//                            continue;
//                        }

//                        string? symbolRaw = symbolEl.GetString();
//                        string? symbol = symbolRaw?.Replace("_", "");
//                        decimal price = ParsePrice(priceEl.GetString());

//                        if (!string.IsNullOrWhiteSpace(symbol) && price > 0)
//                        {
//                            priceDict[symbol] = price;
//                        }
//                    }
//                    catch (Exception)
//                    {
//                        continue;
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogWarning(ex, "Error parsing Poloniex data");
//            }

//            return priceDict;
//        }

//        #endregion

//        #region Helper Methods

//        private static string NormalizeExchangeName(string exchangeName)
//        {
//            return exchangeName.ToLowerInvariant() switch
//            {
//                "bybit_spot" or "bybit" => "bybit",
//                "okex" or "okx" => "okx",
//                "huobi" or "htx" => "htx",
//                "mxc" or "mexc" => "mexc",
//                _ => exchangeName.ToLowerInvariant()
//            };
//        }

//        private static string NormalizeSymbol(string baseAsset, string quoteAsset)
//        {
//            return $"{baseAsset}{quoteAsset}".ToUpperInvariant();
//        }

//        private static decimal ParsePrice(string? priceStr)
//        {
//            if (string.IsNullOrWhiteSpace(priceStr)) return 0m;

//            bool parsed = decimal.TryParse(
//                priceStr,
//                NumberStyles.AllowDecimalPoint | NumberStyles.AllowExponent | NumberStyles.AllowLeadingSign,
//                CultureInfo.InvariantCulture,
//                out decimal price);

//            return parsed ? price : 0m;
//        }

//        #endregion

//        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//        {
//            await Task.Delay(TimeSpan.FromSeconds(200), stoppingToken);

//            Stopwatch sw = new();

//            while (!stoppingToken.IsCancellationRequested)
//            {
//                try
//                {
//                    sw.Restart();
//                    UpdatePricesInDictionaries();
//                    sw.Stop();

//                    _logger.LogDebug("Price update completed in {ElapsedMs}ms", sw.ElapsedMilliseconds);

//                    int delay = Math.Max(0, 500 - (int)sw.ElapsedMilliseconds);
//                    await Task.Delay(delay, stoppingToken);
//                }
//                catch (Exception ex)
//                {
//                    _logger.LogError(ex, "Error updating prices in dictionaries");
//                    await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
//                }
//            }
//        }
//    }
//}