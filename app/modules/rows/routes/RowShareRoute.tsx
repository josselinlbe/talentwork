import { Role } from "@prisma/client";
import { t } from "i18next";
import { useState, useEffect } from "react";
import { Form, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { Visibility } from "~/application/dtos/shared/Visibility";
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
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { GroupWithDetails } from "~/utils/db/permissions/groups.db.server";
import { UserWithDetails } from "~/utils/db/users.db.server";
import VisibilityHelper from "~/utils/helpers/VisibilityHelper";
import { LoaderDataRowShare } from "../loaders/row-share";

export default function RowShareRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const data = useLoaderData<LoaderDataRowShare>();
  const appOrAdminData = useAppOrAdminData();

  const [visibility, setVisibility] = useState<string | number | undefined>("private");
  const [roles, setRoles] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [canComment, setCanComment] = useState(true);
  const [canUpdate, setCanUpdate] = useState(true);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const roles: string[] = [];
    const groups: string[] = [];
    const users: string[] = [];
    data.rowPermissions.forEach((permission) => {
      if (permission.roleId && !groups.includes(permission.roleId)) {
        roles.push(permission.roleId);
      }
      if (permission.groupId && !groups.includes(permission.groupId)) {
        groups.push(permission.groupId);
      }
      if (permission.userId && !users.includes(permission.userId)) {
        users.push(permission.userId);
      }
    });
    setRoles(roles);
    setGroups(groups);
    setUsers(users);

    setVisibility(data.item?.visibility ?? "private");
    setCanComment(data.item?.canComment ?? true);
    setCanUpdate(data.item?.canUpdate ?? false);
    setCanDelete(data.item?.canDelete ?? false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setRole(role: Role, add: any) {
    if (add) {
      setRoles([...roles, role.id]);
    } else {
      setRoles(roles.filter((f) => f !== role.id));
    }
  }
  function setGroup(group: GroupWithDetails, add: any) {
    if (add) {
      setGroups([...groups, group.id]);
    } else {
      setGroups(groups.filter((f) => f !== group.id));
    }
  }
  function setUser(user: UserWithDetails, add: any) {
    if (add) {
      setUsers([...users, user.id]);
    } else {
      setUsers(users.filter((f) => f !== user.id));
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
      <OpenModal className="sm:max-w-md" onClose={() => navigate(`${data.entityRowsRoute}/${data.item.id}`)}>
        <Form method="post" className="space-y-2">
          <div>
            <InputSelect
              name="visibility"
              title={`Share this ${t(data.entity.title)}`}
              value={visibility}
              setValue={setVisibility}
              options={[
                {
                  name: VisibilityHelper.getVisibilityTitle(t, Visibility.Private),
                  value: Visibility.Private,
                },
                {
                  name: VisibilityHelper.getVisibilityTitle(t, Visibility.Tenant),
                  value: Visibility.Tenant,
                },
                {
                  name: VisibilityHelper.getVisibilityTitle(t, Visibility.Roles),
                  value: Visibility.Roles,
                },
                {
                  name: VisibilityHelper.getVisibilityTitle(t, Visibility.Groups),
                  value: Visibility.Groups,
                  disabled: !params.tenant,
                },
                {
                  name: VisibilityHelper.getVisibilityTitle(t, Visibility.Users),
                  value: Visibility.Users,
                },
                {
                  name: VisibilityHelper.getVisibilityTitle(t, Visibility.Public),
                  value: Visibility.Public,
                },
              ]}
            />
          </div>

          {visibility === "roles" && (
            <>
              <div className="p-2 bg-white border border-gray-300 border-dashed">
                {roles.map((role) => {
                  return <input key={role} type="hidden" name="roles[]" value={role} />;
                })}

                {appOrAdminData.roles.length === 0 ? (
                  <div className="text-gray-600 text-sm flex justify-center pt-2">
                    <div className="text-center">
                      <div>There are no application roles</div>
                    </div>
                  </div>
                ) : (
                  appOrAdminData.allRoles.map((role) => {
                    return (
                      <InputCheckboxWithDescription
                        key={role.id}
                        name={role.name}
                        title={role.name}
                        description={
                          <div className="">
                            <div className="text-gray-700">{role.description}</div>
                            {/* <div className="truncate text-xs text-gray-500">
                              {role.users.map((f) => `${f.user.firstName} ${f.user.lastName} (${f.user.email})`).join(", ")}
                            </div> */}
                          </div>
                        }
                        value={roles.includes(role.id)}
                        setValue={(e) => setRole(role, e)}
                      />
                    );
                  })
                )}
              </div>
            </>
          )}

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

                {appOrAdminData.myGroups.length === 0 ? (
                  <div className="text-gray-600 text-sm flex justify-center pt-2">
                    <div className="text-center">
                      <div>You don't belong to any group</div>
                      <div>
                        <ButtonTertiary to={UrlUtils.currentTenantUrl(params, `settings/groups/new`)}>Create group</ButtonTertiary>
                      </div>
                    </div>
                  </div>
                ) : (
                  appOrAdminData.myGroups.map((group) => {
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
                {data.users.map((user) => {
                  return (
                    <div key={user.id}>
                      <InputCheckboxWithDescription
                        name={user.id}
                        title={<UserBadge item={user} withEmail={false} />}
                        description={user.email}
                        value={users.includes(user.id)}
                        setValue={(e) => setUser(user, e)}
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
