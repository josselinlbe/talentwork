import { PropertyOption, Media } from "@prisma/client";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { RowValueDto } from "./RowValueDto";

export type RowDetailDto = {
  values: RowValueDto[];
};
