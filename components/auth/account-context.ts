import React from 'react';
import { Account } from 'mightytix';

type ExtendedAccount = Account & {
  currencySymbol: string;
  loaded: boolean;
};

type accountContextData = [
  account: ExtendedAccount,
  setAccount: React.Dispatch<React.SetStateAction<ExtendedAccount>>,
];

// Initial state
export const initialAccount: accountContextData = [
  {
    currency: 'usd',
    currencySymbol: '$',
    loaded: false,
    locale: 'en-US',
    name: 'Mighty Tix',
    url: 'mightytix.com',
  },
  () => null,
];

export const AccountContext = React.createContext(initialAccount);
