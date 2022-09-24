import { Field } from 'formik';
import React from 'react';
import { InputProps } from '../form';

type Props = InputProps<string> & {
  label: string;
  labelClassName?: string;
  /**
   * The maximum quantity that can be selected.
   */
  max?: number;
};

export function QuantitySelect({
  label,
  labelClassName = '',
  max = 10,
  ...props
}: Props) {
  return (
    <React.Fragment>
      <label htmlFor={props.id || props.name} className={labelClassName}>
        {label}
      </label>
      <Field
        as="select"
        {...props}
        className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {[...Array(max + 1).keys()].map(quantity => (
          <option key={quantity.toString()} value={quantity.toString()}>
            {quantity.toString()}
          </option>
        ))}
      </Field>
    </React.Fragment>
  );
}
