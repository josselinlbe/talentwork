import { json, LoaderFunction } from "remix";
import { setApiKeyLogStatus } from "~/utils/db/apiKeys.db.server";
import { validateApiKey } from "~/utils/services/apiService";

// GET
export const loader: LoaderFunction = async ({ request, params }) => {
  const { apiKeyLog, usage } = await validateApiKey(request, params);
  try {
    await setApiKeyLogStatus(apiKeyLog.id, {
      status: 200,
    });
    return json({
      plan: usage?.title,
      remaining: usage?.remaining,
    });
  } catch (e: any) {
    await setApiKeyLogStatus(apiKeyLog.id, {
      error: JSON.stringify(e),
      status: 400,
    });
    return json({ error: JSON.stringify(e) }, { status: 400 });
  }
};
