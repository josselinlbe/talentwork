import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { actionRowTags } from "~/modules/rows/actions/row-tags";
import { loaderRowTags } from "~/modules/rows/loaders/row-tags";
import RowTagsRoute from "~/modules/rows/routes/RowTagsRoute";

export let loader: LoaderFunction = async ({ request, params }) => {
  return json(await loaderRowTags(request, params, null, "deals"));
};

export const action: ActionFunction = async ({ request, params }) => {
  return await actionRowTags(request, params, null, "deals");
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default RowTagsRoute;
