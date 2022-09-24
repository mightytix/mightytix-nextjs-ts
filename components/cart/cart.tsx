import { Formik } from 'formik';
import _ from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Account,
  Cart,
  PaymentGatewayConnection,
  Session,
  SetCartLineInput,
} from 'mightytix';
import {
  AccountContext,
  GET_ACCOUNT_AND_GATEWAY,
} from '../auth';
import { Alert, Loading } from '../feedback';
import {
  getSessionStorage,
  removeSessionStorage,
  setSessionStorage,
} from '../frontend';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { emptyCart, getInitialValues, validationSchema } from './cart-data';
import { CartPayment } from './cart-payment';
import { CartView } from './cart-view';
import {
  CREATE_CART_WITH_LINE,
  CREATE_PAYMENT_INTENT,
  GET_CART,
  SET_CART_LINE,
} from './cart.gql';
import { stripeAppearance } from './config';
import {
  CartFormFields,
  CartFormValidate,
  CartStage,
  CartTicketQuantityChangeHandler,
} from './types';

// Set up Stripe outside the Cart's render process
const stripeKey = process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] || '';
const stripeKeyTest =
  process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST'] || '';
const stripePublishableKey =
  typeof window === 'undefined' // On the server
    ? stripeKey
    : process.env['NEXT_PUBLIC_MIGHTYTIX_DOMAIN'] === 'demo.mightytix.com' ||
      window.location.hostname === 'demo.mightytix.com'
    ? stripeKeyTest
    : stripeKey; // In prod browser

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found.');
}

