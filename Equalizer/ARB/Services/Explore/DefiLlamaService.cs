using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;

namespace ARB.Services.Explore
{
    public class DefiLlamaService : BackgroundService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<DefiLlamaService> _logger;
        private readonly IMemoryCache _cache;
        private const string BaseUrl = "https://coins.llama.fi/prices/current/";
        private const int MaxTokensPerRequest = 50;
        private const int DelayBetweenRequests = 0;
        private const int UpdateIntervalSeconds = 1;

        public DefiLlamaService(IHttpClientFactory httpClientFactory, ILogger<DefiLlamaService> logger, IMemoryCache cache)
        {
            _httpClient = httpClientFactory.CreateClient("defillama");
            _logger = logger;
            _cache = cache;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DefiLlama сервис запущен");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await UpdateAllTokenPrices();
                    await Task.Delay(TimeSpan.FromSeconds(UpdateIntervalSeconds), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Ошибка в DefiLlama сервисе");
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
            }
        }

        private async Task UpdateAllTokenPrices()
        {
            try
            {
                var tokensJson = await File.ReadAllTextAsync("Output/filtered_output.json");
                var tokens = JsonSerializer.Deserialize<List<TokenData>>(tokensJson);

                if (tokens == null || tokens.Count == 0)
                {
                    _logger.LogWarning("Не удалось загрузить токены из файла");
                    return;
                }

                // Фильтруем только поддерживаемые DefiLlama сети
                var supportedChains = new[] { 
                    "ethereum", "binance-smart-chain", "base", "arbitrum-one", "polygon-pos", 
                    "optimistic-ethereum", "avalanche", "scroll", "zksync", "sui", "tron", 
                    "the-open-network", "aptos", "near-protocol", "celo"
                };
                var supportedTokens = tokens.Where(t => supportedChains.Contains(t.Chain.ToLower())).ToList();

                _logger.LogInformation("Обновляем цены для {Count} поддерживаемых токенов", supportedTokens.Count);

                var updatedCount = 0;
                var batches = CreateBatches(supportedTokens, MaxTokensPerRequest);

                foreach (var batch in batches)
                {
                    try
                    {
                        updatedCount += await ProcessBatchAsync(batch);
                        await Task.Delay(DelayBetweenRequests);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Ошибка при обработке батча из {Count} токенов", batch.Count);
                    }
                }

                // Сохраняем обновленный словарь обратно в файл
                var updatedJson = JsonSerializer.Serialize(tokens, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync("Output/filtered_output.json", updatedJson);

                // Сохраняем в кэш
                _cache.Set("defillama_updates", tokens, TimeSpan.FromHours(1));

                _logger.LogInformation("Успешно обновлено цен для {Count} токенов", updatedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении цен токенов");
            }
        }

        private async Task<int> ProcessBatchAsync(List<TokenData> tokens)
        {
            var tokenIds = tokens.Select(CreateTokenId).ToList();
            var url = BaseUrl + string.Join(",", tokenIds);

            // Проверяем длину URL (максимум ~8000 символов для безопасности)
            if (url.Length > 8000)
            {
                _logger.LogWarning("URL слишком длинный ({Length} символов), разбиваем батч", url.Length);

                // Рекурсивно разбиваем на меньшие батчи
                var halfSize = tokens.Count / 2;
                var firstHalf = tokens.Take(halfSize).ToList();
                var secondHalf = tokens.Skip(halfSize).ToList();

                var firstResult = await ProcessBatchAsync(firstHalf);
                var secondResult = await ProcessBatchAsync(secondHalf);

                return firstResult + secondResult;
            }

            _logger.LogInformation("Запрос к DefiLlama для {Count} токенов, URL длина: {Length}", tokens.Count, url.Length);
            _logger.LogInformation("Первые 3 токена в батче: {Tokens}", string.Join(", ", tokenIds.Take(3)));

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();

            // Логируем ответ для отладки (только первые 200 символов)
            _logger.LogDebug("Ответ от DefiLlama: {Response}", jsonResponse.Length > 200 ? jsonResponse.Substring(0, 200) + "..." : jsonResponse);

            if (string.IsNullOrWhiteSpace(jsonResponse) || jsonResponse == "{}")
            {
                _logger.LogWarning("Получен пустой ответ от DefiLlama для {Count} токенов", tokens.Count);
                return 0;
            }

            var priceData = JsonSerializer.Deserialize<DefiLlamaPriceResponse>(jsonResponse);

            if (priceData?.Coins == null)
            {
                _logger.LogWarning("DefiLlama вернул null в поле Coins");
                return 0;
            }

            _logger.LogDebug("DefiLlama вернул цены для {Count} токенов из {RequestedCount} запрошенных",
                priceData.Coins.Count, tokens.Count);

            var updatedCount = 0;
            foreach (var token in tokens)
            {
                var tokenId = CreateTokenId(token);
                if (priceData.Coins.TryGetValue(tokenId, out var coinData))
                {
                    // Обновляем DexPrice прямо в исходном токене
                    token.DexPrice = coinData.Price;
                    updatedCount++;

                    _logger.LogDebug("Обновлена цена для {Symbol} ({Chain}): {Price}",
                        token.Symbol, token.Chain, coinData.Price);
                }
                else
                {
                    _logger.LogDebug("Цена не найдена для токена: {TokenId}", tokenId);
                }
            }

            return updatedCount;
        }

        private string CreateTokenId(TokenData token)
        {
            var chainName = token.Chain.ToLower() switch
            {
                "ethereum" => "ethereum",
                "binance-smart-chain" => "bsc",
                "base" => "base",
                "arbitrum-one" => "arbitrum",
                "polygon-pos" => "polygon",
                "optimistic-ethereum" => "optimism",
                "avalanche" => "avax",
                "scroll" => "scroll",
                "zksync" => "era",
                "sui" => "sui",
                "tron" => "tron",
                "the-open-network" => "ton",
                "aptos" => "aptos",
                "near-protocol" => "near",
                "celo" => "celo",
                _ => token.Chain.ToLower()
            };

            return $"{chainName}:{token.ContractAddress}";
        }

        private static List<List<T>> CreateBatches<T>(List<T> items, int batchSize)
        {
            var batches = new List<List<T>>();
            for (int i = 0; i < items.Count; i += batchSize)
            {
                batches.Add(items.Skip(i).Take(batchSize).ToList());
            }
            return batches;
        }
    }
}
// Модели данных
public class TokenData
{
    public string Symbol { get; set; } = string.Empty;
    public string Chain { get; set; } = string.Empty;
    public string ContractAddress { get; set; } = string.Empty;
    public decimal DexPrice { get; set; }
    public decimal DexQuotePrice { get; set; }
    public decimal DexQuotePriceImpact { get; set; }
    public decimal Liquidity { get; set; }
    public decimal FDV { get; set; }
    public decimal Capitalization { get; set; }
    public bool IsChainsConflict { get; set; }
}

public class TokenPriceUpdate
{
    public string Symbol { get; set; } = string.Empty;
    public string Chain { get; set; } = string.Empty;
    public string ContractAddress { get; set; } = string.Empty;
    public decimal OldDexPrice { get; set; }
    public decimal NewDexPrice { get; set; }
    public decimal Confidence { get; set; }
    public DateTime Timestamp { get; set; }
}

public class DefiLlamaPriceResponse
{
    [JsonPropertyName("coins")]
    public Dictionary<string, CoinData>? Coins { get; set; }
}

public class CoinData
{
    [JsonPropertyName("price")]
    public decimal Price { get; set; }

    [JsonPropertyName("symbol")]
    public string? Symbol { get; set; }

    [JsonPropertyName("timestamp")]
    public long Timestamp { get; set; }

    [JsonPropertyName("confidence")]
    public decimal? Confidence { get; set; }
}