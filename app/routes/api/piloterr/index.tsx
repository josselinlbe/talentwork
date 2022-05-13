import { json, LoaderFunction } from "remix";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { validateApiKey } from "~/utils/services/apiService";

// GET
export const loader: LoaderFunction = async ({ request, params }) => {
  const { apiKeyLog } = await validateApiKey(request, params);
  try {
    const endpoint = "";
    const authorizationToken = "";
    const response = await fetch(endpoint, {
      method: "GET",
      headers: new Headers({
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      }),
    });
    await setApiKeyLogStatus(apiKeyLog.id, {
      status: 200,
    });
    return response.json();
  } catch (e: any) {
    console.log(e);
    await setApiKeyLogStatus(apiKeyLog.id, {
      error: JSON.stringify(e),
      status: 400,
    });
    return json({ error: JSON.stringify(e) }, { status: 400 });
  }
};
