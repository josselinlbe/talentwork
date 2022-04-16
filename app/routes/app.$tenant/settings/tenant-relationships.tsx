import { useTranslation } from "react-i18next";
import { ActionFunction, json, Link, LoaderFunction, MetaFunction, redirect, useLoaderData, useParams } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { useState } from "react";
import UrlUtils from "~/utils/app/UrlUtils";
import TenantRelationshipsTable from "~/components/app/tenantRelationships/TenantRelationshipsTable";
import {
  TenantRelationshipWithDetails,
  getTenantRelationships,
  getTenantRelationship,
  updateTenantRelationship,
  deleteTenantRelationship,
} from "~/utils/db/tenantRelationships.db.server";
import { getTenantUrl } from "~/utils/services/urlService";
import { loadAppData } from "~/utils/data/useAppData";
import { getUser } from "~/utils/db/users.db.server";
import { TenantRelationshipStatus } from "~/application/enums/tenants/TenantRelationshipStatus";
import { sendEmail } from "~/utils/email.server";

type LoaderData = {
  title: string;
  items: TenantRelationshipWithDetails[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const items = await getTenantRelationships(tenantUrl.tenantId);
  const data: LoaderData = {
    title: `${t("models.tenantRelationship.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  items?: TenantRelationshipWithDetails[];
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const appData = await loadAppData(request, params);

  const form = await request.formData();
  const type = form.get("type")?.toString();
  const tenantRelationshipId = form.get("tenant-relationship-id")?.toString();
  if (!tenantRelationshipId) {
    return badRequest({ error: "Invalid tenant relationship" });
  }
  const existing = await getTenantRelationship(tenantRelationshipId);
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  if (type === "delete") {
    await deleteTenantRelationship(existing.id);
    return redirect(UrlUtils.currentTenantUrl(params, "settings/tenant-relationships"));
  } else if (type === "update-status") {
    const accepted = form.get("accepted")?.toString() === "true";
    const user = await getUser(existing?.createdByUserId);
    if (!user) {
      return badRequest({
        error: "Invalid user",
      });
    }

    await updateTenantRelationship(tenantRelationshipId, {
      status: accepted ? TenantRelationshipStatus.LINKED : TenantRelationshipStatus.REJECTED,
    });

    const relatedTenant = existing.providerTenantId === appData.currentTenant.id ? existing.clientTenant : existing.providerTenant;
    if (accepted) {
      await sendEmail(user.email, "tenant-relationship-accepted", {
        action_url: process.env.SERVER_URL + `/app/${relatedTenant.slug}/settings/tenant-relationships`,
        name: user.firstName,
        user_invitee_name: appData.user?.firstName,
        user_invitee_email: appData.user?.email,
        tenant_invitee: appData.currentTenant?.name,
        action_text: "View tenant relationships",
      });
    } else {
      await sendEmail(user.email, "tenant-relationship-rejected", {
        action_url: process.env.SERVER_URL + `/app/${relatedTenant.slug}/settings/tenant-relationships`,
        name: user.firstName,
        email: appData.user?.email,
        tenant: appData.currentTenant?.name,
        action_text: "View tenant relationships",
      });
    }

    const tenantUrl = await getTenantUrl(params);
    return json({
      items: await getTenantRelationships(tenantUrl.tenantId, TenantRelationshipStatus.PENDING),
    });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function TenantRelationshipsRoute() {
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        f.clientTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.providerTenant.name?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  return (
    <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
      <div>
        <div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center justify-between w-full space-x-2">
                <div className="relative flex items-center flex-grow">
                  <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="buscador"
                    id="buscador"
                    className="w-full focus:ring-theme-500 focus:border-theme-500 block rounded-md pl-10 sm:text-sm border-gray-300"
                    placeholder={t("shared.searchDot")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Link
                  to={UrlUtils.currentTenantUrl(params, "settings/tenant-relationships/new")}
                  className="truncate inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 lg:-ml-0.5 h-5 w-5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <div className="truncate">{t("app.tenantRelationships.new")}</div>
                </Link>
              </div>
            </div>

            <TenantRelationshipsTable items={filteredItems()} />
          </div>
        </div>
      </div>
    </div>
  );
}
