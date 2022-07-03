import { Contact, Deal } from "@prisma/client";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { db } from "~/utils/db.server";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { createNewRowWithEntity } from "~/utils/services/rowsService";
import { RowWithCreatedBy } from "../entities/rows.db.server";

export type ContactWithDetails = Contact & {
  deals: Deal[];
  row: RowWithCreatedBy;
};

export function getAllContacts(filters?: RowFiltersDto): Promise<ContactWithDetails[]> {
  const where = RowFiltersHelper.getRowFiltersCondition(filters);
  return db.contact.findMany({
    where,
    include: {
      deals: true,
      row: {
        include: {
          createdByUser: true,
          createdByApiKey: true,
          workflowState: true,
        },
      },
    },
  });
}

export function getContact(id: string): Promise<ContactWithDetails | null> {
  return db.contact.findUnique({
    where: {
      id,
    },
    include: {
      deals: true,
      row: {
        include: {
          createdByUser: true,
          createdByApiKey: true,
          workflowState: true,
        },
      },
    },
  });
}

export function getContactByEmail(email: string): Promise<ContactWithDetails | null> {
  return db.contact.findFirst({
    where: {
      email,
    },
    include: {
      deals: true,
      row: {
        include: {
          createdByUser: true,
          createdByApiKey: true,
          workflowState: true,
        },
      },
    },
  });
}

export async function createContact(
  createdByUserId: string,
  data: {
    status: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    company?: string;
    title?: string;
  }
) {
  const row = await createNewRowWithEntity("contact", createdByUserId);
  return db.contact.create({
    data: {
      rowId: row.id,
      ...data,
    },
  });
}

export async function updateContact(
  id: string,
  data: {
    status?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    title?: string;
  }
) {
  return db.contact.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteContact(id: string) {
  return db.contact.delete({
    where: {
      id,
    },
  });
}
