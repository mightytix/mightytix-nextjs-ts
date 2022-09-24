import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { classNames } from '../helpers';
import { removeSessionStorage } from '../frontend';

type Props = {
  expiry: DateTime | null;
  setCartExpired: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Cart timer counts down to the expiry of the cart.
 */
export function CartTimer({ expiry, setCartExpired }: Props) {
  const [status, setStatus] = useState('');
  const [backgroundClass, setBackgroundClass] = useState('bg-blue-600');

  useEffect(() => {
    if (!expiry) {
      return;
    }

    const intervalId = setInterval(() => {
      const dateNow = DateTime.now();
      const diff = expiry.diff(dateNow, ['minutes', 'seconds']);
      const minutes = diff.minutes;
      const seconds = Math.floor(diff.seconds);

      if (minutes <= 3) {
        setBackgroundClass('bg-pink-700');
      }
      if (minutes <= 0 && seconds < 0) {
        setStatus('Sorry, your cart has expired.');
        setCartExpired(true);
        removeSessionStorage('cartId');
      } else {
        setStatus(
          `Time remaining ${minutes}:${seconds.toString().padStart(2, '0')}`,
        );
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expiry, setCartExpired]);

  return (
    <p
      className={classNames(
        backgroundClass,
        'h-10 flex items-center justify-center text-sm font-medium text-white px-4 sm:px-6 lg:px-8',
      )}
    >
      {status}
    </p>
  );
}
