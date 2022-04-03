import { json, LoaderFunction, MetaFunction, useParams } from "remix";
import TenantProfile from "~/components/core/tenants/TenantProfile";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminTenantData } from "~/utils/data/useAdminTenantData";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const data: LoaderData = {
    title: `${t("admin.tenants.profile.title")} | ${process.env.APP_NAME}`,
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
