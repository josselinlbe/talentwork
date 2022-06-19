export type RowPermissionsDto = {
  visibility: string; // "private" | "tenant" | "groups" | "users" | "public";
  canComment: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canRead?: boolean;
};
