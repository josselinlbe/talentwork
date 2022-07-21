import { Entity, Property } from "@prisma/client";

export interface RowFiltersDto {
  customRow: boolean;
  entity: Entity;
  query: string | null;
  properties: {
    property?: Property;
    name?: string;
    value: string | null;
    condition?: string;
  }[];
  tags: string[];
}
