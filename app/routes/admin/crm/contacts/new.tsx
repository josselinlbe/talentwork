import { ActionFunction, json, LoaderFunction, MetaFunction, useLoaderData, useNavigate } from "remix";
import OpenModal from "~/components/ui/modals/OpenModal";
import { actionRowNew } from "~/modules/rows/actions/row-new";
import { LoaderDataRowNew, loaderRowNew } from "~/modules/rows/loaders/row-new";
import RowNewRoute from "~/modules/rows/routes/RowNewRoute";

export let loader: LoaderFunction = async ({ request, params }) => {
  return json(await loaderRowNew(request, params, null, "contacts", "/admin/crm/contacts"));
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionRowNew(request, params, null, "contacts", "/admin/crm/contacts");
};

export const meta: MetaFunction = ({ data }) => ({ title: data?.title });

export default function AdminNewContactRoute() {
  const data = useLoaderData<LoaderDataRowNew>();
  const navigate = useNavigate();
  return (
    <div>
      <OpenModal className="sm:max-w-xl" onClose={() => navigate(data.entityRowsRoute)}>
        <RowNewRoute className="" showBreadcrumb={false} />
      </OpenModal>
    </div>
  );
}
