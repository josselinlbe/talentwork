import { RowPermission } from "@prisma/client";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { ActionFunction, Form, json, LoaderFunction, redirect, useLoaderData, useNavigate, useParams } from "remix";
import UserBadge from "~/components/core/users/UserBadge";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import ClipboardIcon from "~/components/ui/icons/ClipboardIcon";
import ShareIcon from "~/components/ui/icons/ShareIcon";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";
import OpenModal from "~/components/ui/modals/OpenModal";
import { i18nHelper } from "~/locale/i18n.utils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppData } from "~/utils/data/useAppData";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { getRow, setRowPermissions } from "~/utils/db/entities/rows.db.server";
import { createLog } from "~/utils/db/logs.db.server";
import { getGroups, GroupWithDetails } from "~/utils/db/permissions/groups.db.server";
import { createRowPermission, deleteRowPermission, getRowPermissions } from "~/utils/db/permissions/rowPermissions.db.server";
import { TenantUserWithUser, getTenantUsers, getTenant } from "~/utils/db/tenants.db.server";
import { getUsersById } from "~/utils/db/users.db.server";
import { verifyUserHasPermission, getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import { getTenantUrl } from "~/utils/services/urlService";
import { getUserInfo } from "~/utils/session.server";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  item: any;
  rowPermissions: RowPermission[];
  tenantUsers: TenantUserWithUser[];
  publicUrl: string;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  await verifyUserHasPermission(request, getEntityPermission(entity, "read"), tenantUrl.tenantId);

  const item = await getRow(entity.id, params.id ?? "", tenantUrl.tenantId);
  if (!item) {
    return redirect(`/app/${params.tenant}/${entity.slug}`);
  }
  if (item.createdByUserId && item.createdByUserId !== userInfo.userId) {
    return redirect(`/app/${params.tenant}/${entity.slug}/${item.id}`);
  }
  const data: LoaderData = {
    title: `${t("shared.share")} ${t(entity.title)} | ${process.env.APP_NAME}`,
    entity,
    item,
    tenantUsers: await getTenantUsers(tenantUrl.tenantId),
    rowPermissions: await getRowPermissions(item.id),
    publicUrl: `${process.env.SERVER_URL}/public/${entity.slug}/${item.id}`,
  };
  return json(data);
};

export type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const entity = await getEntityBySlug(params.entity ?? "");
  if (!entity) {
    return redirect("/app/" + tenantUrl.tenantId);
  }
  const item = await getRow(entity.id, params.id ?? "", tenantUrl.tenantId);
  if (!item) {
    return redirect(`/app/${params.tenant}/${entity.slug}`);
  }

  const form = await request.formData();
  const visibility = form.get("visibility")?.toString() ?? "";
  let canComment = Boolean(form.get("can-comment"));
  let canUpdate = Boolean(form.get("can-update"));
  let canDelete = Boolean(form.get("can-delete"));

  const userIds = form.getAll("users[]").map((f) => f.toString());
  const groupIds = form.getAll("groups[]").map((f) => f.toString());

  await deleteRowPermission(params.id ?? "");
  if (visibility === "private") {
    canComment = canUpdate = canDelete = true;
  }
  await setRowPermissions(item.id, {
    visibility,
    canComment,
    canUpdate,
    canDelete,
  });
  if (visibility === "public") {
    createLog(request, tenantUrl, "Shared to: Public", "");
  } else if (visibility === "tenant") {
    await createRowPermission({
      rowId: item.id,
      tenantId: tenantUrl.tenantId,
    });
    const tenant = await getTenant(tenantUrl.tenantId);
    createLog(request, tenantUrl, "Shared to: Tenant", tenant?.name ?? tenantUrl.tenantId);
  } else if (visibility === "groups") {
    const groups = await getGroups(tenantUrl.tenantId, groupIds);
    groups.map(async (group) => {
      await createRowPermission({
        rowId: item.id,
        groupId: group.id,
      });
    });
    createLog(request, tenantUrl, "Shared to: Groups", groups.map((f) => f.name).join(", "));
  } else if (visibility === "users") {
    const users = await getUsersById(userIds);
    users.map(async (user) => {
      await createRowPermission({
        rowId: item.id,
        userId: user.id,
      });
    });
    createLog(request, tenantUrl, "Shared to: Users", users.map((f) => f.email).join(", "));
  } else if (visibility === "private") {
    createLog(request, tenantUrl, "Set Private", "");
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }

  return redirect(`/app/${params.tenant}/${entity.slug}/${item.id}`);
};

