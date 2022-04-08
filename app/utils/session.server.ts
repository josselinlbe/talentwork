import { createCookieSessionStorage, redirect } from "remix";
import { URLSearchParams } from "url";
import { getMyTenants } from "./db/tenants.db.server";
import { getWorkspace, getMyWorkspaces } from "./db/workspaces.db.server";

export type UserSession = {
  userId: string;
  lightOrDarkMode: string;
  lng: string;
};

export async function setLoggedUser(user: { id: string; email: string; defaultWorkspaceId: string | null }) {
  const userTenants = await getMyTenants(user.id);

  let currentTenantId = "";
  let currentWorkspaceId = "";

  if (user.defaultWorkspaceId) {
    const workspace = await getWorkspace(user.defaultWorkspaceId);
    if (workspace) {
      return {
        userId: user.id,
        defaultTenantId: workspace.tenantId,
        defaultWorkspaceId: workspace.id,
      };
    }
  }

  if (userTenants.length > 0) {
    const tenant = userTenants[0].tenant;
    currentTenantId = tenant.id;
    const userWorkspaces = await getMyWorkspaces(user.id, tenant.id);
    if (userWorkspaces.length > 0) {
      currentWorkspaceId = userWorkspaces[0].workspace.id;
    }
  }

  return {
    userId: user.id,
    defaultTenantId: currentTenantId,
    defaultWorkspaceId: currentWorkspaceId,
  };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserInfo(request: Request): Promise<UserSession> {
  const session = await getUserSession(request);
  const userId = session.get("userId") ?? "";
  const lightOrDarkMode = session.get("lightOrDarkMode") ?? "dark";
  const lng = session.get("lng") ?? "en";
  return {
    userId,
    lightOrDarkMode,
    lng,
  };
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession(userSession: UserSession, redirectTo: string = "") {
  const session = await storage.getSession();
  session.set("userId", userSession.userId);
  session.set("lightOrDarkMode", userSession.lightOrDarkMode);
  session.set("lng", userSession.lng);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
