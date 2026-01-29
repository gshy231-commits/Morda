import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import * as fs from 'fs';

const client = new ApolloClient({
  uri: 'https://gateway.thegraph.com/api/400469f6b8b3cdf2a4be31df71bcaf43/subgraphs/id/Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ',
  cache: new InMemoryCache(),
});

const GET_NEW_TOKENS_QUERY = gql`
  {
    tokens(first: 100, orderBy: createdAt, orderDirection: desc) {
      id
      symbol
      name
      createdAt
    }
  }
`;

async function getNewTokens() {
  try {
    const { data } = await client.query({
      query: GET_NEW_TOKENS_QUERY,
    });

    const newTokens = data.tokens;

    fs.writeFileSync('new_tokens.json', JSON.stringify(newTokens, null, 2));

    console.log('✅ New tokens saved to new_tokens.json');
  } catch (error) {
    console.error('❌ Error fetching new tokens:', error);
  }
}

getNewTokens();
