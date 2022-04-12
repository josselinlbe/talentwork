import { SetupItem } from "~/application/dtos/setup/SetupItem";
import { getAllSubscriptionProducts } from "../db/subscriptionProducts.db.server";
import { getPostmarkTemplates } from "../email.server";

export async function getSetupSteps(): Promise<SetupItem[]> {
  return [await getPricingStep(), await getEmailStep()];
}

async function getPricingStep(): Promise<SetupItem> {
  const items = await getAllSubscriptionProducts();
  return Promise.resolve({
    title: "Pricing",
    description: "Create a good pricing strategy using the plans.server.ts file and generate them on your Payments provider.",
    completed: items.length > 0,
    path: "/admin/setup/pricing",
  });
}

async function getEmailStep(): Promise<SetupItem> {
  return new Promise((resolve) => {
    getPostmarkTemplates()
      .then((items) => {
        resolve({
          title: "Emails",
          description: "Add your email templates at /app/application/emails and generate them on your Email provider.",
          completed: items.length > 0,
          path: "/admin/setup/emails",
        });
      })
      .catch(() => {
        resolve({
          title: "Emails",
          description: "Add your email templates at /app/application/emails and generate them on your Email provider.",
          completed: false,
          path: "/admin/setup/emails",
        });
      });
  });
}
