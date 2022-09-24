import { SessionTicketType } from 'mightytix';

type Props = {
  currencySymbol: string;
  sessionTicketType: SessionTicketType;
};

export function TicketPrice({ currencySymbol, sessionTicketType }: Props) {
  let price = sessionTicketType.price || sessionTicketType.ticketType.price;
  const bookingFee =
    sessionTicketType.bookingFee || sessionTicketType.ticketType.bookingFee;

  /**
   * Prominent inclusive price
   */
  price = (parseFloat(price) + parseFloat(bookingFee)).toString();

  return (
    <p className="w-1/3 pt-2 text-center text-sm font-medium text-gray-700">
      <span className="text-gray-500">{currencySymbol}</span> {price}
      {parseFloat(bookingFee) && (
        <span className="ml-1 font-normal text-xs text-gray-500">
          {' '}
          incl {currencySymbol}
          {bookingFee} fee
        </span>
      )}
    </p>
  );
}
