// import fs from "fs";
// import path from "path";
// import { SideBarItem } from "~/application/sidebar/SidebarItem";
// const yaml = require("js-yaml");

// type Doc = {
//   order: number;
//   title: string;
//   path: string;
//   description: string;
//   items: Doc[];
// };

// export async function getAllDocs(): Promise<Doc[]> {
//   const items: Doc[] = [];
//   const dir = path.join("./", "./app/routes/docs");
//   const fileNames = await readDirRecursive("./app/routes/docs");
//   fileNames.forEach((file) => {
//     if (path.parse(file).ext === ".mdx") {
//       let fileName = path.parse(file).name;
//       if (fileName === "index") {
//         // fileName = "/";
//         return;
//       }
//       const content = fs.readFileSync(path.join(dir, file), "utf8");
//       try {
//         const meta = content.split("---")[1];
//         let data = yaml.load(meta).meta;
//         // eslint-disable-next-line no-console
//         console.log({ data });
//         const order = data.order ? Number(data.order) : -1;
//         const title = data.title;
//         const description = data.description;
//         if (!order) {
//           throw new Error("Order required");
//         }
//         if (!title) {
//           throw new Error("Title required");
//         }
//         if (!description) {
//           throw new Error("Description required");
//         }
//         items.push({
//           order,
//           title,
//           description,
//           path: fileName,
//           items: [],
//         });
//       } catch (e) {
//         throw new Error(`Meta info required on file ${file}: ${e}`);
//       }
//     }
//   });

//   return items.sort((a, b) => a.order - b.order);
// }
