import asyncio
from gql import Client, gql
from gql.transport.websockets import WebsocketsTransport

# Адреса токенов для отслеживания
TOKENS_TO_TRACK = {
    "FULLSEND": "AshG5mHt4y4etsjhKFb2wA2rq1XZxKks1EPzcuXwpump",
    "MELANIA": "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P"
}

async def main():
    # Подключение к WebSocket-серверу Bitquery с использованием EAP-эндпоинта для Solana
    transport = WebsocketsTransport(
        url="wss://streaming.bitquery.io/eap?token=ory_at_6YxQYhJBb09quPrXInZMpLiTldWewfSbNA-Sdim3EX8.kLVLlIwSu6Fmwi8_fcRKHmEBzuYJatxKx1bjJ9yMNhM",
        headers={"Sec-WebSocket-Protocol": "graphql-ws"}
    )

    async with Client(
        transport=transport,
        fetch_schema_from_transport=False,
    ) as session:
        print("Connected to WebSocket")

        # Исправленный запрос с использованием оператора in
        query = gql("""
            subscription {
              Solana {
                DEXTrades(
                  where: {
                    Trade: {
                      Buy: {
                        Currency: {
                          MintAddress: { in: [
                            "AshG5mHt4y4etsjhKFb2wA2rq1XZxKks1EPzcuXwpump",
                            "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P"
                          ]}
                        }
                      },
                      Sell: {
                        Currency: { MintAddress: { is: "So11111111111111111111111111111111111111112" } }
                      }
                    }
                  }
                ) {
                  Trade {
                    Buy {
                      Price
                      Currency {
                        Name
                        Symbol
                        MintAddress
                      }
                    }
                    Sell {
                      Price
                      Currency {
                        Name
                        Symbol
                        MintAddress
                      }
                    }
                    Dex {
                      ProtocolName
                      ProtocolFamily
                    }
                    Market {
                      MarketAddress
                    }
                  }
                }
              }
            }
        """)

        # Подписываемся на поток данных и выводим их
        async for result in session.subscribe(query):
            trades = result.get("Solana", {}).get("DEXTrades", [])
            for trade in trades:
                buy_data = trade["Trade"]["Buy"]
                token_info = buy_data["Currency"]
                token_mint = token_info["MintAddress"]

                # Фильтруем по отслеживаемым токенам
                if token_mint in TOKENS_TO_TRACK.values():
                    token_name = next(
                        name for name, address in TOKENS_TO_TRACK.items()
                        if address == token_mint
                    )
                    price = buy_data["Price"]
                    print(f"Token: {token_name}, Price: {price} (Buy side)")

# Запускаем асинхронную функцию main()
asyncio.run(main())
