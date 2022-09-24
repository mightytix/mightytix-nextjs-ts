type Props = {
  touched: boolean;
  error: string | undefined;
};

export function InputError({ touched = false, error = undefined }: Props) {
  if (!touched || !error) {
    return null;
  }

  return <p className="text-sm text-red-600">{error}</p>;
}
