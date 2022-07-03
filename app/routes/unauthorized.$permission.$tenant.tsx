import { Permission } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Language } from "remix-i18next";
import Footer from "~/components/front/Footer";
import Logo from "~/components/front/Logo";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import RefreshIcon from "~/components/ui/icons/RefreshIcon";
import { i18nHelper } from "~/locale/i18n.utils";
import { getPermissionByName } from "~/utils/db/permissions/permissions.db.server";
import { getUserPermission } from "~/utils/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
  permission: Permission;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t, translations } = await i18nHelper(request);
  const permission = await getPermissionByName(params.permission ?? "");
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const redirectTo = searchParams.get("redirect")?.toString();
  if (redirectTo) {
    if (!permission) {
      return redirect(redirectTo);
    }
    const { userPermission } = await getUserPermission(request, permission.name, params.tenant);
    if (userPermission) {
      return redirect(redirectTo);
    }
  } else if (!permission) {
    return redirect("/404");
  }

  const data: LoaderData = {
    title: `${t("shared.unauthorized")} | ${process.env.APP_NAME}`,
    i18n: translations,
    permission,
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function Page401() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { permission } = useLoaderData<LoaderData>();
  return (
    <>
      <div className="">
        <div className="min-h-full pt-16 pb-12 flex flex-col">
          <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-shrink-0 flex justify-center">
              <Logo />
            </div>
            <div className="py-16">
              <div className="text-center">
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{t("shared.unauthorized")}</h1>
                <p className="mt-2 text-base text-gray-500">Contact your admin and verify your permissions.</p>
                <div className="mt-2 text-base text-left text-gray-500 w-96 mx-auto">
                  <div className="flex justify-start bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 space-y-2 p-4">
                    <div className="space-y-2">
                      <div className="font-bold">{permission.description}</div>
                      <div>
                        <span>Permission &rarr;</span> <span className=" font-light italic">{permission.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <ButtonTertiary type="button" onClick={() => navigate(-1)}>
                        <div> &larr;</div>
                        <div>Go back</div>
                      </ButtonTertiary>
                    </div>

                    <div>
                      <ButtonTertiary type="button" onClick={() => navigate(location)}>
                        <div>Re-check permission</div>
                        <RefreshIcon className="w-4 h-4" />
                      </ButtonTertiary>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
