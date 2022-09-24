Starter repo for an event or venue website selling tickets using the Mighty Tix [event ticketing software](https://mightytix.com/) platform. Clone this repo to set up and customize your own ticketing checkout process using [Next.js](https://nextjs.org/).

This could be used to sell tickets alongside an existing website – for example a WordPress event site at event-name.com, and this system selling tickets at tickets.event-name.com.

You could also build your entire event or venue website around the ticketing system, simply by adding more files to the `/pages` folder after cloning this repo. See the note below about renaming `index.tsx` if this is the case.

## Getting Started

First, install the needed dependencies:

```bash
npm install
# or
yarn install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the customer ticketing checkout.

## Configuration

The only configuration option required is setting your Mighty Tix URL. By default the Mighty Tix demo URL is configured so that you can see the system working.

Update this in the `/.env` file to point to your own Mighty Tix domain:

```bash
# Change to your Mighty Tix URL
NEXT_PUBLIC_MIGHTYTIX_DOMAIN=my-event.mightytix.com
```

The development server will automatically reload and connect to your Mighty Tix account.

## Pages

The two pages provided are the cart (customer ticket selection and checkout) and confirm. The cart is set up as the index page so it's loaded by default as the root URL:

[localhost:3000/](http://localhost:3000/)

If you're building your event or venue website into this Next.JS app you'll likely want to change the name of the cart page from `/pages/index.tsx` to `tickets.tsx`, `registration.tsx`, `cart.tsx` or similar.

The other page is the confirmation screen which is shown after a successful ticket purchase. This page also allows the attendee to download their ticket(s) in PDF format. This name of this page is `/pages/confirm.tsx`.

If you decide to change the name of the confirmation page, you'll also need to update the two calls to `router.push()` in `/components/cart/cart-payment.tsx`, e.g:

```typescript
router.push(`/thankyou?ref=${paymentIntent.id}`, '/thankyou');
```

## Learn More

To learn more about Mighty Tix review the documentation:

- [Getting Started guide](https://mightytix.com/docs/getting-started) - everything you need to know to begin selling tickets with Mighty Tix.
- [Customer API reference](https://mightytix.com/docs/customer-api) - documentation for the GraphQL API used to sell tickets.

## Deployment

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for details on how to deploy a Next.js app.
