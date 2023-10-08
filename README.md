# Buat Event

### How to Setup:

1. setup .env
2. run `npm ci`
3. run `npm run db:migrate` to run the databse migration
4. run `npm run db:seed` to run database seeder
5. register payment invoice webhook
6. run `npm run dev` to test on local

### Webhook List:

1. `/api/webhook/payment/invoice`, register the url on xendit webhook invoice (invoice paid) section. you have to check "Also notify my application when an invoice has expired" and uncheck "Also notify my application when a payment has been received after expiry" on that section
