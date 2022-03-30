/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const path = require("path");
module.exports = {
  serverBuildTarget: "vercel",
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  ignoredRouteFiles: [".*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",
  // devServerPort: 8002
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    localePath: path.resolve("./public/locales"),
  },
};
