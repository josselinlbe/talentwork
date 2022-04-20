## remix-saas-kit

![Remix SaaS kit](https://yahooder.sirv.com/saasfrontends/remix/ss/cover.png)

### Getting started

1. Rename the `.env.example` file to &rarr; `.env` and set the following values (although you can come back to this step later):

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
- **POSTMARK_FROM_EMAIL** - [Postmark sender signature](https://account.postmarkapp.com/signature_domains)
- **INTEGRATIONS_CONTACT_FORMSPREE** - used for /contact URL ([create a free form here](https://formspree.io/forms))
- **SUPPORT_EMAIL** - used for emails
- **COMPANY_ADDRESS** - used for emails

2. Open the `schema.prisma` file and set the datasource provider: **sqlite**, **postgresql**... _(I recommend using sqlite for local dev)_.

3. Generate and seed your database _(if you get an error, delete the `prisma/migrations` folder)_.

```
npx prisma migrate dev --name init
```

If your using **sqlite** and your database gets messed up, you can always delete the `prisma/dev.db` file and run npx prisma db push again.

4. Run the app:

```
yarn
yarn dev
```

4. Log in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

5. Generate **Stripe products** at `/admin/setup/pricing`.

6. Generate **Postmark email templates** at `/admin/emails`.

7. Sign out.

8. Verify the created Stripe products at the `/pricing` page.

9. Register with a new email at `/register`. You should get a `welcome` email.

10. Click on `Click here to subscribe` and subscribe any plan using **Stripe checkout** (use any [Stripe test card](https://stripe.com/docs/testing#cards)).

11. Click on the sidebar item `Links` and `New link`. Invite your **admin** user (`ADMIN_EMAIL`) and its tenant **Tenant 1**. You should get an `tenant link invitation` email, and be redirected to `/app/links/pending`.

12. Sign out, and log in as your **admin** user.

13. Select the invited tenant and click on `1 pending link`.

14. Reject the invitation. You should get a `invitation rejected` email.

15. Sign out, log in as your user registered on **step 9**, and repeat **steps 11, 12 and 13**.

16. Sign out, log in as your **admin** user and accept the invitation. You should get a `invitation accepted` email.

17. Click on the sidebar item `Employees` and `Add employee`. Add 1 or 2.

18. Click on the sidebar item `Contracts` and `New contract`. Set the `name` and `description`, and upload a `PDF file`. Click on `Select signatories and viewers`, select your **admin** user and the user registered on **step 9**. Click on `Select employees` and select 1 or 2. You should get a `new contract` email with the PDF as attachment. Edit or delete the contract if you want.

19. Go to `app/settings/members` and add a new user. You should get an `user invitation` email.

20. That's it!
