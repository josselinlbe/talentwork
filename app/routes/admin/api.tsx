import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, Outlet, redirect, useLocation, useNavigate } from "remix";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";

export let loader: LoaderFunction = async ({ request }) => {
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === "/admin/api") {
    return redirect("/admin/api/keys");
  }
  return json({});
};

export default function AdminApiRoute() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/api") {
      navigate("/admin/api/keys");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <IndexPageLayout
      title="API"
      tabs={[
        {
          name: t("models.apiKey.plural"),
          routePath: "/admin/api/keys",
        },
        {
          name: t("models.apiKey.logs"),
          routePath: "/admin/api/logs",
        },
      ]}
    >
      <Outlet />
    </IndexPageLayout>
  );
}
