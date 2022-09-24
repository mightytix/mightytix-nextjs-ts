import _ from 'lodash';
import { DateTime } from 'luxon';
import React, { useContext } from 'react';
import { useQuery } from '@apollo/client';
import { ArrowSmLeftIcon } from '@heroicons/react/outline';
import {
  CartLine,
  Session,
  SessionTicketTypeConnection,
} from 'mightytix';
import { AccountContext } from '../auth';
import { Alert, Spinner } from '../feedback';
import { GET_SESSION_TICKET_TYPES } from './inventory.gql';
import { QuantitySelect } from './quantity-select';
import { TicketPrice } from './ticket-price';

type Props = {
  /**
   * The tickets currently in the cart.
   */
  cartLines?: CartLine[];
  disabled?: boolean;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  onBackClick: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * The session for which we're showing available ticket types.
   */
  selectedSession?: Session;
};

export function TicketSelect({
  cartLines = [],
  disabled,
  onBackClick,
  onChange,
  selectedSession,
}: Props) {
  const { loading, error, data } = useQuery(GET_SESSION_TICKET_TYPES, {
    skip: selectedSession === undefined,
    variables: {
      sessionId: selectedSession?.id,
    },
  });
  const sessionTicketTypeConnection: SessionTicketTypeConnection =
    data?.sessionTicketTypes;

  const account = useContext(AccountContext)[0];

  if (!selectedSession) {
    return null;
  }

  if (loading) return <Spinner />;
  if (error) return <Alert type="error">{`${error}`}</Alert>;
  if (!sessionTicketTypeConnection)
    return <Alert type="error">Unable to load session ticket types.</Alert>;

  const start = DateTime.fromISO(selectedSession.start, {
    locale: account.locale,
    zone: selectedSession.venue.timezone,
  });

  // Sort ticket types
  const sortedSessionTicketTypeEdges = _.sortBy(
    sessionTicketTypeConnection.edges,
    ({ node: sessionTicketType }) => sessionTicketType.ticketType.sort,
  );

  /**
   * Calculate maximum quantities that can be selected for each session
   * ticket type.
   *
   */
  const maxQuantities = new Map<string, number>();
  // Current number of tickets selected for this session
  const getSessionTicketCount = () =>
    cartLines.reduce((prev, cartLine) => {
      if (cartLine.sessionTicketType.sessionId === selectedSession?.id) {
        return prev + cartLine.quantity;
      } else {
        return prev;
      }
    }, 0);
  // Iterate available ticket types
  for (let i = 0; i < sortedSessionTicketTypeEdges.length; i++) {
    // Create string key for map since objects are compared by reference
    const sessionTicketTypeId = `${sortedSessionTicketTypeEdges[i].node.sessionId}#${sortedSessionTicketTypeEdges[i].node.ticketTypeId}`;
    maxQuantities.set(
      sessionTicketTypeId,
      sortedSessionTicketTypeEdges[i].node.max,
    );
    // Iterate currently chosen cart lines
    let cartLineProcessed = false;
    for (let j = 0; j < cartLines.length; j++) {
      if (
        cartLines[j].sessionTicketType.sessionId ===
          sortedSessionTicketTypeEdges[i].node.sessionId &&
        cartLines[j].sessionTicketType.ticketTypeId ===
          sortedSessionTicketTypeEdges[i].node.ticketTypeId
      ) {
        // Adjust available max based on the maximum for the session, the total
        // number of tickets already selected, and the number of those that are
        // this session ticket type
        const maxAvailable =
          selectedSession.max - getSessionTicketCount() + cartLines[j].quantity;
        if (
          maxQuantities.has(sessionTicketTypeId) &&
          maxAvailable < (maxQuantities.get(sessionTicketTypeId) || 10)
        ) {
          maxQuantities.set(sessionTicketTypeId, maxAvailable);
        }
        cartLineProcessed = true;
      }
    }
    if (!cartLineProcessed) {
      const maxAvailable = selectedSession.max - getSessionTicketCount();
      if (
        maxQuantities.has(sessionTicketTypeId) &&
        maxAvailable < (maxQuantities.get(sessionTicketTypeId) || 10)
      ) {
        maxQuantities.set(sessionTicketTypeId, maxAvailable);
      }
    }
  }
  // Finally adjust the maximum down if it's higher than the maximum for the
  // session
  maxQuantities.forEach((maxQuantity, sessionTicketTypeId) => {
    if (
      sessionTicketTypeId.split('#')[0] === selectedSession.id &&
      maxQuantity > selectedSession.max
    ) {
      maxQuantities.set(sessionTicketTypeId, selectedSession.max);
    }
  });

  return (
    <React.Fragment>
      <div className="flex pb-8">
        <button
          type="button"
          onClick={onBackClick}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowSmLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-center pt-0.5 w-full text-2xl text-gray-700 sm:text-xl">
          {start.toLocaleString({
            ...DateTime.DATETIME_MED,
          })}{' '}
          — {selectedSession.venue.name}
        </h2>
      </div>

      <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
        {sortedSessionTicketTypeEdges.map(({ node: sessionTicketType }) => (
          <li
            key={sessionTicketType.ticketTypeId}
            className="flex flex-col py-6"
          >
            <div className="ml-4 flex-1 flex flex-col sm:ml-6">
              <div>
                <div className="flex justify-between">
                  <p className="w-1/3 pt-2 text-sm font-medium text-gray-700">
                    {sessionTicketType.ticketType.name}
                  </p>
                  <TicketPrice
                    currencySymbol={account.currencySymbol}
                    sessionTicketType={sessionTicketType}
                  />
                  <p className="w-1/3 text-right">
                    <QuantitySelect
                      disabled={disabled}
                      label={`Quantity for ${sessionTicketType.ticketType.name}`}
                      labelClassName="sr-only"
                      max={maxQuantities.get(
                        `${sessionTicketType.sessionId}#${sessionTicketType.ticketTypeId}`,
                      )}
                      name={`ticketQuantity.${sessionTicketType.sessionId}.${sessionTicketType.ticketTypeId}`}
                      onChange={onChange}
                    />
                  </p>
                </div>
              </div>
            </div>
            {sessionTicketType.ticketType.descriptionHtml && (
              <div className="mx-4 mt-1 sm:mx-6 text-sm font-normal whitespace-pre-line text-gray-500">
                {sessionTicketType.ticketType.descriptionHtml}
              </div>
            )}
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}
