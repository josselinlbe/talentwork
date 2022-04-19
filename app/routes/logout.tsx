import type { ActionFunction, LoaderFunction } from "remix";
import { createUserEventLogout } from "~/utils/db/userEvents.db.server";

import { getUserInfo, logout } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  if (userInfo.userId) {
    createUserEventLogout(userInfo.userId);
  }
  return logout(request);
};

export let loader: LoaderFunction = async ({ request }) => {
  return logout(request);
};
