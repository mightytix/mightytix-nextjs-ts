import { sortBy } from 'lodash';

/**
 * The common fields of a ticket or cart line relevant for sorting.
 */
type TicketLike = {
  sessionTicketType: {
    session: {
      start: Date | string;
      end?: Date | string | null;
    };
    ticketType: {
      sort?: number | null;
    };
  };
};

/**
 * Sort tickets in an order, or cart lines in a cart.
 */
export const sortTickets = <T extends TicketLike>(tickets: T[]): T[] =>
  sortBy(tickets, ({ sessionTicketType }) => [
    sessionTicketType.session.start,
    sessionTicketType.session.end,
    sessionTicketType.ticketType.sort,
  ]);
