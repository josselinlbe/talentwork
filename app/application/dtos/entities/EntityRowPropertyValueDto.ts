import { EntityPropertyOption } from "@prisma/client";
import { EntityPropertyWithDetails } from "~/utils/db/entities.db.server";
import { EntityRowWithDetails } from "~/utils/db/entityRows.db.server";

export type EntityRowPropertyValueDto = {
  id?: string | null;
  entityProperty: EntityPropertyWithDetails;
  entityPropertyId: string;
  relatedRowId?: string | undefined;
  idValue?: string | undefined;
  textValue?: string | undefined;
  numberValue?: number | undefined;
  dateValue?: Date | undefined;
  selectedOption?: EntityPropertyOption | undefined;
  relatedRow?: EntityRowWithDetails | undefined;
};
