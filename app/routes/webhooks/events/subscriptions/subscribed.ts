import { ActionFunction, json } from "@remix-run/node";
import { SubscriptionSubscribedDto } from "~/application/dtos/events/SubscriptionSubscribedDto";
import { i18nHelper } from "~/locale/i18n.utils";
import SubscriptionUtils from "~/utils/app/SubscriptionUtils";

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method === "POST") {
      const { t } = await i18nHelper(request);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const body = (await request.json()) as SubscriptionSubscribedDto;
      // do something with the body 😉
      const billingPeriodName = SubscriptionUtils.getBillingPeriodDescription(t, body.subscription.price.billingPeriod);
      return json(
        {
          message: `New customer on the ${body.subscription.product.title} - $${body.subscription.price.amount} (${billingPeriodName}) plan 😊!`,
        },
        { status: 200 }
      );
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};
