import { Params } from "react-router";
import { useMatches } from "remix";
import UrlUtils from "../app/UrlUtils";
import { getWorkspaces } from "../db/workspaces.db.server";

export type MembersLoaderData = {
  users: Awaited<ReturnType<typeof getWorkspaces>>;
};

export function useMembersData(params: Params): MembersLoaderData {
  return (useMatches().find((f) => f.pathname === UrlUtils.currentTenantUrl(params, "settings/members"))?.data ?? {}) as MembersLoaderData;
}
