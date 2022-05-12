import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, Outlet, redirect, useLocation, useNavigate, useParams } from "remix";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";

export let loader: LoaderFunction = async ({ request, params }) => {
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
