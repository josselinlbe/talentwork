import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import UrlUtils from "~/utils/app/UrlUtils";
import { useEffect } from "react";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  const data: LoaderData = {
    title: `CRM | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminCrmRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/crm") {
      navigate("/admin/crm/contacts");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
