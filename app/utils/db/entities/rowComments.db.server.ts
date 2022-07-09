import { RowComment } from "@prisma/client";
import { db } from "~/utils/db.server";
import { includeSimpleCreatedByUser, UserSimple } from "../users.db.server";
import { RowCommentReactionWithDetails } from "./rowCommentReaction.db.server";

export type RowCommentWithDetails = RowComment & {
  createdByUser: UserSimple;
  reactions: RowCommentReactionWithDetails[];
  // replies: (RowComment & { createdByUser: User })[];
};

export async function getRowComments(rowId: string): Promise<RowCommentWithDetails[]> {
  return await db.rowComment.findMany({
    where: {
      rowId,
      // parentCommentId: null,
    },
    include: {
      ...includeSimpleCreatedByUser,
      reactions: {
        include: {
          ...includeSimpleCreatedByUser,
        },
      },
      // replies: {
      //   include: {
      //     ...includeSimpleCreatedByUser,
      //   },
      // },
    },
  });
}

export async function getRowComment(id: string): Promise<RowCommentWithDetails | null> {
  return await db.rowComment.findUnique({
    where: {
      id,
    },
    include: {
      ...includeSimpleCreatedByUser,
      reactions: {
        include: {
          ...includeSimpleCreatedByUser,
        },
      },
      // replies: {
      //   include: {
      //     ...includeSimpleCreatedByUser,
      //   },
      // },
    },
  });
}

export async function createRowComment(data: { createdByUserId: string; rowId: string; value: string }) {
  return await db.rowComment.create({
    data,
  });
}

export async function updateRowComment(id: string, data: { value?: string; isDeleted?: boolean }) {
  return await db.rowComment.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteRowComment(id: string) {
  return await db.rowComment.delete({
    where: {
      id,
    },
  });
}
