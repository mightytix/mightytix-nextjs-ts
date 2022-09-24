import { DateTime } from 'luxon';
import { useContext } from 'react';
import { useQuery } from '@apollo/client';
import { RadioGroup } from '@headlessui/react';
import {
  Session,
  SessionConnection,
} from 'mightytix';
import { AccountContext } from '../auth';
import { Alert, Loading } from '../feedback';
import { classNames } from '../helpers';
import { GET_SESSIONS } from './inventory.gql';

type Props = {
  selected?: Session;
  onChange: (session: Session) => void;
};

export function SessionSelect({ selected, onChange }: Props) {
  const { loading, error, data } = useQuery(GET_SESSIONS);
  const sessionConnection: SessionConnection = data?.sessions;

  const account = useContext(AccountContext)[0];

  if (loading) return <Loading />;
  if (error) return <Alert type="error">{`${error}`}</Alert>;

  return (
    <RadioGroup value={selected} onChange={onChange}>
      <RadioGroup.Label className="sr-only">Date &amp; time</RadioGroup.Label>
      <div className="space-y-4">
        {sessionConnection.edges.map(({ node: session }) => {
          const start = DateTime.fromISO(session.start, {
            locale: account.locale,
            zone: session.venue.timezone,
          });
          return (
            <RadioGroup.Option
              key={session.id}
              value={session}
              className={({ checked, active }) =>
                classNames(
                  checked ? '' : 'border-gray-300',
                  active ? 'ring-2 ring-blue-500' : '',
                  'relative block bg-white border rounded-lg shadow-sm px-6 py-4 cursor-pointer sm:flex sm:justify-between focus:outline-none',
                )
              }
            >
              {({ active, checked }) => (
                <>
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label
                        as="p"
                        className="font-medium text-gray-900"
                      >
                        {start.toLocaleString({
                          ...DateTime.DATE_HUGE,
                        })}
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="div"
                        className="text-gray-500"
                      >
                        <p className="sm:inline">
                          {start.toLocaleString({
                            ...DateTime.TIME_SIMPLE,
                          })}
                        </p>
                      </RadioGroup.Description>
                    </div>
                  </div>
                  <RadioGroup.Description
                    as="div"
                    className="mt-2 flex text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right"
                  >
                    <div className="font-medium text-gray-900">
                      {session.venue.name}
                    </div>
                    <div className="ml-1 text-gray-500 sm:ml-0">
                      {session.venue.city}
                    </div>
                  </RadioGroup.Description>
                  <div
                    className={classNames(
                      active ? 'border' : 'border-2',
                      checked ? 'border-blue-500' : 'border-transparent',
                      'absolute -inset-px rounded-lg pointer-events-none',
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </RadioGroup.Option>
          );
        })}
      </div>
    </RadioGroup>
  );
}
