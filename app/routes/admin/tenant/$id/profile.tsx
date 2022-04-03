import { Tenant, TenantUser, User, Workspace } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, useLoaderData, useParams } from "remix";
import TenantProfile from "~/components/core/tenants/TenantProfile";
import { i18n } from "~/locale/i18n.server";
import { useAdminTenantData } from "~/utils/data/useAdminTenantData";
import { getTenant, getTenantWithUsersAndWorkspaces } from "~/utils/db/tenants.db.server";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let t = await i18n.getFixedT(request, "translations");
  const data: LoaderData = {
    title: `$${t("admin.tenants.profile.title")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function AdminTenantRoute() {
  const params = useParams();
  const adminTenantData = useAdminTenantData(params.id);
  return <> {adminTenantData.tenant && <TenantProfile tenant={adminTenantData.tenant} />}</>;
}
