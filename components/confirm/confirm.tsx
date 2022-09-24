import download from 'downloadjs';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { CreditCardIcon } from '@heroicons/react/solid';
import {
  Account,
  OrderConnection,
} from 'mightytix';
import {
  AccountContext,
  GET_ACCOUNT,
} from '../auth';
import { sortTickets } from '../presentation';
import { Alert, Loading } from '../feedback';
import { GET_ORDER_BY_GATEWAY_REF } from './order.gql';

export function Confirm() {
  const router = useRouter();
  const clientSecret = router.query['ref'];

  const { loading, error, data } = useQuery<{ orders: OrderConnection }>(
    GET_ORDER_BY_GATEWAY_REF,
    {
      variables: {
        ref: clientSecret,
      },
      skip: clientSecret === undefined,
    },
  );

  const [account, setAccount] = useContext(AccountContext);
  const {
    loading: accountLoading,
    error: accountError,
    data: accountData,
  } = useQuery<{ account: Account }>(GET_ACCOUNT, {
    skip: account.loaded,
  });
  useEffect(() => {
    if (account.loaded === false && accountData?.account) {
      // Extract localised currency symbol
      const currencySymbol = new Intl.NumberFormat(accountData.account.locale, {
        style: 'currency',
        currency: accountData.account.currency,
      })
        .formatToParts()
        .find(part => part.type === 'currency')?.value;

      // Save extended account info to state
      setAccount({
        ...accountData.account,
        loaded: true,
        currencySymbol: currencySymbol || '$',
      });

      document.title = accountData.account.name;
    }
  }, [accountData]);

  if (!clientSecret)
    return (
      <Alert type="error">
        For your security this confirmation page cannot be reloaded. Please
        click the Back button or check your email for tickets.
      </Alert>
    );

  const order = data?.orders.edges[0]?.node;
  if (!order) return <Loading />;

  // Sort tickets
  const sortedTickets = sortTickets(order.tickets);

  const handleDownload: React.MouseEventHandler = event => {
    let uri = '/customer-api/orders/download';
    const domain = process.env['NEXT_PUBLIC_MIGHTYTIX_DOMAIN'];
    if (typeof domain === 'string' && domain.length > 0) {
      uri = `https://${domain}${uri}`;
    }

    fetch(uri, {
      method: 'POST',
      body: JSON.stringify({ order: order.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(function (resp) {
        return resp.blob();
      })
      .then(function (blob) {
        return download(blob, 'Tickets.pdf');
      });
  };

  return (
    <div className="bg-white subpixel-antialiased">
      <header className="relative bg-white">
        <nav
          aria-label="Top"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <h1 className="text-gray-700">{account.name}</h1>
            </div>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="max-w-xl">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Payment successful
            </h1>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              You&apos;re going!
            </p>
            <p className="mt-2 text-base text-gray-500">
              Your order ID{' '}
              <span className="text-gray-700">{order.publicId}</span> will be
              emailed to you at{' '}
              <span className="text-gray-700">{order.email}</span>.
            </p>

            <dl className="mt-16 text-sm font-medium">
              <dd className="mt-2 text-blue-600">
                <a style={{ cursor: 'pointer' }} onClick={handleDownload}>
                  Or click here to download
                </a>
              </dd>
            </dl>

            <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500">
              {sortedTickets.map(ticket => {
                const start = DateTime.fromISO(
                  ticket.sessionTicketType.session.start,
                  {
                    locale: account.locale,
                    zone: ticket.sessionTicketType.session.venue.timezone,
                  },
                );
                return (
                  <li key={ticket.id} className="flex space-x-6 py-6">
                    <div className="flex-auto space-y-1">
                      <h3 className="text-gray-900">
                        {ticket.sessionTicketType.session.event.name}
                      </h3>
                      <p className="text-gray-900">
                        {ticket.sessionTicketType.ticketType.name}
                      </p>
                      <p>{ticket.sessionTicketType.session.venue.name}</p>
                      <p>
                        {start.toLocaleString({
                          ...DateTime.DATE_HUGE,
                        })}
                        ,{' '}
                        {start.toLocaleString({
                          ...DateTime.TIME_SIMPLE,
                        })}
                      </p>
                    </div>
                    <p className="flex-none font-medium text-gray-900">
                      {account.currencySymbol} {ticket.price}
                    </p>
                  </li>
                );
              })}
            </ul>

            {order.subtotal !== order.total ? (
              <dl className="space-y-3 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-gray-500">
                    {account.currencySymbol} {order.subtotal}
                  </dd>
                </div>

                {parseFloat(order.bookingFees) > 0 && (
                  <div className="flex justify-between">
                    <dt>Booking fees</dt>
                    <dd className="text-gray-500">
                      {account.currencySymbol} {order.bookingFees}
                    </dd>
                  </div>
                )}

                {parseFloat(order.paymentFees) > 0 && (
                  <div className="flex justify-between pb-3">
                    <dt>Payment processing fee</dt>
                    <dd className="text-gray-500">
                      {account.currencySymbol} {order.paymentFees}
                    </dd>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">
                    {account.currencySymbol} {order.total}
                  </dd>
                </div>
              </dl>
            ) : (
              <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
                <div className="flex items-center justify-between border-gray-200 text-gray-900">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">
                    {account.currencySymbol} {order.total}
                  </dd>
                </div>
              </dl>
            )}

            <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
              <div>
                <dt className="font-medium text-gray-900">Your details</dt>
                <dd className="mt-2">
                  <address className="not-italic">
                    <span className="block">
                      {order.firstName} {order.lastName}
                    </span>
                    <span className="block">{order.phone}</span>
                    <span className="block">{order.email}</span>
                  </address>
                </dd>
              </div>

              {order.cardNetwork && (
                <div>
                  <dt className="font-medium text-gray-900">
                    Payment information
                  </dt>
                  <dd className="mt-2 space-y-2 sm:flex sm:space-y-0 sm:space-x-4">
                    <div className="flex-none">
                      <CreditCardIcon className="-m-1 w-10 text-blue-600" />
                    </div>
                    <div className="flex-auto">
                      <p>{order.cardNetwork}</p>
                      <p>Ending in {order.cardLast4}</p>
                      <p>
                        Expires{' '}
                        {_.padStart(order.cardExpMonth?.toString(), 2, '0')} /{' '}
                        {order.cardExpYear?.toString().slice(-2)}
                      </p>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </main>

      <footer aria-labelledby="footer-heading" className="bg-white">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-100 py-10 text-center">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()}{' '}
              <a href="https://mightytix.com/">Mighty Tix</a>. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Confirm;
