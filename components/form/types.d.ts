import { FormikHelpers } from 'formik';
import * as Yup from 'yup';

type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;

type OnCancel = () => void;

type OnSubmit<K> = (
  values: K,
  { setStatus, setErrors }: FormikHelpers<K>,
) => void;

type Validate<K> = (values: K) => Partial<Record<keyof K, string>>;

type ValidationSchema<K> = Yup.ObjectSchema<Record<keyof K, Yup.AnySchema>>;

/**
 * Standard Formik props.
 */
export type FormProps<K> = {
  initialValues: K;
  onCancel: OnCancel;
  onSubmit: OnSubmit<K>;
  validate: Validate<K>;
  validationSchema: ValidationSchema<K>;
};

/**
 * Values in web forms are all strings, even if they're numbers.
 * This generic converts numbers in GraphQL types to strings so
 * they can be used more easily in forms.
 */
export type NumbersAsStrings<T> = {
  [P in keyof T]: T[P] extends number
    ? string
    : T[P] extends InputMaybe<number>
    ? string
    : T[P];
};
