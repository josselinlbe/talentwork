import { ReactNode } from "react";
import { InputType } from "~/application/enums/shared/InputType";

export type RowHeaderDisplayDto<T> = {
  title: string;
  name: string;
  type?: InputType;
  value: (item: T) => any;
  href?: (item: T) => any | undefined;
  formattedValue?: (item: T, idx?: number) => string | ReactNode;
  options?: { name: string; value: number | string; disabled?: boolean }[];
  setValue?: (value: any, idx: number) => void;
  editable?: (item: T) => boolean;
  className?: string;
  sortable?: boolean;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
};
