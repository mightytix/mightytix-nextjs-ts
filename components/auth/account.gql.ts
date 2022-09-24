import { gql } from '@apollo/client';

// Account fields
const ALL_ACCOUNT_FIELDS = gql`
  fragment AllAccountFields on Account {
    name
    url
    currency
    locale
  }
`;

// Get account details with default gateway
export const GET_ACCOUNT_AND_GATEWAY = gql`
  ${ALL_ACCOUNT_FIELDS}
  query AccountAndGateway {
    account {
      ...AllAccountFields
    }
    paymentGateways(
      filter: { default: { is: true }, provider: { eq: "STRIPE" } }
      paging: { first: 1 }
    ) {
      edges {
        node {
          id
          gatewayAccountId
        }
      }
    }
  }
`;

// Get account details only
export const GET_ACCOUNT = gql`
  ${ALL_ACCOUNT_FIELDS}
  query Account {
    account {
      ...AllAccountFields
    }
  }
`;