export default function ShareRowRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const data = useLoaderData<LoaderData>();
  const appData = useAppData();

  const [visibility, setVisibility] = useState<string | number | undefined>("private");
  const [groups, setGroups] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [canComment, setCanComment] = useState(true);
  const [canUpdate, setCanUpdate] = useState(true);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const groups: string[] = [];
    const users: string[] = [];
    data.rowPermissions.forEach((permission) => {
      if (permission.groupId && !groups.includes(permission.groupId)) {
        groups.push(permission.groupId);
      }
      if (permission.userId && !users.includes(permission.userId)) {
        users.push(permission.userId);
      }
    });
    setGroups(groups);
    setUsers(users);

    setVisibility(data.item?.visibility ?? "private");
    setCanComment(data.item?.canComment ?? true);
    setCanUpdate(data.item?.canUpdate ?? false);
    setCanDelete(data.item?.canDelete ?? false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setGroup(group: GroupWithDetails, add: any) {
    if (add) {
      setGroups([...groups, group.id]);
    } else {
      setGroups(groups.filter((f) => f !== group.id));
    }
  }
  function setUser(tenantUser: TenantUserWithUser, add: any) {
    if (add) {
      setUsers([...users, tenantUser.userId]);
    } else {
      setUsers(users.filter((f) => f !== tenantUser.userId));
    }
  }

  function canSave() {
    if (visibility === "groups" && groups.length === 0) {
      return false;
    } else if (visibility === "users" && users.length === 0) {
      return false;
    }
    return true;
  }

  return (
    <div>
      <OpenModal className="sm:max-w-md" onClose={() => navigate(UrlUtils.currentTenantUrl(params, `${data.entity.slug}/${data.item.id}`))}>
        <Form method="post" className="space-y-2">
          <div>
            <InputSelect
              name="visibility"
              title={`Share this ${t(data.entity.title)}`}
              value={visibility}
              setValue={setVisibility}
              options={[
                {
                  name: "Only you",
                  value: "private",
                },
                {
                  name: `Everyone at ${appData.currentTenant.name}`,
                  value: "tenant",
                },
                {
                  name: `Specific groups`,
                  value: "groups",
                },
                {
                  name: `Specific users`,
                  value: "users",
                },
                {
                  name: `Public`,
                  value: "public",
                },
              ]}
            />
          </div>

          {visibility === "groups" && (
            <>
              {/* <div className="flex items-center space-x-2 justify-between">
                <ButtonTertiary>
                  {t("shared.new")} {t("models.group.object").toLowerCase()}
                </ButtonTertiary>
              </div> */}
              <div className="p-2 bg-white border border-gray-300 border-dashed">
                {groups.map((group) => {
                  return <input key={group} type="hidden" name="groups[]" value={group} />;
                })}

                {appData.myGroups.length === 0 ? (
                  <div className="text-gray-600 text-sm flex justify-center pt-2">
                    <div className="text-center">
                      <div>You don't belong to any group</div>
                      <div>
                        <ButtonTertiary to={UrlUtils.currentTenantUrl(params, `settings/groups/new`)}>Create group</ButtonTertiary>
                      </div>
                    </div>
                  </div>
                ) : (
                  appData.myGroups.map((group) => {
                    return (
                      <InputCheckboxWithDescription
                        key={group.id}
                        name={group.name}
                        title={group.name}
                        description={
                          <div className="">
                            <div className="text-gray-700">{group.description}</div>
                            <div className="truncate text-xs text-gray-500">
                              {group.users.map((f) => `${f.user.firstName} ${f.user.lastName} (${f.user.email})`).join(", ")}
                            </div>
                          </div>
                        }
                        value={groups.includes(group.id)}
                        setValue={(e) => setGroup(group, e)}
                        // setValue={(e) => setUser(user, e)}
                      />
                    );
                  })
                )}
              </div>
            </>
          )}

          {visibility === "users" && (
            <>
              <div className="p-2 bg-white border border-gray-300 border-dashed">
                {users.map((user) => {
                  return <input key={user} type="hidden" name="users[]" value={user} />;
                })}
                {data.tenantUsers.map((tenantUser) => {
                  return (
                    <div key={tenantUser.id}>
                      <InputCheckboxWithDescription
                        name={tenantUser.userId}
                        title={<UserBadge item={tenantUser.user} withEmail={false} />}
                        description={tenantUser.user.email}
                        value={users.includes(tenantUser.userId)}
                        setValue={(e) => setUser(tenantUser, e)}
                        // setValue={(e) => setUser(user, e)}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {visibility === "public" && (
            <div className="flex items-center space-x-2">
              <InputText className="flex-grow" disabled={true} name="" title="Public URL" withLabel={false} value={data.publicUrl} />
              <ButtonSecondary
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(data.publicUrl);
                }}
              >
                <ClipboardIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span>{t("shared.copy")}</span>
              </ButtonSecondary>
            </div>
          )}

          {visibility !== "private" && (
            <>
              <InputCheckboxInline name="can-comment" title="Can comment" value={canComment} />

              <InputCheckboxInline name="can-update" title="Can update" value={canUpdate} />

              <InputCheckboxInline name="can-delete" title="Can delete" value={canDelete} />
            </>
          )}

          <div>
            <LoadingButton disabled={!canSave()} type="submit" className="w-full text-center flex justify-center">
              {visibility === "private" ? (
                <div className="flex items-center space-x-2">
                  <div>{t("shared.save")}</div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div>{t("shared.share")}</div>
                  <ShareIcon className="h-4 w-4" />
                </div>
              )}
            </LoadingButton>
          </div>
        </Form>
      </OpenModal>
    </div>
  );
}
