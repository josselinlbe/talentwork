import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import EntityForm from "~/components/entities/EntityForm";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import { i18nHelper } from "~/locale/i18n.utils";
import { createEntity } from "~/utils/db/entities/entities.db.server";
import { createEntityPermissions } from "~/utils/db/permissions/permissions.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import Constants from "~/application/Constants";

export let loader: LoaderFunction = async ({ request }) => {
  await verifyUserHasPermission(request, "admin.entities.create");
  return json({});
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString().toLowerCase() ?? "";
    // const order = Number(form.get("order"));
    const prefix = form.get("prefix")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const titlePlural = form.get("title-plural")?.toString() ?? "";
    const isFeature = Boolean(form.get("is-feature"));
    const isAutogenerated = Boolean(form.get("is-autogenerated"));
    const hasApi = Boolean(form.get("has-api"));
    const requiresLinkedAccounts = Boolean(form.get("requires-account-link"));
    const icon = form.get("icon")?.toString() ?? "";
    const active = Boolean(form.get("active"));

    const hasTags = Boolean(form.get("has-tags"));
    const hasComments = Boolean(form.get("has-comments"));
    const hasTasks = Boolean(form.get("has-tasks"));
    const hasWorkflow = Boolean(form.get("has-workflow"));

    const defaultVisibility = form.get("default-visibility")?.toString() ?? Constants.DEFAULT_ROW_VISIBILITY;

    const errors = await EntityHelper.validateEntity(name, slug, null, prefix);
    if (errors.length > 0) {
      return badRequest({ error: errors.join(", ") });
    }
    try {
      const entity = await createEntity({
        name,
        slug,
        prefix,
        title,
        titlePlural,
        isFeature,
        isAutogenerated,
        hasApi,
        requiresLinkedAccounts,
        icon,
        active,
        isDefault: false,
        hasTags,
        hasComments,
        hasTasks,
        hasWorkflow,
        defaultVisibility,
      });

      await createEntityPermissions(entity);

      if (entity) {
        return redirect(`/admin/entities/${slug}/properties`);
      } else {
        return badRequest({ error: "Could not create entity" });
      }
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function NewBlog() {
  const { t } = useTranslation();
  return (
    <NewPageLayout
      title={`${t("shared.new")} ${t("models.entity.object")}`}
      menu={[
        { title: t("models.entity.plural"), routePath: "/admin/entities" },
        { title: t("shared.new"), routePath: "/admin/entities/new" },
      ]}
    >
      <EntityForm />
    </NewPageLayout>
  );
}
