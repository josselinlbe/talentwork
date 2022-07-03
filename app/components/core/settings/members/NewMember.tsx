import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { useRef, useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Form, useActionData, useLocation, useNavigate, useParams, useTransition } from "@remix-run/react";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { NewMemberActionData } from "~/routes/app.$tenant/settings/members/new";
import UrlUtils from "~/utils/app/UrlUtils";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import CheckPlanFeatureLimit from "../subscription/CheckPlanFeatureLimit";

interface Props {
  featurePlanUsage: PlanFeatureUsageDto | undefined;
}

export default function NewMember({ featurePlanUsage }: Props) {
  const params = useParams();
  const location = useLocation();
  const actionData = useActionData<NewMemberActionData>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const transition = useTransition();

  const loading = transition.state === "submitting";

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const inputEmail = useRef<HTMLInputElement>(null);

  const [showing, setShowing] = useState(false);
  const [role, setRole] = useState<TenantUserType>(actionData?.fields?.role ?? TenantUserType.MEMBER);
  const roleOptions = [
    {
      value: 0,
      name: t("settings.profile.types.OWNER"),
      description: t("settings.profile.permissions.OWNER"),
    },
    {
      value: 1,
      name: t("settings.profile.types.ADMIN"),
      description: t("settings.profile.permissions.ADMIN"),
    },
    {
      value: 2,
      name: t("settings.profile.types.MEMBER"),
      description: t("settings.profile.permissions.MEMBER"),
    },
  ];

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  useEffect(() => {
    setShowing(true);
    // nextTick(() => {
    if (inputEmail.current) {
      inputEmail.current?.focus();
      inputEmail.current?.select();
    }
    // });
  }, []);

  function close() {
    if (location.pathname.startsWith("/app")) {
      navigate(UrlUtils.currentTenantUrl(params, "settings/members"), { replace: true });
    } else {
      navigate("/admin/members", { replace: true });
    }
  }
  function changedRole(e: any) {
    const _role: TenantUserType = Number(e.target.value);
    setRole(_role);
  }

  useEscapeKeypress(close);
  return (
    <div>
      <div>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
              </div>
            </Transition>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className="sm:max-w-lg inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left overflow-visible shadow-xl transform transition-all my-8 sm:align-middle w-full sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div className="just absolute top-0 right-0 -mt-4 pr-4">
                  <button
                    onClick={close}
                    type="button"
                    className="p-1 bg-white hover:bg-gray-200 border border-gray-200 rounded-full text-gray-600 justify-center flex items-center hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">{t("shared.close")}</span>
                    <svg
                      className="h-5 w-5 text-gray-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">{t("settings.members.actions.new")}</h4>
                  </div>
                  <CheckPlanFeatureLimit item={featurePlanUsage}>
                    <Form method="post" className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {/*Email */}
                        <div className="col-span-2">
                          <label htmlFor="email" className="block text-xs font-medium text-gray-700 truncate">
                            {t("models.user.email")}
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm w-full">
                            <input
                              type="email"
                              ref={inputEmail}
                              name="email"
                              id="email"
                              autoComplete="off"
                              required
                              defaultValue={actionData?.fields?.email}
                              disabled={loading}
                              className={clsx(
                                "lowercase w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                loading && "bg-gray-100 cursor-not-allowed"
                              )}
                            />
                          </div>
                        </div>
                        {/*Email: End */}

                        {/*User First Name */}
                        <div>
                          <label htmlFor="first-name" className="block text-xs font-medium text-gray-700 truncate">
                            {t("models.user.firstName")}
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm w-full">
                            <input
                              type="text"
                              id="first-name"
                              name="first-name"
                              autoComplete="off"
                              required
                              defaultValue={actionData?.fields?.firstName}
                              className={clsx(
                                "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                loading && "bg-gray-100 cursor-not-allowed"
                              )}
                            />
                          </div>
                        </div>
                        {/*User First Name: End */}

                        {/*User Last Name */}
                        <div>
                          <label htmlFor="last-name" className="block text-xs font-medium text-gray-700 truncate">
                            {t("models.user.lastName")}
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm w-full">
                            <input
                              type="text"
                              id="last-name"
                              name="last-name"
                              autoComplete="off"
                              required
                              defaultValue={actionData?.fields?.lastName}
                              className={clsx(
                                "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                loading && "bg-gray-100 cursor-not-allowed"
                              )}
                            />
                          </div>
                        </div>
                        {/*User Last Name: End */}

                        {/*User Role */}
                        <div className="col-span-2">
                          <label htmlFor="last-name" className="block text-xs font-medium text-gray-700 truncate">
                            {t("models.user.role")}
                          </label>
                          <div className="mt-1 rounded-md shadow-sm w-full">
                            <fieldset>
                              <legend className="sr-only">{t("models.user.role")}</legend>
                              <div className="bg-white rounded-md -space-y-px">
                                {roleOptions.map((option, idxRole) => {
                                  return (
                                    <label
                                      key={idxRole}
                                      className={clsx(
                                        "relative border py-2 px-4 flex cursor-pointer focus:outline-none",
                                        role === option.value && "bg-theme-50 border-theme-200 z-10",
                                        role !== option.value && "border-gray-200",
                                        idxRole === 0 && "rounded-tl-md rounded-tr-md",
                                        idxRole === roleOptions.length - 1 && "rounded-bl-md rounded-br-md"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name="tenant-user-type"
                                        className="h-4 w-4 mt-3 cursor-pointer text-theme-600 border-gray-300 focus:ring-theme-500"
                                        aria-labelledby="tenant-user-type-0-label"
                                        aria-describedby="tenant-user-type-0-description"
                                        value={option.value}
                                        checked={role === option.value}
                                        onChange={changedRole}
                                      />
                                      <div className="ml-3 flex flex-col">
                                        <span
                                          id="tenant-user-type-0-label"
                                          className={clsx(
                                            "block text-sm font-medium",
                                            role === option.value && "text-theme-900",
                                            role !== option.value && "text-gray-900"
                                          )}
                                        >
                                          {option.name}
                                        </span>

                                        <span
                                          id="tenant-user-type-0-description"
                                          className={clsx("block text-sm", role === option.value && "text-theme-700", role !== option.value && "text-gray-500")}
                                        >
                                          {option.description}
                                        </span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </fieldset>
                          </div>
                        </div>
                        {/*User Role: End */}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-theme-700 text-sm">{loading && <div>{t("shared.loading")}...</div>}</div>

                        <div className="flex items-center space-x-2">
                          <button
                            disabled={loading}
                            className={clsx(
                              "inline-flex items-center px-3 py-2 border space-x-2 border-gray-300 shadow-sm sm:text-sm font-medium sm:rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                              loading && "bg-gray-100 cursor-not-allowed"
                            )}
                            type="button"
                            onClick={close}
                          >
                            <div>{t("shared.cancel")}</div>
                          </button>
                          <button
                            disabled={loading}
                            className={clsx(
                              "inline-flex items-center px-3 py-2 border space-x-2 border-transparent shadow-sm sm:text-sm font-medium sm:rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                              loading && "opacity-50 cursor-not-allowed"
                            )}
                            type="submit"
                          >
                            <div>{t("shared.invite")}</div>
                          </button>
                        </div>
                      </div>
                    </Form>
                  </CheckPlanFeatureLimit>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <ErrorModal ref={errorModal} />
      <SuccessModal ref={successModal} onClosed={close} />
    </div>
  );
}
