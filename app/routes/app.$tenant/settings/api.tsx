import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useLocation, useNavigate, useParams } from "@remix-run/react";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { getTenantUrl } from "~/utils/services/urlService";

export let loader: LoaderFunction = async ({ request, params }) => {
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.settings.apiKeys.view", tenantUrl.tenantId);
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === UrlUtils.currentTenantUrl(params, "settings/api")) {
    return redirect(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
  }
  return json({});
};

export default function ApiRoute() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === UrlUtils.currentTenantUrl(params, "settings/api")) {
      navigate(UrlUtils.currentTenantUrl(params, "settings/api/keys"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <IndexPageLayout
      tabs={[
        {
          name: t("models.apiKey.plural"),
          routePath: UrlUtils.currentTenantUrl(params, "settings/api/keys"),
        },
        {
          name: t("models.apiKey.logs"),
          routePath: UrlUtils.currentTenantUrl(params, "settings/api/logs"),
        },
      ]}
    >
      <Outlet />
    </IndexPageLayout>
  );
}
