import { json, LoaderFunction, MetaFunction, Outlet, useLocation, useNavigate } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useEffect } from "react";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";

type LoaderData = {
  title: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const data: LoaderData = {
    title: `${t("models.email.plural")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminEmailsRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(location.pathname) === "/admin/email") {
      navigate("/admin/email/inbound");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div>
      <IndexPageLayout
        title={t("models.email.plural")}
        tabs={[
          {
            name: "Inbound",
            routePath: "inbound",
          },
        ]}
        buttons={
          <>
            <ButtonSecondary to=".">
              <span>{t("shared.reload")}</span>
            </ButtonSecondary>
          </>
        }
      >
        <Outlet />
      </IndexPageLayout>
    </div>
  );
}
