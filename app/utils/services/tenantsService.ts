import { getMonthlyContractsCount } from "~/modules/contracts/db/contracts.db.server";
import { getEmployeesCount } from "~/modules/contracts/db/employees.db.server";
import { getSubscriptionPriceByStripeId } from "../db/subscriptionProducts.db.server";
import { TenantWithDetails } from "../db/tenants.db.server";
import { getStripeSubscription } from "../stripe.server";

export async function loadTenantsSubscriptionAndUsage(items: TenantWithDetails[]) {
  return Promise.all(
    items.map(async (item) => {
      item.usersCount = item.users.length;

      item.contractsCount = await getMonthlyContractsCount(item.id);
      item.employeesCount = await getEmployeesCount(item.id);

      // const stripeSubscription = await getStripeSubscription(item.subscriptionId ?? "");
      // if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
      //   item.subscriptionPrice = await getSubscriptionPriceByStripeId(stripeSubscription?.items.data[0].plan.id);
      // }

      return item;
    })
  );
}
