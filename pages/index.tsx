import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { mightytixClient } from 'mightytix';
import {
  AccountContext,
  initialAccount,
} from '../components/auth';
import { Cart } from '../components/cart/cart';

/**
 * Cart page
 */
export function Index() {
  const client = mightytixClient(process.env.NEXT_PUBLIC_MIGHTYTIX_DOMAIN);
  const accountState = React.useState(initialAccount[0]);

  return (
    <ApolloProvider client={client}>
      <AccountContext.Provider value={accountState}>
        <Cart />
      </AccountContext.Provider>
    </ApolloProvider>
  );
}

export default Index;
