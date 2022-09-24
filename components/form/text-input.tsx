import { Field, useField } from 'formik';
import { classNames } from '../helpers';
import { InputError } from './input-error';
import { InputLabel } from './input-label';
import { InputProps } from './input-props';

type TextInputProps = InputProps<string>;

const getClassNames = (disabled: boolean, horizontal: boolean) => {
  const orientation = horizontal ? 'max-w-lg sm:max-w-xs' : 'px-3 py-2';

  const colour = disabled
    ? 'placeholder-gray-200 text-gray-400'
    : 'placeholder-gray-400 text-gray-900';

  return classNames(
    'block w-full border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-1 sm:text-sm',
    orientation,
    colour,
  );
};

export function TextInput({
  className = '',
  disabled = false,
  horizontal = false,
  label = '',
  optional = false,
  ...props
}: TextInputProps) {
  const [, meta] = useField(props);

  return (
    <div className={className}>
      {label && (
        <InputLabel
          disabled={disabled}
          horizontal={horizontal}
          htmlFor={props.id || props.name}
          optional={optional}
        >
          {label}
        </InputLabel>
      )}
      <div className={classNames(horizontal && 'sm:col-span-2')}>
        <Field
          className={getClassNames(disabled, horizontal)}
          disabled={disabled}
          type="text"
          {...props}
        />
      </div>
      <InputError touched={meta.touched} error={meta.error} />
    </div>
  );
}
