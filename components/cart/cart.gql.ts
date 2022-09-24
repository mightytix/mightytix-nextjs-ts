import { gql } from '@apollo/client';

// Cart fields
const ALL_CART_FIELDS = gql`
  fragment AllCartFields on Cart {
    id
    firstName
    lastName
    email
    phone
    acceptsMarketing
    subtotal
    bookingFees
    paymentFees
    total
    expires
    paymentIntentClientSecret
    cartLines {
      id
      quantity
      subtotal
      bookingFees
      sessionTicketType {
        sessionId
        ticketTypeId
        ticketType {
          name
          sort
        }
        session {
          start
          venue {
            name
            timezone
          }
        }
      }
    }
  }
`;

// Get a cart
export const GET_CART = gql`
  ${ALL_CART_FIELDS}
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...AllCartFields
    }
  }
`;

// Create a cart with a cart line
export const CREATE_CART_WITH_LINE = gql`
  ${ALL_CART_FIELDS}
  mutation CreateCartWithLine(
    $sessionId: String!
    $ticketTypeId: String!
    $quantity: Int!
  ) {
    createCart(
      input: {
        cart: {
          cartLines: {
            sessionId: $sessionId
            ticketTypeId: $ticketTypeId
            quantity: $quantity
          }
        }
      }
    ) {
      ...AllCartFields
    }
  }
`;

// Update a cart
export const UPDATE_CART = gql`
  ${ALL_CART_FIELDS}
  mutation UpdateCart($input: UpdateOneCartInput!) {
    updateCart(input: $input) {
      ...AllCartFields
    }
  }
`;

// Set cart line information
export const SET_CART_LINE = gql`
  ${ALL_CART_FIELDS}
  mutation SetCartLine($input: SetCartLineInput!) {
    setCartLine(input: $input) {
      ...AllCartFields
    }
  }
`;

// Create a payment intent
export const CREATE_PAYMENT_INTENT = gql`
  ${ALL_CART_FIELDS}
  mutation CreatePaymentIntent($cartId: String!) {
    createPaymentIntent(cartId: $cartId) {
      ...AllCartFields
    }
  }
`;