export function Cart() {
  // Errors to display to user
  const [error, setError] = useState('');
  // Status messages for payments only
  const [paymentError, setPaymentError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  // Cart progression stage
  const [cartStage, setCartStage] = useState(CartStage.SESSION_SELECT);

  // Account details & config
  const [account, setAccount] = useContext(AccountContext);
  const [stripeAccountId, setStripeAccountId] = useState('');
  const {
    loading: accountLoading,
    error: accountError,
    data: accountData,
  } = useQuery<{ account: Account; paymentGateways: PaymentGatewayConnection }>(
    GET_ACCOUNT_AND_GATEWAY,
    {
      skip: account.loaded,
    },
  );
  React.useEffect(() => {
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
        currencySymbol: currencySymbol || '$',
        loaded: true,
      });

      document.title = accountData.account.name;
      setStripeAccountId(
        accountData.paymentGateways?.edges[0]?.node.gatewayAccountId,
      );
    }
  }, [account.loaded, accountData, setAccount]);

  // Load Stripe
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null>>();
  React.useEffect(() => {
    if (stripeAccountId) {
      setStripePromise(
        loadStripe(stripePublishableKey, {
          stripeAccount: stripeAccountId,
        }),
      );
    }
  }, [stripeAccountId]);

  // Session select & back button
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(
    undefined,
  );
  const resetSession = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setSelectedSession(undefined);
      setCartStage(CartStage.SESSION_SELECT);
    },
    [],
  );
  const handleSessionChange = (session: Session) => {
    setSelectedSession(session);
    setCartStage(CartStage.TICKET_SELECT);
  };

  // Cart load & update
  let cartId = getSessionStorage('cartId') as string;
  const [createCartWithLine, { loading: createCartWithLineLoading }] =
    useMutation<{ createCart: Cart }>(CREATE_CART_WITH_LINE);
  const [setCartLine, { loading: setCartLineLoading }] = useMutation<{
    setCartLine: Cart;
  }>(SET_CART_LINE);
  const {
    loading: cartLoading,
    error: cartError,
    data: cartData,
  } = useQuery(GET_CART, { skip: cartId === '', variables: { cartId } });
  const [cart, setCart] = useState<Cart>(emptyCart);
  // First load if we have a cart ID already
  useEffect(() => {
    if (cartData) {
      if (cartData.cart) {
        // Cart found
        setCart(cartData.cart);
      } else {
        // Cart not found
        removeSessionStorage('cartId');
        cartId = '';
        setCart(emptyCart);
      }
    }
  }, [cartData?.cart]);

  // Create a Stripe payment intent when required
  const [createPaymentIntent] = useMutation<{ createPaymentIntent: Cart }>(
    CREATE_PAYMENT_INTENT,
  );
  useEffect(() => {
    if (
      cartStage === CartStage.CUSTOMER_DETAILS &&
      !cart.paymentIntentClientSecret
    ) {
      createPaymentIntent({ variables: { cartId: cart.id } }).then(
        ({ data }) => {
          if (data) {
            setCart(data.createPaymentIntent);
          } else {
            setError('Unable to initiate payment.');
          }
        },
      );
    }
  }, [cart.id, cart.paymentIntentClientSecret, cartStage, createPaymentIntent]);

  // Ensure we don't show the empty cart state if we have a cart ID
  // otherwise form initialValues will be wrong
  if (cartId && cart.id === emptyCart.id) {
    // console.log('Found cartId but cart.id is empty cart ID, loading...');
    return <Loading />;
  }

  // Don't render until Stripe has loaded
  if (!stripePromise) {
    // console.log('Stripe loading...');
    return <Loading />;
  }

  // Standard loading and error
  if (accountLoading || cartLoading) {
    // console.log('Account loading or cart loading, so loading...');
    return <Loading />;
  }
  if (error || accountError || cartError)
    return (
      <Alert type="error">{`${error || accountError || cartError}`}</Alert>
    );

  const handleTicketQuantityChange: CartTicketQuantityChangeHandler = (
    sessionId: string,
    ticketTypeId: string,
    quantity: number,
  ) => {
    if (!cartId) {
      // No cart yet - create a new one with tickets
      createCartWithLine({
        variables: {
          sessionId,
          ticketTypeId,
          quantity,
        },
      }).then(({ data }) => {
        if (data) {
          setSessionStorage('cartId', data.createCart.id);
          setCart(data.createCart);
        } else {
          setError('Unable to create cart.');
        }
      });
    } else {
      // Update existing cart
      const setCartLineInput: SetCartLineInput = {
        cartId,
        sessionId,
        ticketTypeId,
        quantity,
      };
      setCartLine({ variables: { input: setCartLineInput } }).then(
        ({ data }) => {
          if (data) {
            setCart(data.setCartLine);
          } else {
            setError('Unable to update cart.');
          }
        },
      );
    }
  };

  // Reduce CartLine quantities into CartFormFields quantities
  const initialValues = getInitialValues(cart.cartLines);

  /**
   * Form Validation
   * @param values
   * @returns
   */
  const validate: CartFormValidate = (values: CartFormFields) => {
    const errors: Partial<Record<keyof CartFormFields, string>> = {};

    // Quantity
    const num_tickets = _.reduce(
      values.ticketQuantity,
      (total, sessionQty) => {
        return (
          total +
          _.reduce(
            sessionQty,
            (total, quantity) => total + parseInt(quantity),
            0,
          )
        );
      },
      0,
    );
    if (num_tickets < 1) {
      errors.ticketQuantity = 'You must select at least 1 ticket.';
    }

    if (cartStage === CartStage.CUSTOMER_DETAILS) {
      const fieldNames = ['firstName', 'lastName', 'email', 'phone'] as const;
      fieldNames.forEach(
        fieldName =>
          values[fieldName].trim() === '' && (errors[fieldName] = 'Required.'),
      );
      if (values.paymentFormComplete !== true) {
        errors.paymentFormComplete = 'Payment details incomplete.';
      }
    }

    return errors;
  };

  const stripeOptions: StripeElementsOptions = {
    clientSecret: cart.paymentIntentClientSecret || undefined,
    appearance: stripeAppearance,
  };

  return (
    <Elements
      options={stripeOptions}
      stripe={stripePromise}
      // Key is required as the options passed to Elements are immutable
      key={cart.paymentIntentClientSecret}
    >
      <CartPayment
        cart={cart}
        setCart={setCart}
        setError={setPaymentError}
        setMessage={setPaymentMessage}
      >
        {(handleSubmit, paymentLoading) => (
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validate={validate}
            validationSchema={validationSchema}
          >
            {formik => (
              <CartView
                cart={cart}
                cartLoading={createCartWithLineLoading || setCartLineLoading}
                cartStage={cartStage}
                checkoutButtonDisabled={paymentLoading}
                formik={formik}
                heading={account.name}
                onSessionChange={handleSessionChange}
                onTicketQuantityChange={handleTicketQuantityChange}
                paymentError={paymentError}
                paymentMessage={paymentMessage}
                resetSession={resetSession}
                selectedSession={selectedSession}
                setCartStage={setCartStage}
              />
            )}
          </Formik>
        )}
      </CartPayment>
    </Elements>
  );
}
