import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import fs from "fs";

const client = new ApolloClient({
    uri: 'https://gateway.thegraph.com/api/400469f6b8b3cdf2a4be31df71bcaf43/subgraphs/id/Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ',
    cache: new InMemoryCache(),
});

const GET_SCHEMA = gql`
  {
  __schema {
    types {
      name
      kind
      fields {
        name
        args {
          name
          type {
            name
          }
        }
        type {
          name
          kind
        }
      }
    }
  }
}
`;

async function getFields() {
    try {
        const { data } = await client.query({
            query: GET_SCHEMA,
        });

        console.log('Schema:', JSON.stringify(data, null, 2));

        fs.writeFileSync('./jsons/fields.json', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error fetching schema:', error);
    }
}

getFields();
