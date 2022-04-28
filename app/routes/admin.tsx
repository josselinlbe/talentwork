import { useCatch } from "@remix-run/react";
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
  }, [location.pathname]);
  return (
    <AppLayout layout="admin">
      <Outlet />
    </AppLayout>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>/Admin Server Error: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <div>/Admin Client Error: {caught.status}</div>;
}
