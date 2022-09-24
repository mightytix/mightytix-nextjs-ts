import { FieldHookConfig, useField } from 'formik';
import { ReactNode } from 'react';
import { classNames } from '../helpers';

type CheckboxProps = FieldHookConfig<string> & {
  children?: ReactNode;
  className?: string;
  label?: string;
  labelClassName?: string;
};

export function Checkbox({
  children,
  className = '',
  label,
  labelClassName,
  ...props
}: CheckboxProps) {
  // React treats radios and checkbox inputs differently other input types, select, and textarea.
  // Formik does this too! When you specify `type` to useField(), it will
  // return the correct bag of props for you -- a `checked` prop will be included
  // in `field` alongside `name`, `value`, `onChange`, and `onBlur`
  const [field, meta] = useField({ ...props, type: 'checkbox' });

  className = classNames(className, 'relative flex items-start');

  return (
    <div className={className}>
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          id={props.id || props.name}
          aria-describedby={
            children ? `${props.id || props.name}-description` : undefined
          }
          {...field}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor={props.id || props.name}
          className={labelClassName ?? 'font-medium text-gray-700'}
        >
          {label}
        </label>
        {children && (
          <p
            id={`${props.id || props.name}-description`}
            className="text-gray-500"
          >
            {children}
          </p>
        )}
      </div>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </div>
  );
}
