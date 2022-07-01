import { ActionFunction, Form, LoaderFunction, MetaFunction, redirect, useActionData, useNavigate } from "remix";
import { json, useLoaderData } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getUserInfo } from "~/utils/session.server";
import { createRow, getRow } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { createRowLog } from "~/utils/db/logs.db.server";
import OpenModal from "~/components/ui/modals/OpenModal";
import InputText from "~/components/ui/input/InputText";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputSelector from "~/components/ui/input/InputSelector";
import { getMyTenants, MyTenant } from "~/utils/db/tenants.db.server";
import { useEffect, useState } from "react";
import { getUser } from "~/utils/db/users.db.server";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  myTenants: MyTenant[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user) {
    throw redirect(`/login?redirect=roadmap/new`);
  }

  const myTenants = await getMyTenants(userInfo.userId);

  const entity = await getEntityBySlug("roadmap");
  if (!entity) {
    return redirect("/roadmap");
  }
  const data: LoaderData = {
    title: `${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    myTenants,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const userInfo = await getUserInfo(request);

  const entity = await getEntityBySlug("roadmap");
  if (!entity) {
    return badRequest({ error: "Invalid entity: " + params.entity });
  }

  const form = await request.formData();
  const tenantId = form.get("tenant")?.toString();
  if (!tenantId) {
    return badRequest({ error: "Select a valid account" });
  }

  try {
    form.set("status", "Under Review");
    const rowValues = RowHelper.getRowPropertiesFromForm(entity, form);
    const created = await createRow({
      entityId: entity.id,
      tenantId: tenantId,
      createdByUserId: userInfo.userId,
      linkedAccountId: rowValues.linkedAccountId,
      dynamicProperties: rowValues.dynamicProperties,
      dynamicRows: rowValues.dynamicRows,
      properties: rowValues.properties,
    });
    const item = await getRow(entity.id, created.id, tenantId);
    await createRowLog(request, { tenantId: tenantId, createdByUserId: userInfo.userId, action: DefaultLogActions.Created, entity, item });

    return redirect(`/roadmap`);
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function RowsListRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<string | number | undefined>();

  useEffect(() => {
    if (data.myTenants.length > 0) {
      setTenant(data.myTenants[0].tenantId);
    }
  }, [data.myTenants]);

  return (
    <OpenModal className="sm:max-w-xl" onClose={() => navigate(`/${data.entity.slug}`)}>
      <Form method="post" className="grid gap-3">
        <div className="font-bold text-lg">New Feature Request</div>
        <InputSelector
          name="tenant"
          title="Account"
          value={tenant}
          setValue={setTenant}
          options={data.myTenants.map((tenant) => {
            return {
              name: tenant.tenant.name,
              value: tenant.tenantId,
            };
          })}
        />
        <InputText name="title" title="Title" required />
        <InputText name="description" title="Description" rows={5} />
        <div className="flex justify-between items-baseline">
          <div>{actionData?.error && <div className="text-red-500 text-sm">{actionData.error}</div>}</div>
          <ButtonPrimary type="submit">Submit</ButtonPrimary>
        </div>
      </Form>
    </OpenModal>
  );
}
