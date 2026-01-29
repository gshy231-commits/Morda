import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import * as fs from 'fs';

const client = new ApolloClient({
  uri: 'https://gateway.thegraph.com/api/400469f6b8b3cdf2a4be31df71bcaf43/subgraphs/id/Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ',
  cache: new InMemoryCache(),
});

const GET_TOKENS_QUERY = gql`
  {
  tokens(first: 10) {
    id
    symbol
    name
    decimals
    totalSupply
    volume
    volumeUSD
    untrackedVolumeUSD
    feesUSD
    protocolFeesUSD
    txCount
    poolCount
    totalValueLocked
    totalValueLockedUSD
    totalValueLockedUSDUntracked
    derivedETH
    derivedUSD
    whitelistPools
    tokenDayData 
    tokenHourData 
  }
}
`;

async function getTokens() {
  try {
    const { data } = await client.query({
      query: GET_TOKENS_QUERY,
    });

    fs.writeFileSync('./jsons/token_data.json', JSON.stringify(data, null, 2));

    console.log('Tokens:', data.tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
  }
}

getTokens();
