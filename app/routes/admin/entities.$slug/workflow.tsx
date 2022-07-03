import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useLocation, useNavigate, useParams } from "@remix-run/react";
import Tabs from "~/components/ui/tabs/Tabs";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  title: string;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);
  const entity = await getEntityBySlug(params.slug ?? "");
  if (!entity) {
    return redirect("/admin/entities");
  }
  const data: LoaderData = {
    title: `${t(entity.title)} ${t("models.workflowState.plural")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export default function EntityWorkflowRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === `/admin/entities/${params.slug}/workflow`) {
      navigate(`/admin/entities/${params.slug}/workflow/states`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div>
      <Tabs
        breakpoint="sm"
        tabs={[
          {
            name: t("models.workflowState.plural"),
            routePath: "states",
          },
          {
            name: t("models.workflowStep.plural"),
            routePath: "steps",
          },
        ]}
      />
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
