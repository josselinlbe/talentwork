import { Property } from "@prisma/client";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { SortedByDto } from "~/application/dtos/data/SortedByDto";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { countRows, getRows, RowWithDetails } from "../db/entities/rows.db.server";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import Constants from "~/application/Constants";

export function getPaginationFromCurrentUrl(request: Request): { page: number; pageSize: number; sortedBy: SortedByDto; query: string } {
  return {
    page: getPageFromCurrentUrl(request),
    pageSize: Constants.DEFAULT_PAGE_SIZE,
    sortedBy: getSortByFromCurrentUrl(request),
    query: getSearchQueryFromCurrentUrl(request),
  };
}

export function getFiltersFromCurrentUrl(request: Request, properties: FilterablePropertyDto[]): FiltersDto {
  const url = new URL(request.url);
  properties.forEach((property) => {
    const params = url.searchParams.get(property.name);
    property.value = params ?? null;
  });

  const query = url.searchParams.get("q") ?? undefined;

  return { query, properties };
}

export function getEntityFiltersFromCurrentUrl(customRow: boolean, entity: EntityWithDetails, request: Request): RowFiltersDto {
  const tags: string[] = [];
  const properties: { property: Property; value: string | null }[] = [];
  const url = new URL(request.url);
  entity.properties.forEach((property) => {
    const param = url.searchParams.get(property.name);
    properties.push({ property, value: param ?? null });
  });

  url.searchParams.getAll("tag").forEach((tag) => {
    tags.push(tag);
  });

  const query = url.searchParams.get("q");

  // console.log({ tags });
  return { customRow, entity, properties, query, tags };
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
  tenantId: string | null,
  userId: string | undefined,
  pageSize: number,
  page: number,
  sortedBy?: SortedByDto,
  filters?: RowFiltersDto
): Promise<{
  items: RowWithDetails[];
  pagination: PaginationDto;
}> {
  let orderBy: any = { folio: "desc" };
  if (sortedBy?.name === "createdAt" || sortedBy?.name === "folio") {
    orderBy = { [sortedBy?.name]: sortedBy?.direction };
  }

  const items = await getRows(entityId, tenantId, userId, pageSize, pageSize * (page - 1), orderBy, filters);
  const totalItems = await countRows(entityId, tenantId, userId, filters);
  const totalPages = Math.ceil(totalItems / pageSize);

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
