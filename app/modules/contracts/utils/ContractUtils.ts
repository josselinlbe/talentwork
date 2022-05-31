import { loadAppData } from "../../../utils/data/useAppData";
import { ContractWithDetails } from "../db/contracts.db.server";
import { sendEmail } from "../../../utils/email.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { Params } from "react-router";
import UrlUtils from "~/utils/app/UrlUtils";
import { EmployeeDto } from "../dtos/EmployeeDto";

export async function sendContract(request: Request, params: Params, contract: ContractWithDetails, employees: EmployeeDto[]) {
  let { t } = await i18nHelper(request);
  const appData = await loadAppData(request, params);

  const membersJson =
    contract?.members.map((f) => {
      return {
        email: f.user.email,
        first_name: f.user.firstName,
        last_name: f.user.lastName,
        role: f.role === 0 ? t("app.contracts.signatory") : t("app.contracts.spectator"),
      };
    }) ?? [];

  const employeesJson =
    employees.map((f) => {
      return {
        email: f.email,
        first_name: f.firstName,
        last_name: f.lastName,
      };
    }) ?? [];

  contract.members.forEach(async (member) => {
    try {
      await sendEmail(
        `${member.user.firstName} ${member.user.lastName} <${member.user.email}>`,
        "contract-new",
        {
          action_url: process.env.SERVER_URL + UrlUtils.currentTenantUrl(params, "contracts/" + contract.id),
          user_creator_firstName: appData.user?.firstName,
          user_creator_email: appData.user?.email,
          contract_name: contract.name,
          tenant_creator: contract.row.linkedAccount?.createdByTenant.name,
          tenant_provider: contract.row.linkedAccount?.providerTenant.name,
          tenant_client: contract.row.linkedAccount?.clientTenant.name,
          contract_description: contract.description,
          members: membersJson,
          employees: employeesJson,
        },
        [
          {
            Name: contract.name + ".pdf",
            Content: contract.file.replace("data:application/pdf;base64,", ""),
            ContentType: "application/pdf",
          },
        ]
      );
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log("[ERROR SENDING EMAIL]: " + e);
    }
  });
}
