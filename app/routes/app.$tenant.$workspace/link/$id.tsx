import { useTranslation } from "react-i18next";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import LinkProfile from "~/components/app/links/all/LinkProfile";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useParams } from "remix";
import { deleteLink, getLink, LinkWithWorkspacesAndContracts } from "~/utils/db/links.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  title: string;
  item: LinkWithWorkspacesAndContracts | null;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const item = await getLink(params.id);
  const data: LoaderData = {
    title: `${t("app.links.actions.edit")} | ${process.env.APP_NAME}`,
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  if (!params.id) {
    return badRequest({ error: t("shared.notFound") });
  }
  const form = await request.formData();
  console.log({ form });
  const type = form.get("type")?.toString();
  if (type === "delete") {
    const existing = await getLink(params.id);
    if (!existing) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteLink(params.id);
    return redirect(UrlUtils.appUrl(params, "links/all"));
  }

  return badRequest({ error: "Form not submitted correctly." });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function EditLinkRoute() {
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <div>
      <Breadcrumb menu={[{ title: t("models.link.plural"), routePath: UrlUtils.appUrl(params, "links/all") }]} />
      {data.item && <LinkProfile item={data.item} />}
      <ErrorModal ref={errorModal} />
    </div>
  );
}
