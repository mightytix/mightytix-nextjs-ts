import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationIcon } from '@heroicons/react/solid';
import { classNames } from '../helpers';

type Props = {
  buttonClassName?: string;
  buttonLabel: string;
  children: React.ReactNode;
  onButtonClick?: () => void;
  onClose?: () => void;
  title: string;
  type: 'success' | 'warning';
};

export function Modal({
  buttonClassName = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  buttonLabel,
  children,
  onButtonClick,
  onClose,
  title,
  type = 'success',
}: Props) {
  const [open, setOpen] = useState(true);

  if (!onButtonClick) {
    onButtonClick = () => setOpen(false);
  }

  if (!onClose) {
    onClose = () => setOpen(false);
  }

  let iconClassName: string;
  let Icon: React.ElementType;
  switch (type) {
    case 'success':
      iconClassName = 'text-green-600';
      Icon = CheckCircleIcon;
      break;
    case 'warning':
      iconClassName = 'text-red-600';
      Icon = ExclamationIcon;
      break;
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle">
              <div>
                <Icon
                  className={classNames(
                    'mx-auto flex h-12 w-12 items-center justify-center',
                    iconClassName,
                  )}
                  aria-hidden="true"
                />
                <div className="mt-3 text-center sm:mt-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{children}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className={classNames(
                    buttonClassName,
                    'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm',
                  )}
                  onClick={onButtonClick}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
