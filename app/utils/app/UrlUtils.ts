import { Params } from "react-router";

const stripTrailingSlash = (str: string) => {
  return str.endsWith("/") ? str.slice(0, -1) : str;
};

const appUrl = (params: Params, path: string) => {
  const appPath = path.startsWith("/") ? path.substring(1, path.length - 1) : path;
  // console.log({ appPath });
  return `/app/${params.tenant}/${params.workspace}/${appPath}`;
};

export default {
  appUrl,
  stripTrailingSlash,
};
