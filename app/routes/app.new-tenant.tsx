import { Link } from "react-router-dom";
import { ActionFunction, json, LoaderFunction, redirect, useActionData, useNavigate } from "remix";
import { Language } from "remix-i18next";
import { TenantUserRole } from "~/application/enums/tenants/TenantUserRole";
import { WorkspaceType } from "~/application/enums/tenants/WorkspaceType";
import TenantNew from "~/components/core/settings/tenant/TenantNew";
import Logo from "~/components/front/Logo";
import { i18nHelper } from "~/locale/i18n.utils";
import { createTenant, createTenantUser, getMyTenants } from "~/utils/db/tenants.db.server";
import { getUser, updateUserDefaultWorkspaceId } from "~/utils/db/users.db.server";
import { createWorkspace, createWorkspaceUser } from "~/utils/db/workspaces.db.server";
import { getUserInfo } from "~/utils/session.server";
import { createStripeCustomer } from "~/utils/stripe.server";

type LoaderData = {
  myTenants: Awaited<ReturnType<typeof getMyTenants>>;
  i18n: Record<string, Language>;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { translations } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  const myTenants = await getMyTenants(userInfo.userId);
  const data: LoaderData = {
    i18n: translations,
    myTenants,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let userInfo = await getUserInfo(request);
  if (!userInfo) {
    return null;
  }
  const form = await request.formData();
  const user = await getUser(userInfo.userId);
  if (!user) {
    return redirect("/logout");
  }
  const name = form.get("name")?.toString() ?? "";
  if (!name) {
    return badRequest({ error: "Name required" });
  }
  const stripeCustomer = await createStripeCustomer(user?.email, name);
  if (!stripeCustomer) {
    return badRequest({ error: "Could not create Stripe customer" });
  }
  const tenant = await createTenant(name, stripeCustomer.id, "");
  await createTenantUser({
    tenantId: tenant.id,
    userId: user.id,
    role: TenantUserRole.OWNER,
  });
  const defaultWorkspace = await createWorkspace({
    tenantId: tenant.id,
    name: "Default workspace",
    type: WorkspaceType.PRIVATE,
    businessMainActivity: "",
    registrationNumber: "",
  });

  if (!defaultWorkspace) {
    return badRequest({ error: "Could not create default workspace" });
  }
  await createWorkspaceUser({
    workspaceId: defaultWorkspace.id,
    userId: user.id,
  });

  await updateUserDefaultWorkspaceId({ defaultWorkspaceId: defaultWorkspace.id }, user.id);

  return redirect(`/app/${tenant.id}/${defaultWorkspace.id}/dashboard`);
};

export default function AppRoute() {
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  return (
    <div>
      <div className="bg-white dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="flex-shrink-0 flex justify-center">
            <Link to="/" className="inline-flex">
              <Logo />
            </Link>
          </div>
          <div className="sm:flex sm:flex-col sm:align-center">
            <div className="relative max-w-xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
              <svg className="absolute left-full transform translate-x-1/2" width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
                <defs>
                  <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
              </svg>
              <svg
                className="absolute right-full bottom-0 transform -translate-x-1/2"
                width="404"
                height="404"
                fill="none"
                viewBox="0 0 404 404"
                aria-hidden="true"
              >
                <defs>
                  <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-black" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
              </svg>
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">Create organization</h1>
                <p className="mt-4 text-lg leading-6 text-gray-500">You will be the owner</p>
              </div>
              <div className="mt-12">
                <TenantNew />
                <div id="form-error-message">
                  {actionData?.error ? (
                    <p className="text-rose-500 text-xs py-2" role="alert">
                      {actionData.error}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-sm font-medium text-theme-600 dark:text-theme-400 hover:text-theme-500 w-full text-center"
                  >
                    <span aria-hidden="true"> &larr;</span> Go back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
