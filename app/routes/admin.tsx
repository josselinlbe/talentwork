import { useEffect } from "react";
import { json, LoaderFunction, Outlet, useLocation, useNavigate } from "remix";
import AppLayout from "~/components/app/AppLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { loadAdminData } from "~/utils/data/useAdminData";

export let loader: LoaderFunction = async ({ request, params }) => {
  const data = await loadAdminData(request);
  return json(data);
};

export default function AdminRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin") {
      navigate("/admin/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <AppLayout layout="admin">
      <Outlet />
    </AppLayout>
  );
}
