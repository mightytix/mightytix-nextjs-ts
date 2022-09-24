import { useFormikContext } from 'formik';
import { DateTime } from 'luxon';
import { useContext, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/solid';
import { Cart } from 'mightytix';
import { AccountContext } from '../auth';
import { sortTickets } from '../presentation';
import { Alert } from '../feedback';
import { Button } from '../form';
import { CartStage, CartTicketQuantityChangeHandler } from './types';

type Props = {
  buttonDisabled: boolean;
  cart: Cart;
  cartStage: CartStage;
  error: string;
  handleCheckoutClick: React.MouseEventHandler<HTMLButtonElement>;
  message: string;
  onTicketQuantityChange: CartTicketQuantityChangeHandler;
};

export function OrderSummary({
  buttonDisabled = false,
  cart,
  cartStage,
  error,
  handleCheckoutClick,
  message,
  onTicketQuantityChange,
}: Props) {
  const account = useContext(AccountContext)[0];
  const { setFieldValue, validateForm } = useFormikContext();

  // Validate form on load & when cart stage changes to enable/disable the submit button
  useEffect(() => {
    validateForm();
  }, [cartStage, validateForm]);

  const handleRemoveLine = (sessionId: string, ticketTypeId: string) => {
    // Update Formik
    setFieldValue(`ticketQuantity.${sessionId}.${ticketTypeId}`, 0);
    // Update server
    onTicketQuantityChange(sessionId, ticketTypeId, 0);
  };

  // Sort cart lines
  const sortedCartLines = sortTickets(cart.cartLines);

  return (
    <section
      aria-labelledby="summary-heading"
      className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5"
    >
      <h2 id="summary-heading" className="text-lg font-medium text-gray-800">
        Order summary
      </h2>

      <ul className="divide-y divide-gray-200">
        {sortedCartLines.map(cartLine => (
          <li key={cartLine.id} className="flex py-6">
            <div className="flex-1 flex flex-col">
              <div className="flex">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm">
                    {cartLine.sessionTicketType.ticketType.name}{' '}
                    <span className="ml-2 text-sm text-gray-500">
                      &times; {cartLine.quantity}
                    </span>
                  </h4>
                </div>

                <div className="ml-4 flex-shrink-0 flow-root">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 flex items-center justify-center text-gray-400 hover:text-gray-500"
                    title="Remove"
                    onClick={() =>
                      handleRemoveLine(
                        cartLine.sessionTicketType.sessionId,
                        cartLine.sessionTicketType.ticketTypeId,
                      )
                    }
                  >
                    <span className="sr-only">Remove</span>
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-end justify-between">
                <p className="mt-1 pr-1 text-sm text-gray-500">
                  {DateTime.fromISO(cartLine.sessionTicketType.session.start, {
                    locale: account.locale,
                    zone: cartLine.sessionTicketType.session.venue.timezone,
                  }).toLocaleString({
                    ...DateTime.DATETIME_MED,
                  })}
                  , {cartLine.sessionTicketType.session.venue.name}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  <span className="text-gray-600">
                    {account.currencySymbol}
                  </span>
                  &nbsp;
                  {cartLine.subtotal}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="space-y-4">
        {cart.subtotal !== cart.total && (
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <dt className="text-sm text-gray-600">Subtotal</dt>
            <dd className="text-sm text-gray-600">
              <span className="text-gray-600">{account.currencySymbol}</span>{' '}
              {cart.subtotal}
            </dd>
          </div>
        )}
        {parseFloat(cart.bookingFees) > 0 && (
          <div className="flex items-center justify-between">
            <dt className="flex items-center text-sm text-gray-600">
              <span>Booking fees</span>
            </dt>
            <dd className="text-sm text-gray-600">
              <span className="text-gray-600">{account.currencySymbol}</span>{' '}
              {cart.bookingFees}
            </dd>
          </div>
        )}
        {parseFloat(cart.paymentFees) > 0 && (
          <div className="flex items-center justify-between">
            <dt className="flex text-sm text-gray-600">
              <span>Payment processing fee</span>
            </dt>
            <dd className="text-sm text-gray-600">
              <span className="text-gray-600">{account.currencySymbol}</span>{' '}
              {cart.paymentFees}
            </dd>
          </div>
        )}
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
          <dt className="text-base font-medium text-gray-800">Order total</dt>
          <dd className="text-base font-medium text-gray-800">
            <span className="text-gray-600">{account.currencySymbol}</span>{' '}
            {cart.total}
          </dd>
        </div>
      </dl>

      {error && (
        <Alert type="error" className="mt-6">
          {error}
        </Alert>
      )}
      {message && (
        <Alert type="info" className="mt-6">
          {message}
        </Alert>
      )}

      <div className="mt-6">
        <Button
          className="w-full py-3 text-base"
          disabled={buttonDisabled}
          onClick={
            cartStage === CartStage.CUSTOMER_DETAILS
              ? undefined
              : handleCheckoutClick
          }
        >
          {cartStage === CartStage.CUSTOMER_DETAILS
            ? `Pay ${account.currencySymbol}${cart.total}`
            : 'Checkout'}
        </Button>
      </div>
    </section>
  );
}
