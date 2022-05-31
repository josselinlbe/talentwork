import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { SortedByDto } from "~/application/dtos/data/SortedByDto";
import { countRows, getRows, RowWithDetails } from "../db/entities/rows.db.server";

export function getPaginationFromCurrentUrl(request: Request): { page: number; sortedBy: SortedByDto; query: string } {
  return {
    page: getPageFromCurrentUrl(request),
    sortedBy: getSortByFromCurrentUrl(request),
    query: getSearchQueryFromCurrentUrl(request),
  };
}

function getPageFromCurrentUrl(request: Request): number {
  const params = new URL(request.url).searchParams;
  let page = 1;
  const paramsPage = params.get("page");
  if (paramsPage) {
    page = Number(paramsPage);
  }
  if (page <= 0) {
    page = 1;
  }
  return page;
}

function getSearchQueryFromCurrentUrl(request: Request): string {
  const params = new URL(request.url).searchParams;
  return params.get("q")?.toString() ?? "";
}

function getSortByFromCurrentUrl(request: Request): SortedByDto {
  const params = new URL(request.url).searchParams;
  let sort = params.get("sort")?.toString() ?? "";
  let direction: "asc" | "desc" = "asc";
  if (sort) {
    if (sort.startsWith("-")) {
      sort = sort.replace("-", "");
      direction = "desc";
    } else {
      direction = "asc";
    }
  }
  return { name: sort, direction };
}

export function getNewPaginationUrl(request: Request, page: number, sortedBy: { name: string; direction: "asc" | "desc" }): string {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  //Add a second foo parameter.
  if (params.get("page")) {
    params.set("page", page.toString());
  } else {
    params.append("page", page.toString());
  }

  if (sortedBy.name) {
    const withDirection = (sortedBy.direction === "desc" ? "-" : "") + sortedBy.name;
    if (params.get("sort")) {
      params.set("sort", withDirection);
    } else {
      params.append("sort", withDirection);
    }
  }

  const newUrl = url + "?" + params;
  return newUrl;
}

// export async function getPageFromCurrentUrl(request: Request): PaginationDto {
//   const params = new URL(request.url).searchParams;
//   const pageSize = Constants.DEFAULT_PAGE_SIZE;

//   let page = 1;
//   const paramsPage = params.get("page");
//   if (paramsPage) {
//     page = Number(paramsPage);
//   }

//   // const paramsSort = search.get("sort");
//   // if (!paramsPage) {
//   //   throw redirect(request.url + "?page=1");
//   // }
//   // let orderBy: any = { createdAt: "desc" };
//   // if (paramsSort) {
//   //   const column = paramsSort.replace("-", "").trim();
//   //   if (column === "createdAt" || column === "folio") {
//   //     orderBy = { [column]: paramsSort.startsWith("-") ? "desc" : "asc" };
//   //   }
//   // }
//   const pagination: PaginationDto = {
//     page,
//     pageSize,
//   };
//   return pagination;
// }

export async function getRowsWithPagination(
  entityId: string,
  tenantId: string,
  pageSize: number,
  page: number,
  sortedBy?: SortedByDto,
  query?: string
): Promise<{
  items: RowWithDetails[];
  pagination: PaginationDto;
}> {
  let orderBy: any = { createdAt: "desc" };
  if (sortedBy?.name === "createdAt" || sortedBy?.name === "folio") {
    orderBy = { [sortedBy?.name]: sortedBy?.direction };
  }

  const items = await getRows(entityId, tenantId, pageSize, pageSize * (page - 1), orderBy, query);
  const totalItems = await countRows(entityId, tenantId, query);
  const totalPages = Math.round(totalItems / pageSize);

  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      page,
      pageSize,
      sortedBy,
      query: undefined,
    },
  };
}
