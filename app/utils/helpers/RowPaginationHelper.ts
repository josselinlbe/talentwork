import { Property } from "@prisma/client";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { SortedByDto } from "~/application/dtos/data/SortedByDto";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { countRows, getRows, RowWithDetails } from "../db/entities/rows.db.server";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import Constants from "~/application/Constants";
import { EntityViewWithDetails } from "../db/entities/entityViews.db.server";
// import RowSortHelper from "./RowSortHelper";

export function getPaginationFromCurrentUrl(
  request: Request,
  entity?: EntityWithDetails,
  entityView?: EntityViewWithDetails | null
): { page: number; pageSize: number; sortedBy: SortedByDto[]; query: string } {
  return {
    page: getPageFromCurrentUrl(request),
    pageSize: Constants.DEFAULT_PAGE_SIZE,
    sortedBy: getSortByFromCurrentUrl(request, entity, entityView),
    query: getSearchQueryFromCurrentUrl(request),
  };
}

export function getFiltersFromCurrentUrl(request: Request, properties: FilterablePropertyDto[]): FiltersDto {
  const url = new URL(request.url);
  properties.forEach((property) => {
    const params = url.searchParams.get(property.name);
    property.value = params ?? null;
    if (property.isNumber && property.value) {
      if (isNaN(Number(property.value))) {
        property.value = null;
      }
    }
  });

  const query = url.searchParams.get("q") ?? undefined;

  return { query, properties };
}

export function getEntityFiltersFromCurrentUrl(
  customRow: boolean,
  entity: EntityWithDetails,
  request: Request,
  entityView?: EntityViewWithDetails | null | null
): RowFiltersDto {
  const tags: string[] = [];
  const properties: { property?: Property; name?: string; value: string | null; condition?: string }[] = [];
  const url = new URL(request.url);
  entity.properties.forEach((property) => {
    const param = url.searchParams.get(property.name);
    properties.push({ property, value: param ?? null });
  });

  entityView?.filters.forEach((filter) => {
    const property = entity.properties.find((f) => f.name === filter.name);
    if (property) {
      properties.push({ property, value: filter.value ?? null, condition: filter.condition });
    } else {
      properties.push({ name: filter.name, value: filter.value ?? null, condition: filter.condition });
    }
  });

  url.searchParams.getAll("tag").forEach((tag) => {
    tags.push(tag);
  });

  const workflowState = url.searchParams.get("workflowState");
  if (workflowState) {
    properties.push({ name: "workflowState", value: workflowState });
  }

  const workflowStateId = url.searchParams.get("workflowStateId");
  if (workflowStateId) {
    properties.push({ name: "workflowStateId", value: workflowStateId });
  }

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

function getSortByFromCurrentUrl(request: Request, entity?: EntityWithDetails, entityView?: EntityViewWithDetails | null): SortedByDto[] {
  const params = new URL(request.url).searchParams;
  let sorts = params.get("sort")?.toString().split(",") ?? [];
  return sorts.map((sort) => {
    let direction: "asc" | "desc" = "asc";
    if (sort) {
      if (sort.startsWith("-")) {
        sort = sort.replace("-", "");
        direction = "desc";
      } else {
        direction = "asc";
      }
    }
    const sortName = sort.replace("-", "").replace("+", "");
    const property = entity?.properties.find((p) => p.name === sortName);
    return { entity, name: sortName, direction, property };
  });
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
  sortedBy?: SortedByDto[],
  filters?: RowFiltersDto
): Promise<{
  items: RowWithDetails[];
  pagination: PaginationDto;
}> {
  // const orderBy = RowSortHelper.getRowSortCondition(sortedBy);
  let orderBy: any = { folio: "desc" };

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
