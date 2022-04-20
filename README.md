## remix-saas-kit

![Remix SaaS kit](https://yahooder.sirv.com/saasfrontends/remix/ss/cover.png)

### 1. Getting Started

💿 1.1. Rename the `.env.example` file to &rarr; `.env` and set the following values (although you can come back to this step later):

_Required_:

- **DATABASE_URL** - any [Prisma supported database](https://www.prisma.io/docs/reference/database-reference/supported-databases) connection string
- **SERVER_URL** - (http://localhost:3000 on dev, site's URL on prod)
- **SESSION_SECRET** - any secure string
- **ADMIN_EMAIL** - your admin user
- **ADMIN_PASSWORD** - don't commit your .env file

_Optional_:

- **APP_NAME** - eg: My SaaS app
- **STRIPE_SK** - [click here to get the secret key](https://dashboard.stripe.com/test/developers)
- **POSTMARK_SERVER_TOKEN** - [create a free Postmark email server here](https://account.postmarkapp.com/servers)
- **POSTMARK_FROM_EMAIL** - [Postmark sender signature](https://account.postmarkapp.com/signature_domains) (eg: hello@yoursaas.com)
- **INTEGRATIONS_CONTACT_FORMSPREE** - used for /contact URL ([create a free form here](https://formspree.io/forms))
- **SUPPORT_EMAIL** - used for emails
- **COMPANY_ADDRESS** - used for emails

💿 1.2. Open the `schema.prisma` file and set the datasource provider: **sqlite**, **postgresql**... _(I recommend using sqlite for local dev)_.

💿 1.3. Generate and seed your database _(if you get an error, delete the `prisma/migrations` folder)_.

```
npx prisma migrate dev --name init
```

If your using **sqlite** and your database gets messed up, you can always delete the `prisma/dev.db` file and run npx prisma db push again.

💿 1.4. Install modules and run the app (if you get and error, delete the `package-lock.json` file):

```
npm i
npm run dev
```

💿 1.5 Open [localhost:3000](http://localhost:3000) and play with the Light/Dark Mode toggle and Language Selector _(English/Spanish)_.

![localhost](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/localhost.png)

### 2. Creating Pricing Plans

The next steps require that you set the `SK_STRIPE` env variable.

💿 2.1. Log in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`. You will be redirected to the `admin/dashboard`.

![Admin Dashboard](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/admin-dashboard.png)

💿 2.2. To generate the **Stripe pricing plans** go to `/admin/setup/pricing`.

![https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/admin-setup-pricing.png]

💿 2.3. Click on `Click here to create them`.

![Created pricing plans](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/admin-pricing.png)

💿 2.4. Verify the created Stripe products at the `/pricing` page.

![Pricing](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/pricing.png)

💿 2.5. Add a new pricing plan.

![New pricing plan](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/admin-pricing-new.png)

You should see the new plan on the /admin/setup/pricing page:

![Pricing plans](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/admin-pricing-with-custom.png)

### 3. Creating Email Templates

The next steps require that you set the `POSTMARK_SERVER_TOKEN` and `POSTMARK_FROM_EMAIL` env variables.

💿 3.1. To generate the **Postmark email templates** go to `/admin/setup/emails`.

![Setup Email Templates](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/admin-setup-emails.png)

💿 3.2. Click on `Create all`.

![Email Templates](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/admin-emails.png)

💿 3.3. Click on `Send test` on the *Welcome* email template.

![Welcome Email](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/welcome-email.png)

💿 3.4. Sign out.

### 4. Register as a SaaS user

💿 4.1. Register with your email at `/register`. You will be redirected to the `app/dashboard`.

![App Dashboard](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/app-dashboard.png)

💿 4.2. Click on `Subscribe` and subscribe to any plan _(use any [Stripe test card](https://stripe.com/docs/testing#cards))_.

![App Subscription Checkout](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/app-subscription-checkout.png)

![Subscribed](https://yahooder.sirv.com/saasfrontends/remix/tutorials/readme/app-subscribed.png)

💿 4.3. Cancel the subscription and subscribe to another pricing plan.

### 5. Create Contracts (sample application)

You can skip these steps since Contracts and Employees are for demonstration purposes only.

### IN CONSTRUCTION: THE STEPS BELOW ARE NOT REVISITED SINCE v0.1.0!!!

💿 4.3. Click on the sidebar item `Links` and `New link`. Invite your **admin** user (`ADMIN_EMAIL`) and its tenant **Tenant 1**. You should get an `tenant link invitation` email, and be redirected to `/app/links/pending`.

💿 3.4. Sign out, and log in as your **admin** user.

💿 3.5. Select the invited tenant and click on `1 pending link`.

💿 3.6. Reject the invitation. You should get a `invitation rejected` email.

💿 3.7. Sign out, log in as your user registered on **step 9**, and repeat **steps 11, 12 and 13**.

💿 3.8. Sign out, log in as your **admin** user and accept the invitation. You should get a `invitation accepted` email.

💿 3.9. Click on the sidebar item `Employees` and `Add employee`. Add 1 or 2.

💿 3.10. Click on the sidebar item `Contracts` and `New contract`. Set the `name` and `description`, and upload a `PDF file`. Click on `Select signatories and viewers`, select your **admin** user and the user registered on **step 9**. Click on `Select employees` and select 1 or 2. You should get a `new contract` email with the PDF as attachment. Edit or delete the contract if you want.

💿 3.11. Go to `app/settings/members` and add a new user. You should get an `user invitation` email.

20. That's it!
