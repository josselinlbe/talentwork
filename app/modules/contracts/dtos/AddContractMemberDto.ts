import { ContractMemberRole } from "~/modules/contracts/enums/ContractMemberRole";

export interface AddContractMemberDto {
  name: string;
  email: string;
  userId: string;
  role: ContractMemberRole;
}
