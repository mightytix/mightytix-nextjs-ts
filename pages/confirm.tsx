import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { mightytixClient } from 'mightytix';
import {
  AccountContext,
  initialAccount,
} from '../components/auth';
import { Confirm } from '../components/confirm/confirm';

/**
 * Order confirmation page
 */
export function ConfirmPage() {
  const client = mightytixClient(process.env.NEXT_PUBLIC_MIGHTYTIX_DOMAIN);
  const accountState = React.useState(initialAccount[0]);

  return (
    <ApolloProvider client={client}>
      <AccountContext.Provider value={accountState}>
        <Confirm />
      </AccountContext.Provider>
    </ApolloProvider>
  );
}

export default ConfirmPage;
