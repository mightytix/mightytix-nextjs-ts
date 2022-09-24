import { useFormikContext } from 'formik';
import { ArrowSmLeftIcon } from '@heroicons/react/solid';
import { Checkbox, TextInput } from '../form';
import { PaymentElement } from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';

type Props = {
  cartExpired: boolean;
  handleBackClick: React.MouseEventHandler<HTMLButtonElement>;
};

/**
 * Customer details form including payment details
 *
 */
export function CustomerDetails({ cartExpired, handleBackClick }: Props) {
  const { setFieldValue } = useFormikContext();

  // Validation for form (and submit button) as payment details change
  const handlePaymentElementChange = (
    event: StripePaymentElementChangeEvent,
  ) => {
    setFieldValue('paymentFormComplete', event.complete);
  };

  return (
    <div className="mx-auto w-full">
      <div className="flex pb-8">
        <button
          type="button"
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleBackClick}
        >
          <ArrowSmLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-center pt-0.5 w-full text-2xl text-gray-700 sm:text-xl">
          Contact details &amp; payment
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <TextInput
          className="mt-2"
          name="firstName"
          label="First name"
          autoComplete="given-name"
          autoFocus
        />

        <TextInput
          className="mt-2"
          name="lastName"
          label="Last name"
          autoComplete="family-name"
        />

        <TextInput
          className="mt-4"
          name="email"
          label="Email address"
          autoComplete="email"
        />

        <TextInput
          className="mt-4"
          name="phone"
          label="Phone number"
          autoComplete="tel"
        />
      </div>

      <div className="mt-11">
        {!cartExpired && (
          <PaymentElement
            id="payment-element"
            onChange={handlePaymentElementChange}
          />
        )}
      </div>

      <Checkbox
        className="mt-8"
        name="acceptsMarketing"
        label="Please let me know about future events I might be interested in."
        labelClassName="text-sm text-gray-500"
      />
    </div>
  );
}
