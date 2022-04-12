import { useTranslation } from "react-i18next";
import { Tenant } from ".prisma/client";
import { TenantSubscriptionWithDetails } from "~/utils/db/tenantSubscriptions.db.server";
import clsx from "clsx";
import { FormEvent, useEffect, useRef, useState } from "react";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useActionData, useSubmit, useTransition } from "remix";

interface Props {
  tenant: Tenant;
  subscription: TenantSubscriptionWithDetails | null;
}

export default function TenantSubscription({ tenant, subscription }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "submitting";
  const actiondata = useActionData();

  const inputMaxWorkspaces = useRef<HTMLInputElement>(null);
  const confirmSave = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [maxWorkspaces, setMaxWorkspaces] = useState(0);
  const [maxUsers, setMaxUsers] = useState(0);
  const [maxLinks, setMaxLinks] = useState(0);
  const [maxStorage, setMaxStorage] = useState(0);
  const [monthlyContracts, setMonthlyContracts] = useState(0);

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [actiondata]);

  useEffect(() => {
    loadSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadSubscription() {
    setMaxWorkspaces(subscription?.maxWorkspaces ?? 0);
    setMaxUsers(subscription?.maxUsers ?? 0);
    setMaxLinks(subscription?.maxLinks ?? 0);
    setMaxStorage(subscription?.maxStorage ?? 0);
    setMonthlyContracts(subscription?.monthlyContracts ?? 0);
  }

  function edit() {
    setEditing(true);
    setTimeout(() => {
      inputMaxWorkspaces.current?.focus();
      inputMaxWorkspaces.current?.select();
    }, 0);
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (thereAreNoChanges()) {
      errorModal.current?.show(t("shared.error"), t("shared.noChanges"));
    } else {
      confirmSave.current?.show(t("shared.saveChanges"), t("shared.yes"), t("shared.cancel"));
    }
  }
  const thereAreNoChanges = () => {
    return (
      maxWorkspaces === subscription?.maxWorkspaces &&
      maxUsers === subscription?.maxUsers &&
      maxLinks === subscription?.maxLinks &&
      maxStorage === subscription?.maxStorage &&
      monthlyContracts === subscription?.monthlyContracts
    );
  };
  function saveConfirm() {
    const form = new FormData();
    form.set("max-workspaces", maxWorkspaces.toString());
    form.set("max-users", maxUsers.toString());
    form.set("max-links", maxLinks.toString());
    form.set("max-storage", maxStorage.toString());
    form.set("monthly-contracts", monthlyContracts.toString());
    submit(form, {
      method: "post",
    });
  }
  function cancel() {
    loadSubscription();
    setEditing(false);
  }

  return (
    <div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div className="relative min-h-screen">
            <main className="py-4">
              <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl">
                <div className="flex items-center space-x-5 truncate">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <span className="inline-block h-14 w-14 rounded-full overflow-hidden bg-gray-100">
                        {tenant?.icon ? (
                          <img className="inline-block h-14 w-14 rounded-full shadow-sm" src={tenant?.icon} alt="Tenant icon" />
                        ) : (
                          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="truncate">
                    <div className="">
                      <h1 className="text-lg font-bold text-gray-900">{tenant.name}</h1>
                      <div>
                        <p className="text-sm font-medium text-gray-500 truncate">
                          Subscription:{" "}
                          {subscription?.subscriptionPrice ? (
                            <span>{subscription?.subscriptionPrice?.subscriptionProduct.title} </span>
                          ) : (
                            <span>Not subscribed</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                  <ButtonSecondary onClick={edit}>{t("shared.edit")}</ButtonSecondary>
                </div>
              </div>

              <div className="mt-2 max-w-3xl mx-auto lg:max-w-7xl">
                <div>
                  <div className="lg:grid lg:grid-cols-1 lg:gap-6">
                    <div className="mt-5 lg:mt-0 lg:col-span-2">
                      <form onSubmit={save} method="POST">
                        <div className="shadow overflow-hidden sm:rounded-md">
                          <div className="px-4 py-5 bg-white sm:p-6">
                            <div className="grid grid-cols-6 gap-6">
                              <div className="col-span-6 lg:col-span-3">
                                <label htmlFor="stripe-customer-id" className="block text-sm font-medium text-gray-700">
                                  Stripe customer ID
                                </label>
                                <input
                                  type="text"
                                  name="stripe-customer-id"
                                  id="stripe-customer-id"
                                  value={subscription?.stripeCustomerId ?? ""}
                                  readOnly={true}
                                  required
                                  disabled={true}
                                  className={clsx(
                                    "bg-gray-100 mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  )}
                                />
                              </div>

                              <div className="col-span-6 lg:col-span-3">
                                <label htmlFor="stripe-subscription-id" className="block text-sm font-medium text-gray-700">
                                  Stripe subscription ID
                                </label>
                                <input
                                  type="text"
                                  name="stripe-subscription-id"
                                  id="stripe-subscription-id"
                                  value={subscription?.stripeSubscriptionId ?? ""}
                                  readOnly={true}
                                  required
                                  disabled={true}
                                  className={clsx(
                                    "bg-gray-100 mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  )}
                                />
                              </div>

                              <div className="col-span-6 lg:col-span-3">
                                <label htmlFor="max-workspaces" className="block text-sm font-medium text-gray-700">
                                  Max workspaces
                                </label>
                                <input
                                  ref={inputMaxWorkspaces}
                                  type="number"
                                  min={0}
                                  name="max-workspaces"
                                  id="max-workspaces"
                                  autoComplete="max-workspaces"
                                  value={maxWorkspaces}
                                  onChange={(e) => setMaxWorkspaces(Number(e.target.value))}
                                  required
                                  disabled={!editing}
                                  className={clsx(
                                    "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                    !editing && "bg-gray-100"
                                  )}
                                />
                              </div>

                              <div className="col-span-6 lg:col-span-3">
                                <label htmlFor="max-users" className="block text-sm font-medium text-gray-700">
                                  Max users
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  name="max-users"
                                  id="max-users"
                                  autoComplete="max-users"
                                  value={maxUsers}
                                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                                  required
                                  disabled={!editing}
                                  className={clsx(
                                    "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                    !editing && "bg-gray-100"
                                  )}
                                />
                              </div>
                              <div className="col-span-6 lg:col-span-3">
                                <label htmlFor="max-links" className="block text-sm font-medium text-gray-700">
                                  Max links
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  name="max-links"
                                  id="max-links"
                                  autoComplete="max-links"
                                  value={maxLinks}
                                  onChange={(e) => setMaxLinks(Number(e.target.value))}
                                  required
                                  disabled={!editing}
                                  className={clsx(
                                    "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                    !editing && "bg-gray-100"
                                  )}
                                />
                              </div>
                              <div className="col-span-6 lg:col-span-3">
                                <label htmlFor="max-workspaces" className="block text-sm font-medium text-gray-700">
                                  Max storage
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  name="max-storage"
                                  id="max-storage"
                                  autoComplete="max-storage"
                                  value={maxStorage}
                                  onChange={(e) => setMaxStorage(Number(e.target.value))}
                                  required
                                  disabled={!editing}
                                  className={clsx(
                                    "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                    !editing && "bg-gray-100"
                                  )}
                                />
                              </div>
                              <div className="col-span-6 lg:col-span-3">
                                <label htmlFor="monthly-contracts" className="block text-sm font-medium text-gray-700">
                                  Monthly contracts
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  name="monthly-contracts"
                                  id="monthly-contracts"
                                  autoComplete="monthly-contracts"
                                  value={monthlyContracts}
                                  onChange={(e) => setMonthlyContracts(Number(e.target.value))}
                                  required
                                  disabled={!editing}
                                  className={clsx(
                                    "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                    !editing && "bg-gray-100"
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          {editing && (
                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end">
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={cancel}
                                  disabled={!editing || loading}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                                >
                                  {t("shared.cancel")}
                                </button>
                                <button
                                  type="submit"
                                  disabled={!editing || thereAreNoChanges() || loading}
                                  className={clsx(
                                    "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                                    !editing || (thereAreNoChanges() && " opacity-50 cursor-not-allowed"),
                                    loading && " opacity-80 cursor-not-allowed"
                                  )}
                                >
                                  {t("shared.save")}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmSave} onYes={saveConfirm} />
    </div>
  );
}
