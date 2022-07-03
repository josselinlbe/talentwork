import { Entity, Property } from "@prisma/client";

export interface RowFiltersDto {
  customRow: boolean;
  entity: Entity;
  query: string | null;
  properties: {
    property: Property;
    value: string | null;
  }[];
  tags: string[];
}
