import { Entity, EntityProperty, EntityRowValue } from "@prisma/client";

export interface EntityRowDynamicValuesDto {
  form: Entity | undefined;
  name: string;
  total: number;
  headers: (EntityRowValue & { entityProperty: EntityProperty })[];
  // details: RequestDetailDto[];
}
