import {
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/solid';
import { classNames } from '../helpers';

type Props = {
  children: React.ReactNode;
  className?: string;
  type: 'error' | 'info' | 'success' | 'warning';
};

export function Alert({ type = 'info', children, className = '' }: Props) {
  let colour: string;
  let Icon: React.ElementType;
  switch (type) {
    case 'info':
      colour = 'blue';
      Icon = InformationCircleIcon;
      break;
    case 'success':
      colour = 'green';
      Icon = CheckCircleIcon;
      break;
    case 'warning':
      colour = 'yellow';
      Icon = ExclamationIcon;
      break;
    case 'error':
      colour = 'red';
      Icon = XCircleIcon;
      break;
  }
  return (
    <div
      className={classNames(
        `rounded-md bg-${colour}-50 border border-${colour}-100 p-4 mb-6`,
        className,
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 text-${colour}-400`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className={`text-sm text-${colour}-700`}>{children}</p>
        </div>
      </div>
    </div>
  );
}
