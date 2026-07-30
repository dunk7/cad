# California Art Delivery

Next.js marketing site + Stripe online ordering for [californiaartdelivery.com](https://californiaartdelivery.com).

## Quick start

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (password from `ADMIN_PASSWORD`).

## Ordering

- `/schedule` — Schedule Now wizard (categories → items → pickup → delivery → schedule → review → pay)
- ACH is preferred at Stripe Checkout; card is a secondary option
- Without real Stripe keys, checkout simulates payment for local testing

## Stack

- Next.js 15 + Tailwind
- Prisma + SQLite
- Stripe Checkout + webhooks

## Env

See `.env.example` for `DATABASE_URL`, `ADMIN_PASSWORD`, and Stripe keys.
