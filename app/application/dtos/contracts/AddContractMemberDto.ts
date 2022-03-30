import { ContractMemberRole } from "~/application/enums/contracts/ContractMemberRole";

export interface AddContractMemberDto {
  name: string;
  email: string;
  userId: string;
  role: ContractMemberRole;
}
