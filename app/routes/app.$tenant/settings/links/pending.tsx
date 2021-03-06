import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import DateUtils from "~/utils/shared/DateUtils";
import { useRef, useState, useEffect } from "react";
import { ActionFunction, json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { getLinkedAccounts, updateLinkedAccount, getLinkedAccount, LinkedAccountWithDetails } from "~/utils/db/linkedAccounts.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { loadAppData, useAppData } from "~/utils/data/useAppData";
import { sendEmail } from "~/utils/email.server";
import { getUser } from "~/utils/db/users.db.server";
import clsx from "clsx";
import { getTenantUrl } from "~/utils/services/urlService";
import { i18nHelper } from "~/locale/i18n.utils";

type LoaderData = {
  title: string;
  items: LinkedAccountWithDetails[];
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);

  const items = await getLinkedAccounts(tenantUrl.tenantId, LinkedAccountStatus.PENDING);
  const data: LoaderData = {
    title: `${t("app.linkedAccounts.pending.multiple")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  items?: LinkedAccountWithDetails[];
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const appData = await loadAppData(request, params);

  const form = await request.formData();
  const linkId = form.get("linked-account-id")?.toString();
  if (!linkId) {
    return badRequest({ error: "Invalid link" });
  }
  const link = await getLinkedAccount(linkId);
  const accepted = form.get("accepted")?.toString() === "true";

  if (!link) {
    return badRequest({
      error: "Link not found",
    });
  }

  const user = await getUser(link?.createdByUserId);
  if (!user) {
    return badRequest({
      error: "Invalid user",
    });
  }

  await updateLinkedAccount(linkId, {
    status: accepted ? LinkedAccountStatus.LINKED : LinkedAccountStatus.REJECTED,
  });

  if (accepted) {
    await sendEmail(user.email, "link-invitation-accepted", {
      action_url: process.env.SERVER_URL + `/app/settings/{:TODO_TENANT}/links`,
      name: user.firstName,
      user_invitee_name: appData.user?.firstName,
      user_invitee_email: appData.user?.email,
      tenant_invitee: appData.currentTenant?.name,
      action_text: "View tenant relationships",
    });
  } else {
    await sendEmail(user.email, "link-invitation-rejected", {
      action_url: process.env.SERVER_URL + `/app/{:TODO_TENANT}/settings/linked-accounts`,
      name: user.firstName,
      email: appData.user?.email,
      tenant: appData.currentTenant?.name,
      action_text: "View tenant relationships",
    });
  }

  const tenantUrl = await getTenantUrl(params);
  return json({
    items: await getLinkedAccounts(tenantUrl.tenantId, LinkedAccountStatus.PENDING),
  });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function PendingLinksRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const transition = useTransition();
  const loading = transition.state === "submitting";
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const modalReject = useRef<RefConfirmModal>(null);
  const modalAccept = useRef<RefConfirmModal>(null);

  const [items] = useState(actionData?.items ?? data.items);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function reject(item: LinkedAccountWithDetails) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalReject.current) {
      modalReject.current.setValue(item);
      modalReject.current.show(
        t("app.linkedAccounts.invitation.confirmReject"),
        t("shared.reject"),
        t("shared.back"),
        t("app.linkedAccounts.invitation.rejectWarning", [whoAmIName, inviterTenant(item).name])
      );
    }
  }
  function accept(item: LinkedAccountWithDetails) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalAccept.current) {
      modalAccept.current.setValue(item);
      modalAccept.current.show(
        t("app.linkedAccounts.invitation.confirmAccept", [whoAmIName]),
        t("shared.accept"),
        t("shared.back"),
        t("app.linkedAccounts.invitation.acceptWarning", [inviterTenant(item).name])
      );
    }
  }
  function accepted(item: LinkedAccountWithDetails) {
    item.status = 1;
    const form = new FormData();
    form.set("linked-account-id", item.id);
    form.set("accepted", "true");
    submit(form, {
      method: "post",
    });
  }
  function rejected(item: LinkedAccountWithDetails) {
    item.status = 2;
    const form = new FormData();
    form.set("linked-account-id", item.id);
    form.set("accepted", "false");
    submit(form, {
      method: "post",
    });
  }
  function whoAmI(item: LinkedAccountWithDetails) {
    if (appData.currentTenant?.id ?? "" === item.providerTenantId) {
      return 0;
    }
    return 1;
  }
  function inviterTenant(item: LinkedAccountWithDetails) {
    if (item.createdByTenantId === item.providerTenantId) {
      return item.providerTenant;
    }
    return item.clientTenant;
  }
  function dateAgo(value: Date) {
    return DateUtils.dateAgo(value);
  }

  return (
    <div className="max-w-lg mx-auto pb-12">
      <div>
        {(() => {
          if (items.length === 0) {
            return (
              <div>
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("app.linkedAccounts.pending.empty"),
                  }}
                />
              </div>
            );
          } else {
            return (
              <ul className="sm:grid grid-cols-1 gap-3">
                {items.map((item, idx) => {
                  return (
                    <li key={idx} className="col-span-1 bg-white rounded-sm shadow-md divide-y divide-gray-200 border-t sm:border border-gray-300">
                      <div className="w-full flex items-center justify-between p-6 space-x-6">
                        <div className="w-full space-y-2">
                          {item.createdByTenantId !== appData.currentTenant?.id && item.createdByUser && (
                            <div className="flex items-center justify-between space-x-3">
                              <p className="text-sm font-normal text-gray-700 border-b pb-3 mb-2 w-full">
                                {item.createdByUser.firstName} ({item.createdByUser.email}) {t("app.linkedAccounts.invitation.hasSentYou")}.
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between space-x-3">
                            <h3 className="text-gray-900 text-sm font-medium truncate">
                              {whoAmI(item) === 0 ? <span>{item.clientTenant.name}</span> : <span>{item.providerTenant.name}</span>}
                            </h3>
                            {(() => {
                              if (whoAmI(item) !== 0) {
                                return (
                                  <span className="flex-shrink-0 inline-block px-2 py-0.5 text-teal-800 text-sm font-medium bg-teal-100 rounded-sm border-teal-300">
                                    {t("models.provider.object")}
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="flex-shrink-0 inline-block px-2 py-0.5 text-purple-800 text-sm font-medium bg-purple-100 rounded-sm border-purple-300">
                                    {t("models.client.object")}
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          <div className="sm:flex sm:items-center sm:space-x-2 sm:justify-between text-gray-500 text-sm">
                            <p className="truncate">{whoAmI(item) === 0 ? <span>{item.clientTenant.name}</span> : <span>{item.providerTenant.name}</span>}</p>
                            {item.createdAt && <p className="font-light text-sm truncate">{dateAgo(item.createdAt)}</p>}
                          </div>
                        </div>
                      </div>
                      <div>
                        {(() => {
                          if (item.status === 0 && item.createdByTenantId !== appData.currentTenant?.id) {
                            return (
                              <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="w-0 flex-1 flex">
                                  <button
                                    type="button"
                                    onClick={() => reject(item)}
                                    disabled={loading}
                                    className={clsx(
                                      "relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-theme-500 focus:outline-none",
                                      loading && " opacity-80 cursor-not-allowed"
                                    )}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="ml-3">{t("shared.cancel")}</span>
                                  </button>
                                </div>
                                <div className="-ml-px w-0 flex-1 flex">
                                  <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => accept(item)}
                                    className={clsx(
                                      "relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-theme-500 focus:outline-none",
                                      loading && " opacity-80 cursor-not-allowed"
                                    )}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>

                                    {(() => {
                                      if (whoAmI(item) === 0) {
                                        return <span className="ml-3">{t("shared.accept")}</span>;
                                      } else {
                                        return <span className="ml-3">{t("shared.accept")}</span>;
                                      }
                                    })()}
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="w-full">
                                  {item.status === 0 && (
                                    <div className="bg-gray-100 w-full relative -mr-px flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="ml-3">{t("app.linkedAccounts.pending.invitationSent")}</span>
                                    </div>
                                  )}
                                  {(() => {
                                    if (item.status === 2) {
                                      <div className="w-full relative -mr-px flex-1 inline-flex items-center justify-center py-4 text-sm bg-red-50 text-red-700 font-medium border border-transparent rounded-bl-lg">
                                        <span className="ml-3">{t("shared.rejected")}</span>
                                      </div>;
                                    } else if (item.status === 1) {
                                      return (
                                        <div className="w-full relative flex-1 inline-flex items-center justify-center py-4 text-sm bg-teal-50 text-teal-700 font-medium border border-transparent rounded-br-lg">
                                          <span className="ml-3">{t("shared.accepted")}</span>
                                        </div>
                                      );
                                    } else {
                                      return <div></div>;
                                    }
                                  })()}
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          }
        })()}
      </div>
      <ConfirmModal ref={modalAccept} onYes={accepted} />
      <ConfirmModal ref={modalReject} onYes={rejected} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
