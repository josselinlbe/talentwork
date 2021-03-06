import { Entity } from "@prisma/client";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Constants from "~/application/Constants";
import EntityForm from "~/components/entities/EntityForm";
import { i18nHelper } from "~/locale/i18n.utils";
import { useAdminData } from "~/utils/data/useAdminData";
import { updateEntity, deleteEntity, getEntityBySlug, getEntityById } from "~/utils/db/entities/entities.db.server";
import { createEntityPermissions, deleteEntityPermissions } from "~/utils/db/permissions/permissions.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";

type LoaderData = {
  item: Entity;
};
export let loader: LoaderFunction = async ({ params }) => {
  const item = await getEntityBySlug(params.slug ?? "");
  if (!item) {
    return redirect("/admin/entities");
  }

  const data: LoaderData = {
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await i18nHelper(request);

  const item = await getEntityBySlug(params.slug ?? "");
  if (!item) {
    return redirect("/admin/entities");
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString().toLowerCase() ?? "";
    const order = Number(form.get("order"));
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

    const errors = await EntityHelper.validateEntity(name, slug, order, prefix, item);
    if (errors.length > 0) {
      return badRequest({ error: errors.join(", ") });
    }

    try {
      await updateEntity(item.id ?? "", {
        name,
        slug,
        order,
        prefix,
        title,
        titlePlural,
        isFeature,
        isAutogenerated,
        hasApi,
        requiresLinkedAccounts,
        icon,
        active,
        isDefault: item.isDefault,
        hasTags,
        hasComments,
        hasTasks,
        hasWorkflow,
        defaultVisibility,
      });
      if (item.name !== name) {
        await deleteEntityPermissions(item);
        const updatedEntity = await getEntityById(item.id);
        if (updatedEntity) {
          await createEntityPermissions(updatedEntity);
        }
      }

      return redirect("/admin/entities");
    } catch (e) {
      return badRequest({ error: JSON.stringify(e) });
    }
  } else if (action === "delete") {
    try {
      if (item.isDefault) {
        return badRequest({ error: "Default entities cannot be deleted" });
      }
      await deleteEntityPermissions(item);
      await deleteEntity(item.id ?? "");
      return redirect("/admin/entities");
    } catch (e) {
      return badRequest({ error: JSON.stringify(e) });
    }
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export default function EditEntityIndexRoute() {
  const data = useLoaderData<LoaderData>();
  const adminData = useAdminData();
  return <EntityForm canDelete={!data.item.isDefault && adminData.permissions.includes("admin.entities.delete")} item={data.item} />;
}
