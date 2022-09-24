import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Cart,
  UpdateOneCartInput,
} from 'mightytix';
import { Loading } from '../feedback';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { UPDATE_CART } from './cart.gql';
import { CartFormFields } from './types';

type Props = {
  cart: Cart;
  children: (
    handleSubmit: (values: CartFormFields) => void,
    loading: boolean,
  ) => JSX.Element;
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

export function CartPayment({
  cart,
  children,
  setCart,
  setError,
  setMessage,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  // Loading state is true until stripe and elements are loaded
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(false);

  useEffect(() => {
    stripe && elements && setLoading(false);
  }, [stripe, elements]);

  const [updateCart] = useMutation<{ updateCart: Cart }>(UPDATE_CART);

  const clientSecret = new URLSearchParams(window.location.search).get(
    'payment_intent_client_secret',
  );

  // Feedback
  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent === undefined) {
        setError('Something went wrong – please reload the page.');
        return;
      }
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          router.push(`/confirm?ref=${paymentIntent.id}`, '/confirm');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          router.push(`/confirm?ref=${paymentIntent.id}`, '/confirm');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          setPaymentError(true);
          break;
        default:
          setMessage('Something went wrong.');
          setPaymentError(true);
          break;
      }
    });
  }, [clientSecret, router, setError, setMessage, stripe]);

  // Checkout submission handler
  const handleSubmit = async (values: CartFormFields) => {
    if (!stripe || !elements) {
      console.warn('Stripe or elements not loaded.');
      return;
    }

    const updateCartInput: UpdateOneCartInput = {
      id: cart.id,
      update: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        acceptsMarketing: values.acceptsMarketing,
      },
    };

    updateCart({ variables: { input: updateCartInput } }).then(
      async ({ data }) => {
        if (data) {
          // Save cart state
          setCart(data.updateCart);

          // Initiate Stripe charge
          setLoading(true);

          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              // Return to the same page for further processing above
              return_url: window.location.href,
            },
          });

          // This point will only be reached if there is an immediate error when
          // confirming the payment. Otherwise, your customer will be redirected to
          // your `return_url`. For some payment methods like iDEAL, your customer will
          // be redirected to an intermediate site first to authorize the payment, then
          // redirected to the `return_url`.
          setError(error.message || 'A payment error occurred.');
          setLoading(false);
        } else {
          setError('Unable to save contact details.');
        }
      },
    );
  };

  // If there's no error, redirect to confirmation without redisplaying
  // the form
  if (clientSecret && !paymentError) {
    return <Loading />;
  }

  return children(handleSubmit, loading);
}
