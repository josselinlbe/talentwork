import { useEffect } from "react";
import { json, LoaderFunction, redirect, useLoaderData, useNavigate, useParams } from "remix";
import { getWorkspaces, WorkspaceWithUsers } from "~/utils/db/workspaces.db.server";
import { getTenantUrl } from "~/utils/services/urlService";

type LoaderData = {
  workspaces: WorkspaceWithUsers[];
};

export let loader: LoaderFunction = async ({ params }) => {
  const { tenant } = params;
  const tenantUrl = await getTenantUrl(params, false);
  const workspaces = await getWorkspaces(tenantUrl.tenantId);
  if (workspaces.length > 0) {
    return redirect(`/app/${tenant}/${workspaces[0].id}`);
  }
  const data: LoaderData = {
    workspaces,
  };
  return json(data);
};

export default function AppRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const data = useLoaderData<LoaderData>();

  useEffect(() => {
    if (data.workspaces.length > 0) {
      navigate(`/app/${params.tenant}/${data.workspaces[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Workspaces: {JSON.stringify(data.workspaces)}</div>;
}
