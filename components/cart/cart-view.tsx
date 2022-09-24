import { Form, FormikProps } from 'formik';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Transition } from '@headlessui/react';
import { Cart, Session } from 'mightytix';
import { Modal } from '../feedback';
import { emptyCart } from './cart-data';
import { CartTimer } from './cart-timer';
import { CustomerDetails } from './customer-details';
import { OrderSummary } from './order-summary';
import { SessionSelect } from './session-select';
import { TicketSelect } from './ticket-select';
import {
  CartFormFields,
  CartStage,
  CartTicketQuantityChangeHandler,
} from './types';

type Props = {
  cart: Cart;
  cartLoading: boolean;
  cartStage: CartStage;
  checkoutButtonDisabled: boolean;
  formik: FormikProps<CartFormFields>;
  heading: string;
  onSessionChange: (session: Session) => void;
  onTicketQuantityChange: CartTicketQuantityChangeHandler;
  paymentError: string;
  paymentMessage: string;
  resetSession: React.MouseEventHandler<HTMLButtonElement>;
  selectedSession?: Session;
  setCartStage: React.Dispatch<React.SetStateAction<CartStage>>;
};

export function CartView({
  cart,
  cartLoading = false,
  cartStage,
  checkoutButtonDisabled,
  formik,
  heading,
  onSessionChange,
  onTicketQuantityChange,
  paymentError,
  paymentMessage,
  resetSession,
  selectedSession,
  setCartStage,
}: Props) {
  const { isSubmitting, isValid, handleChange } = formik;
  const [cartExpired, setCartExpired] = useState(false);
  const router = useRouter();

  const handleCheckoutClick: React.MouseEventHandler<
    HTMLButtonElement
  > = event => {
    event.preventDefault();
    setCartStage(CartStage.CUSTOMER_DETAILS);
  };

  const handleCustomerDetailsBackClick: React.MouseEventHandler<
    HTMLButtonElement
  > = event => {
    event.preventDefault();
    setCartStage(
      selectedSession ? CartStage.TICKET_SELECT : CartStage.SESSION_SELECT,
    );
  };

  const handleTicketQuantityChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = event => {
    handleChange(event); // Update Formik
    onTicketQuantityChange(
      event.target.name.split('.')[1], // Session ID
      event.target.name.split('.')[2], // Ticket type ID
      parseInt(event.target.value),
    );
  };

  return (
    <div className="bg-white subpixel-antialiased">
      <header className="relative bg-white">
        <CartTimer
          expiry={
            cart.id !== emptyCart.id ? DateTime.fromISO(cart.expires) : null
          }
          setCartExpired={setCartExpired}
        />

        <nav
          aria-label="Top"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex h-16 items-center border-b border-gray-200">
            <h1 className="text-gray-700">{heading}</h1>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <Form>
          <fieldset
            className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16"
            disabled={cartExpired}
          >
            <section
              aria-labelledby="cart-heading"
              className="relative lg:col-span-7"
            >
              <h2 id="cart-heading" className="sr-only">
                Items in your cart
              </h2>

              <Transition
                show={cartStage === CartStage.SESSION_SELECT}
                enter="transition-all ease-linear duration-300 transform"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-all ease-linear duration-75 transform"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="p-1"
              >
                <SessionSelect
                  onChange={onSessionChange}
                  selected={selectedSession}
                />
              </Transition>
              <Transition
                show={cartStage === CartStage.TICKET_SELECT}
                enter="transition-all ease-linear duration-300 transform"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-all ease-linear duration-75 transform"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="p-1"
              >
                <TicketSelect
                  cartLines={cart.cartLines}
                  disabled={cartLoading}
                  onBackClick={resetSession}
                  onChange={handleTicketQuantityChange}
                  selectedSession={selectedSession}
                />
              </Transition>
              <Transition
                show={cartStage === CartStage.CUSTOMER_DETAILS}
                enter="transition-all ease-linear duration-300 transform"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-all ease-linear duration-75 transform"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="p-1"
              >
                {cart.paymentIntentClientSecret && (
                  <CustomerDetails
                    handleBackClick={handleCustomerDetailsBackClick}
                    cartExpired={cartExpired}
                  />
                )}
              </Transition>
            </section>

            <OrderSummary
              cart={cart}
              cartStage={cartStage}
              buttonDisabled={
                !isValid ||
                isSubmitting ||
                checkoutButtonDisabled ||
                cartExpired
              }
              error={paymentError}
              handleCheckoutClick={handleCheckoutClick}
              message={paymentMessage}
              onTicketQuantityChange={onTicketQuantityChange}
            />
          </fieldset>
        </Form>
      </main>

      {cartExpired && (
        <Modal
          buttonLabel="Restart"
          onButtonClick={() => router.reload()}
          onClose={() => null}
          title="Cart expired!"
          type="warning"
        >
          You ran out of time and the tickets in your cart were released. Please
          try again.
        </Modal>
      )}

      <footer aria-labelledby="footer-heading" className="bg-white">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-100 py-10">
            <a
              href="https://www.mightytix.com/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/mightytix_full_logo.svg"
                alt="Mighty Tix"
                width="120"
                className="m-auto block"
              />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
