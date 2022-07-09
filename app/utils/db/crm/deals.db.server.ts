import { Deal, Contact } from "@prisma/client";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { db } from "~/utils/db.server";
import { createNewRowWithEntity } from "~/utils/services/rowsService";
import { EntityWithDetails } from "../entities/entities.db.server";
import { RowWithCreatedBy } from "../entities/rows.db.server";
import { SubscriptionPriceWithProduct } from "../subscriptionProducts.db.server";
import { includeSimpleCreatedByUser } from "../users.db.server";

export type DealWithDetails = Deal & {
  contact: Contact;
  subscriptionPrice: SubscriptionPriceWithProduct | null;
  row: RowWithCreatedBy;
};

export function getAllDeals(filters?: RowFiltersDto): Promise<DealWithDetails[]> {
  return db.deal.findMany({
    where: {
      OR: [
        {
          name: { contains: filters?.query ?? "" },
        },
        { contact: { email: { contains: filters?.query ?? "" } } },
        { contact: { firstName: { contains: filters?.query ?? "" } } },
        { contact: { lastName: { contains: filters?.query ?? "" } } },
      ],
    },
    include: {
      contact: true,
      row: {
        include: {
          ...includeSimpleCreatedByUser,
          createdByApiKey: true,
          workflowState: true,
        },
      },
      subscriptionPrice: {
        include: {
          subscriptionProduct: true,
        },
      },
    },
  });
}

// export function getDeal(id: string): Promise<DealWithDetails | null> {
//   return db.deal.findUnique({
//     where: {
//       id,
//     },
//     include: {
//       contact: true,
//       row: {
//         include: {
//           ...includeSimpleCreatedByUser,
//           createdByApiKey: true,
//           workflowState: true,
//         },
//       },
//       subscriptionPrice: {
//         include: {
//           subscriptionProduct: true,
//         },
//       },
//     },
//   });
// }

export function getDealByRowId(rowId: string): Promise<DealWithDetails | null> {
  return db.deal.findUnique({
    where: {
      rowId,
    },
    include: {
      contact: true,
      row: {
        include: {
          ...includeSimpleCreatedByUser,
          createdByApiKey: true,
          workflowState: true,
        },
      },
      subscriptionPrice: {
        include: {
          subscriptionProduct: true,
        },
      },
    },
  });
}

export async function createDeal(
  entity: EntityWithDetails,
  createdByUserId: string,
  data: {
    contactId: string;
    name: string;
    value: number;
    subscriptionPriceId?: string | null;
  }
) {
  const row = await createNewRowWithEntity(entity, createdByUserId);
  return db.deal.create({
    data: {
      rowId: row.id,
      ...data,
    },
  });
}

export async function updateDeal(
  id: string,
  data: {
    name?: string;
    value?: number;
    contactId?: string;
    subscriptionPriceId?: string | null;
  }
) {
  return db.deal.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteDeal(id: string) {
  return db.deal.delete({
    where: {
      id,
    },
  });
}
