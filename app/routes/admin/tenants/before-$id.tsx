import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { useTranslation } from "react-i18next";
import { LoaderFunction, MetaFunction, Outlet, useParams } from "remix";
import { loadAdminTenantData, useAdminTenantData } from "~/utils/data/useAdminTenantData";

export let loader: LoaderFunction = async ({ request, params }) => {
  return loadAdminTenantData(request, params.id);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminTenantRoute() {
  const { t } = useTranslation();
  const params = useParams();
  const adminTenantData = useAdminTenantData(params.id);

  return (
    <div>
      <Breadcrumb
        home="/admin/tenants"
        menu={[
          { title: t("models.tenant.plural"), routePath: "/admin/tenants" },
          { title: adminTenantData.tenant?.name ?? "", routePath: "/admin/tenant" + params.id },
        ]}
      ></Breadcrumb>
      {/* <div className="bg-white shadow-sm border-b border-gray-300 w-full py-3 px-8 h-13">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between">
          <Tabs tabs={tabs} className="flex-grow" />
        </div>
      </div> */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
