import { classNames } from '../helpers';

type Props = {
  htmlFor: string;
  disabled?: boolean;
  optional?: boolean;
  horizontal?: boolean;
  children: string;
};

const getClassNames = (disabled: boolean, horizontal: boolean) => {
  const orientation = horizontal
    ? 'block sm:mt-px sm:pt-2'
    : 'flex justify-between';

  const colour = disabled ? 'text-gray-400' : 'text-gray-700';

  return classNames('text-sm font-medium', orientation, colour);
};

export function InputLabel({
  htmlFor,
  disabled = false,
  optional = false,
  horizontal = false,
  children = '',
}: Props) {
  return (
    <label htmlFor={htmlFor} className={getClassNames(disabled, horizontal)}>
      {children}
      {optional && (
        <span className="ml-4 text-sm font-normal text-gray-400">Optional</span>
      )}
    </label>
  );
}
