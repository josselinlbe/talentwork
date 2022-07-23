import { useEffect } from "react";
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import UrlUtils from "~/utils/app/UrlUtils";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.apiKeys.view");
  if (UrlUtils.stripTrailingSlash(new URL(request.url).pathname) === "/admin/api") {
    return redirect("/admin/api/keys");
  }

  return json({
    title: `API | ${process.env.APP_NAME}`,
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminApiRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/api") {
      navigate("/admin/api/keys");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <Outlet />;
}
