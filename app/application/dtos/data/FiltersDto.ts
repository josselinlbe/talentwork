import { Entity, Property } from "@prisma/client";

export interface FiltersDto {
  customRow: boolean;
  entity: Entity;
  query: string | null;
  properties: {
    property: Property;
    value: string | null;
  }[];
  tags: string[];
}
