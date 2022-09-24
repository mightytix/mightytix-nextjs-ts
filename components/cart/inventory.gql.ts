import { gql } from '@apollo/client';

// Get all sessions
export const GET_SESSIONS = gql`
  query Sessions {
    sessions {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          start
          end
          max
          venue {
            id
            name
            space
            city
            timezone
          }
        }
        cursor
      }
    }
  }
`;

// Get ticket types for a session
export const GET_SESSION_TICKET_TYPES = gql`
  query SessionTicketTypes($sessionId: ID!) {
    sessionTicketTypes(
      filter: { enabled: { is: true }, sessionId: { eq: $sessionId } }
    ) {
      edges {
        node {
          sessionId
          ticketTypeId
          price
          bookingFee
          max
          ticketType {
            name
            descriptionHtml
            price
            bookingFee
            sort
          }
        }
      }
    }
  }
`;
