import { json, LoaderFunction } from "remix";
import en from "~/locale/locales/en/translations.json";
import es from "~/locale/locales/es/translations.json";

export let loader: LoaderFunction = async ({ params }) => {
  if (params.namespace === "es") {
    return json({ es });
  } else {
    return json({ en });
  }
};
