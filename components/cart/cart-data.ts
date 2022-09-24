import _ from 'lodash';
import * as Yup from 'yup';
import { Cart, CartLine } from 'mightytix';
import { CartFormFields, CartStage } from './types';

export const emptyCart: Cart = {
  id: '0000',
  subtotal: '0.00',
  cartLines: [],
  bookingFees: '0.00',
  paymentFees: '0.00',
  total: '0.00',
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  acceptsMarketing: false,
  expires: new Date().toISOString(),
  paymentIntentClientSecret: null,
};

export const validationSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'Too short.'),
  lastName: Yup.string().min(2, 'Too short.'),
  email: Yup.string().email('Invalid email.'),
  phone: Yup.string().min(5, 'Too short.'),
  paymentFormComplete: Yup.boolean(),
});

export const getInitialValues = (cartLines: CartLine[]): CartFormFields => ({
  cartStage: CartStage.SESSION_SELECT,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  acceptsMarketing: false,
  paymentFormComplete: true,
  ticketQuantity: _.reduce(
    cartLines,
    (ticket_qty_result, cartLine) => {
      return _.merge(ticket_qty_result, {
        [`${cartLine.sessionTicketType.sessionId}`]: {
          [`${cartLine.sessionTicketType.ticketTypeId}`]: cartLine.quantity,
        },
      });
    },
    {},
  ),
});
