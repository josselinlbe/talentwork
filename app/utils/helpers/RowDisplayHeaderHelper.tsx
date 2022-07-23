import { ReactNode } from "react";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import PropertyOptionValueBadge from "~/components/entities/properties/PropertyOptionValueBadge";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { EntityWithDetails, PropertyWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";
import DateUtils from "../shared/DateUtils";
import RowHelper from "./RowHelper";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import clsx from "clsx";
import WorkflowStateBadge from "~/components/core/workflows/WorkflowStateBadge";

function isColumnVisible(columns: ColumnDto[], name: string) {
  const column = columns.find((f) => f.name === name);
  if (!columns || !column) {
    return false;
  }
  return column.visible;
}

function displayTenant(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: "tenant",
    title: "models.tenant.object",
    value: (item) => item.tenant?.name,
    href: (item) => item.tenant?.id,
    breakpoint: "sm",
  };
}

function displayFolio(entity: EntityWithDetails): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: "folio",
    title: "models.row.folio",
    value: (item) => RowHelper.getRowFolio(entity, item),
    href: (item) => `${item.id}`,
    breakpoint: "sm",
    sortable: true,
  };
}

function displayWorkflowState(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: "workflowState",
    title: "models.workflowState.object",
    value: (item) => <>{item.workflowState && <WorkflowStateBadge state={item.workflowState} />}</>,
  };
}

function displayProperty(entity: EntityWithDetails, property: PropertyWithDetails, layout: string): RowHeaderDisplayDto<RowWithDetails> {
  const formattedValue = (item: RowWithDetails): string | ReactNode => {
    const value = RowHelper.getPropertyValue(entity, item, property);
    if (property.type === PropertyType.SELECT && value) {
      return <PropertyOptionValueBadge entity={entity} property={property.name} value={value} />;
    } else if (property.type === PropertyType.MEDIA) {
      const media = value as MediaDto[];
      if (media) {
        return (
          <div
            className={clsx(layout === "table" ? "truncate mt-1 flex items-center space-x-1 w-full overflow-x-visible" : "grid gap-1 max-h-60  overflow-auto")}
          >
            {media
              .filter((f) => f.type.includes("image"))
              .map((item) => {
                return (
                  <img
                    key={item.name}
                    className={clsx(" object-cover p-1 border border-dashed border-gray-300 bg-gray-50 shadow-sm", layout === "table" ? "h-10" : "")}
                    src={item.publicUrl ?? item.file}
                    alt={item.name}
                  />
                );
              })}
          </div>
        );
      } else {
        return <div></div>;
      }
    } else {
      return RowHelper.getCellValue(entity, item, property);
    }
  };

  return {
    name: property.name,
    title: property.title,
    value: (item) => RowHelper.getPropertyValue(entity, item, property),
    formattedValue,
    // href:
    //   property.type === PropertyType.ENTITY
    //     ? (item) =>
    //         `/app/${item.tenant.slug}/${RowHelper.getPropertyValue(entity, item, property)?.entity.slug}/${
    //           RowHelper.getPropertyValue(entity, item, property)?.id
    //         }`
    //     : undefined,
  };
}

function displayCreatedAt(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: "createdAt",
    title: "shared.createdAt",
    value: (item) => DateUtils.dateAgo(item.createdAt),
    className: "text-gray-400 text-xs",
    breakpoint: "sm",
    sortable: true,
  };
}

function displayCreatedByUser(): RowHeaderDisplayDto<RowWithDetails> {
  return {
    name: "createdByUser",
    title: "shared.createdBy",
    value: (item) => item.createdByUser?.email ?? (item.createdByApiKey ? "API" : "?"),
    className: "text-gray-400 text-xs",
    breakpoint: "sm",
  };
}

function getDisplayedHeaders(entity: EntityWithDetails, columns: ColumnDto[], layout: string): RowHeaderDisplayDto<RowWithDetails>[] {
  const headers: RowHeaderDisplayDto<RowWithDetails>[] = [];

  if (isColumnVisible(columns, "id") && columns?.find((f) => f.name === "id")) {
    headers.push({ name: "id", title: "ID", value: (item) => item.id, href: (item) => item.id, breakpoint: "sm" });
  }
  if (isColumnVisible(columns, "tenant") && columns?.find((f) => f.name === "tenant")) {
    headers.push(displayTenant());
  }
  if (isColumnVisible(columns, "folio")) {
    headers.push(displayFolio(entity));
  }
  if (entity.hasWorkflow) {
    headers.push(displayWorkflowState());
  }
  entity.properties
    .filter((f) => !f.isHidden && !f.isDetail && isColumnVisible(columns, f.name))
    .forEach((property) => {
      headers.push(displayProperty(entity, property, layout));
    });
  if (isColumnVisible(columns, "rows")) {
    if (entity.properties.find((f) => f.isDetail)) {
      headers.push({ name: "rows", title: "shared.rows", value: (item) => item.details.length, breakpoint: "lg" });
    }
  }
  if (isColumnVisible(columns, "createdAt")) {
    headers.push(displayCreatedAt());
  }
  if (isColumnVisible(columns, "createdByUser")) {
    headers.push(displayCreatedByUser());
  }
  return headers;
}

export default {
  isColumnVisible,
  displayTenant,
  displayFolio,
  displayProperty,
  displayCreatedAt,
  displayCreatedByUser,
  getDisplayedHeaders,
};
