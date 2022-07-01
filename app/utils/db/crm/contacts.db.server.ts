import { Contact, Deal, Row, User } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { db } from "~/utils/db.server";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import RowHelper from "~/utils/helpers/RowHelper";
import { createNewRowWithEntity } from "~/utils/services/rowsService";
import { RowWithCreatedBy } from "../entities/rows.db.server";

export type ContactWithDetails = Contact & {
  deals: Deal[];
  row: RowWithCreatedBy;
};

export function getAllContacts(filters?: FiltersDto): Promise<ContactWithDetails[]> {
  const where = RowFiltersHelper.getWhereQueryHelper(filters);
  console.log({ where });
  return db.contact.findMany({
    where,
    include: {
      deals: true,
      row: {
        include: {
          createdByUser: true,
          createdByApiKey: true,
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
