export type CartFormFields = {
  cartStage: CartStage;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  acceptsMarketing: boolean;
  paymentFormComplete: boolean;
  ticketQuantity: {
    // Session ID
    [key: string]: {
      // Ticket type ID
      [key: string]: string;
    };
  };
};

export type CartFormValidate = (
  values: CartFormFields,
) => Partial<Record<keyof CartFormFields, string>>;

export enum CartStage {
  SESSION_SELECT,
  TICKET_SELECT,
  CUSTOMER_DETAILS,
}

export type CartTicketQuantityChangeHandler = (
  sessionId: string,
  ticketTypeId: string,
  quantity: number,
) => void;
