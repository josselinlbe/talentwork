import { Colors } from "~/application/enums/shared/Colors";

export interface FilterablePropertyDto {
  name: string;
  title: string;
  manual?: boolean;
  value?: string | null;
  options?: { name: string; value: string; color?: Colors }[];
}
