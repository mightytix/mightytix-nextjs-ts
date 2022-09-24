import { classNames } from '../helpers';

const getClassNames = (type: string, disabled: boolean): string => {
  const baseClassNames =
    'py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  switch (type) {
    case 'submit':
      return classNames(
        disabled
          ? 'bg-blue-300 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        baseClassNames,
        'border-transparent text-white',
      );
    case 'button':
      return classNames(
        disabled
          ? 'text-gray-500 cursor-not-allowed'
          : 'border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-blue-400',
        baseClassNames,
        'bg-white',
      );
    default:
      return '';
  }
};

export function Button({
  type = 'submit',
  children,
  className = '',
  disabled = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  // Cancel buttons shouldn't trigger onBlur - validation messages may move
  // form fields & prevent clicking
  if (type === 'button') {
    props.onMouseDown = e => e.preventDefault();
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classNames(className, getClassNames(type, disabled))}
      {...props}
    >
      {children}
    </button>
  );
}
