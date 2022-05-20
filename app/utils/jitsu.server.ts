// import { JitsuClient, jitsuClient } from "@jitsu/sdk-js";

// let jitsu: JitsuClient;

// declare global {
//   var __jitsu: JitsuClient | undefined;
// }

// if (process.env.NODE_ENV === "production") {
//   jitsu = createJistuClient();
// } else {
//   if (!global.__jitsu) {
//     global.__jitsu = createJistuClient();
//   }
//   jitsu = global.__jitsu;
// }

// function createJistuClient() {
//   return jitsuClient({
//     key: process.env.JITSU_KEY ?? "",
//     tracking_host: process.env.JITSU_TRACKING_HOST ?? "",
//   });
// }

// export { jitsu };
