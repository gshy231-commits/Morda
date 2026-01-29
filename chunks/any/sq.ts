import { createClient, Client, ClientOptions } from "graphql-ws";
import WebSocket from "ws";

interface TokenList {
  [key: string]: string;
}

interface Currency {
  Name: string;
  Symbol: string;
  MintAddress: string;
}

interface Trade {
  Trade: {
    Buy: {
      Price: number;
      Currency: Currency;
    };
    Sell: {
      Price: number;
      Currency: Currency;
    };
    Dex: {
      ProtocolName: string;
    };
  };
}

interface GraphQLResponse {
  data?: {
    Solana?: {
      DEXTrades?: Trade[];
    };
  };
  errors?: any;
}

const TOKENS_TO_TRACK: TokenList = {
  FULLSEND: "AshG5mHt4y4etsjhKFb2wA2rq1XZxKks1EPzcuXwpump",
  MELANIA: "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P",
};

const BITQUERY_WS_URL = "wss://streaming.bitquery.io/eap?token=your_api_key";

const SUBSCRIPTION_QUERY = `
  subscription {
    Solana {
      DEXTrades(
        where: {
          Trade: {
            Buy: {
              Currency: {
                MintAddress: { in: ["${Object.values(TOKENS_TO_TRACK).join('","')}"] }
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
          }
        }
      }
    }
  }
`;

function connect() {
  console.log("🔄 Connecting to Bitquery WebSocket...");

  const client: Client = createClient({
    url: BITQUERY_WS_URL,
    webSocketImpl: WebSocket,
    lazy: false,
    retryAttempts: Infinity,
    shouldRetry: () => true,
  } as ClientOptions);

  client.subscribe<GraphQLResponse>(
    { query: SUBSCRIPTION_QUERY },
    {
      next: (response) => {
        if (!response || !response.data || !response.data.Solana || !response.data.Solana.DEXTrades) {
          console.warn("⚠️ No valid trade data received.");
          return;
        }

        const trades = response.data.Solana.DEXTrades;
        for (const trade of trades) {
          const buyData = trade.Trade.Buy;
          const tokenMint = buyData.Currency.MintAddress;
          const tokenName = Object.keys(TOKENS_TO_TRACK).find(
            (key) => TOKENS_TO_TRACK[key] === tokenMint
          );

          if (tokenName) {
            console.log(
              `📈 [${trade.Trade.Dex.ProtocolName}] ${tokenName} - Price: ${buyData.Price.toFixed(6)} SOL`
            );
          }
        }
      },
      error: (err) => {
        console.error("❌ Subscription error:", err);
        setTimeout(connect, 5000); 
      },
      complete: () => {
        console.log("🔄 Subscription completed. Reconnecting...");
        setTimeout(connect, 5000);
      },
    }
  );
}

connect();
