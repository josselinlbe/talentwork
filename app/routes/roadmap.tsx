// import { useTranslation } from "react-i18next";
// import { ActionFunction, LoaderFunction, MetaFunction, Outlet, redirect, useActionData } from "remix";
// import { json, useLoaderData } from "remix";
// import { i18nHelper } from "~/locale/i18n.utils";
// import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
// import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
// import RowsList from "~/components/entities/rows/RowsList";
// import { getPaginationFromCurrentUrl, getNewPaginationUrl, getRowsWithPagination } from "~/utils/helpers/RowPaginationHelper";
// import Constants from "~/application/Constants";
// import { PaginationDto } from "~/application/dtos/data/PaginationDto";
// import { Language } from "remix-i18next";
// import Footer from "~/components/front/Footer";
// import Header from "~/components/front/Header";

// type LoaderData = {
//   title: string;
//   i18n: Record<string, Language>;
//   entity: EntityWithDetails;
//   items: RowWithDetails[];
//   pagination?: PaginationDto;
// };
// export let loader: LoaderFunction = async ({ request }) => {
//   let { t, translations } = await i18nHelper(request);

//   const entity = await getEntityBySlug("roadmap");
//   if (!entity) {
//     return redirect("/404");
//   }

//   const currentPagination = getPaginationFromCurrentUrl(request);
//   const { items, pagination } = await getRowsWithPagination(
//     entity.id,
//     null,
//     Constants.DEFAULT_PAGE_SIZE,
//     currentPagination.page,
//     currentPagination.sortedBy,
//     currentPagination.query
//   );

//   const data: LoaderData = {
//     title: `${t(entity.titlePlural)} | ${process.env.APP_NAME}`,
//     i18n: translations,
//     entity,
//     items,
//     pagination,
//   };
//   return json(data);
// };

// export type ActionData = {
//   error?: string;
//   items?: RowWithDetails[];
//   pagination?: PaginationDto;
// };
// export const action: ActionFunction = async ({ request }) => {
//   const form = await request.formData();
//   const action = form.get("action");

//   const entity = await getEntityBySlug("roadmap");
//   if (!entity) {
//     return redirect("/404");
//   }

//   let { page, sortedBy } = getPaginationFromCurrentUrl(request);
//   if (action === "set-page") {
//     page = Number(form.get("page"));
//     if (page <= 0) {
//       page = 1;
//     }
//   }

//   if (action === "set-sort-by") {
//     sortedBy.name = form.get("name")?.toString() ?? "";
//     sortedBy.direction = form.get("direction") === "asc" ? "asc" : "desc";
//   }

//   return redirect(getNewPaginationUrl(request, page, sortedBy));
// };

// export const meta: MetaFunction = ({ data }) => ({
//   title: data?.title,
// });

// export default function PublicEntityRoute() {
//   const data = useLoaderData<LoaderData>();
//   const actionData = useActionData<ActionData>();
//   const { t } = useTranslation();

//   return (
//     <div>
//       <div>
//         <Header />
//         <div className="bg-white dark:bg-gray-900">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="sm:flex sm:flex-col sm:align-center">
//               <div className="relative max-w-5xl mx-auto py-12 sm:py-6 w-full overflow-hidden px-2">
//                 <div className="text-center">
//                   <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("front.roadmap.title")}</h1>
//                   <p className="mt-4 text-lg leading-6 text-gray-500">{t("front.roadmap.headline")}</p>
//                 </div>
//                 <div className="mt-12">
//                   <div className="space-y-3">
//                     {/* <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
//                       <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between space-x-2">
//                         <h1 className="flex-1 font-bold flex items-center truncate">{t(data.entity.titlePlural)}</h1>
//                         <div className="flex items-center space-x-2">
//                           <ButtonPrimary to={"new"}>
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                             </svg>

//                             <div>{t("shared.new")}</div>
//                           </ButtonPrimary>
//                         </div>
//                       </div>
//                     </div> */}
//                     <div className="z-40">
//                       <RowsList
//                         view="kanban"
//                         entity={data.entity}
//                         items={actionData?.items ?? data.items}
//                         pagination={actionData?.pagination ?? data.pagination}
//                       />
//                       <Outlet />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer></Footer>
//       </div>
//     </div>
//   );
// }
