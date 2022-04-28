import Logo from "~/components/front/Logo";
import LoadingButton, { RefLoadingButton } from "~/components/ui/buttons/LoadingButton";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import UserUtils from "~/utils/app/UserUtils";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { Tenant, TenantUserInvitation, User } from "@prisma/client";
import { LoaderFunction, json, ActionFunction, useLoaderData, Form, useActionData, MetaFunction } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserByEmail, register } from "~/utils/db/users.db.server";
import { sendEmail } from "~/utils/email.server";
import { getUserInvitation, updateUserInvitationPending } from "~/utils/db/tenantUserInvitations.db.server";
import { Language } from "remix-i18next";
import { createTenantUser } from "~/utils/db/tenants.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";

type LoaderData = {
  title: string;
  i18n: Record<string, Language>;
  invitation: (TenantUserInvitation & { tenant: Tenant }) | null;
  existingUser: User | null;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t, translations } = await i18nHelper(request);

  const invitation = await getUserInvitation(params.id ?? "");
  const existingUser = await getUserByEmail(invitation?.email);
  const data: LoaderData = {
    title: `${t("account.invitation.title")} | ${process.env.APP_NAME}`,
    i18n: translations,
    invitation,
    existingUser,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const password = form.get("password")?.toString() ?? "";
  const passwordConfirm = form.get("password-confirm")?.toString() ?? "";

  const invitation = await getUserInvitation(params.id ?? "");
  if (!invitation) {
    return badRequest({
      error: "Invalid invitation",
    });
  }

  let existingUser = await getUserByEmail(invitation.email);
  if (!existingUser) {
    // Register user
    const passwordError = UserUtils.validatePassword(password) || UserUtils.validatePasswords(password, passwordConfirm);
    if (passwordError) {
      return badRequest({ error: passwordError });
    }

    const user = await register(invitation.email, password, invitation.firstName, invitation.lastName);
    if (!user) {
      return badRequest({ error: "Could not create user" });
    }
    await updateUserInvitationPending(invitation.id);
    await createTenantUser({
      tenantId: invitation.tenantId,
      userId: user.id,
      role: invitation.role,
    });

    await sendEmail(invitation.email, "welcome", {
      action_url: process.env.SERVER_URL + `/login`,
      name: invitation.firstName,
    });

    const userSession = await setLoggedUser(user);
    return createUserSession(
      {
        userId: user.id,
        lightOrDarkMode: userInfo.lightOrDarkMode,
        lng: userInfo.lng,
      },
      `/app/${userSession.defaultTenantId}/dashboard`
    );
  } else {
    // Existing user
    await updateUserInvitationPending(invitation.id);
    await createTenantUser({
      tenantId: invitation.tenantId,
      userId: existingUser.id,
      role: invitation.role,
    });

    const userSession = await setLoggedUser(existingUser);
    return createUserSession(
      {
        ...userSession,
        lightOrDarkMode: userInfo.lightOrDarkMode,
        lng: userInfo.lng,
      },
      `/app/${userSession.defaultTenantId}/dashboard`
    );
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function InvitationRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();

  const loadingButton = useRef<RefLoadingButton>(null);
  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <div>
      <div>
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Logo className="mx-auto h-12 w-auto" />
          </div>
          {(() => {
            if (!data.invitation) {
              return <div className="text-red-500 text-center">{t("shared.invalidInvitation")}</div>;
            } else {
              return (
                <div>
                  <h2 className="mt-6 text-center text-lg font-extrabold text-gray-800 dark:text-slate-200">
                    {t("shared.hi")} {data.invitation.firstName ? data.invitation.firstName : data.invitation.email}, {t("account.invitation.youWereInvited")}{" "}
                    {data.invitation.tenant.name}
                  </h2>
                  <p className="mt-2 text-center text-sm leading-5 text-gray-500 max-w">
                    {t("account.register.alreadyRegistered")}{" "}
                    <span className="font-medium text-theme-500 hover:text-theme-400 focus:outline-none focus:underline transition ease-in-out duration-150">
                      <Link to="/login">{t("account.register.clickHereToLogin")}</Link>
                    </span>
                  </p>

                  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="py-8 px-4 sm:rounded-sm sm:px-10">
                      <Form method="post" className="sm:w-96">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium leading-5">
                            {t("account.shared.email")}
                          </label>
                          <div className="mt-1 rounded-sm shadow-sm">
                            <input
                              disabled={true}
                              type="email"
                              id="email"
                              name="email"
                              defaultValue={data.invitation.email}
                              required
                              className="bg-gray-100 dark:bg-slate-800 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                            />
                          </div>
                        </div>
                        {!data.existingUser && (
                          <>
                            <div className="mt-6">
                              <label htmlFor="password" className="block text-sm font-medium leading-5">
                                {t("account.shared.password")}
                              </label>
                              <div className="mt-1 rounded-sm shadow-sm">
                                <input
                                  type="password"
                                  id="password"
                                  name="password"
                                  required
                                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                                />
                              </div>
                            </div>
                            <div className="mt-6">
                              <label htmlFor="password-confirm" className="block text-sm font-medium leading-5">
                                {t("account.register.confirmPassword")}
                              </label>
                              <div className="mt-1 rounded-sm shadow-sm">
                                <input
                                  type="password"
                                  id="password-confirm"
                                  name="password-confirm"
                                  required
                                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="mt-6">
                          <span className="block w-full rounded-sm shadow-sm">
                            <LoadingButton className="w-full block" type="submit" ref={loadingButton}>
                              {t("account.invitation.button")}
                            </LoadingButton>
                          </span>
                        </div>
                      </Form>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}
