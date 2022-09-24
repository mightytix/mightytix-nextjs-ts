import { FieldHookConfig } from 'formik';

export type InputProps<T> = FieldHookConfig<T> & {
  label?: string;
  optional?: boolean;
  /** Is the input group to be displayed horizontally on wide enough screens? */
  horizontal?: boolean;
  wrapperClassName?: string;
};
