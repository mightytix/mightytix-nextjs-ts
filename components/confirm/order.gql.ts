import { gql } from '@apollo/client';

// Order fields
const ALL_ORDER_FIELDS = gql`
  fragment AllOrderFields on Order {
    id
    publicId
    firstName
    lastName
    email
    phone
    acceptsMarketing
    subtotal
    bookingFees
    paymentFees
    total
    processed
    paymentStatus
    cardNetwork
    cardExpMonth
    cardExpYear
    cardLast4
    tickets {
      id
      number
      price
      bookingFee
      sessionTicketType {
        sessionId
        ticketTypeId
        ticketType {
          name
          sort
        }
        session {
          start
          event {
            name
          }
          venue {
            name
            timezone
          }
        }
      }
    }
  }
`;

// Get an order by payment intent client secret
export const GET_ORDER_BY_GATEWAY_REF = gql`
  ${ALL_ORDER_FIELDS}
  query GetOrderByGatewayRef($ref: String!) {
    orders(filter: { paymentIntentId: { eq: $ref } }, paging: { first: 1 }) {
      edges {
        node {
          ...AllOrderFields
        }
      }
    }
  }
`;
