export const stripeAppearance = {
  theme: 'stripe',
  variables: {
    borderRadius: '5px',
    colorDanger: '#dc2626',
    colorText: '#374151',
    fontFamily: `Inter var, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
    fontSizeBase: '15px',
    fontSmooth: 'auto',
    fontWeightNormal: '500',
    spacingGridColumn: '18px',
    spacingGridRow: '40px',
    spacingUnit: '3px',
  },
  rules: {
    '.Error': {
      fontSize: '14px',
    },
    '.Input': {
      borderColor: 'rgba(209, 213, 219)',
      color: 'rgba(17, 24, 39)',
    },
    '.Input--invalid': {
      borderColor: 'rgba(209, 213, 219)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    '.Label': {
      fontSize: '14px',
    },
  },
} as const;
