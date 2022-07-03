import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SelectContractMembers, { RefSelectContractMembers } from "~/modules/contracts/components/contracts/SelectContractMembers";
import LinkedAccountSelector, { RefLinkedAccountSelector } from "~/components/app/linkedAccounts/LinkedAccountSelector";
import { AddContractMemberDto } from "~/modules/contracts/dtos/AddContractMemberDto";
import { ContractMemberRole } from "~/modules/contracts/enums/ContractMemberRole";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import clsx from "~/utils/shared/ClassesUtils";
import IconWorkers from "~/modules/contracts/icons/IconWorkers";
import UploadDocument from "~/components/ui/uploaders/UploadDocument";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { updateItem } from "~/utils/shared/ObjectUtils";
import PdfPreview from "~/components/ui/pdf/PdfViewer";
import { useAppData } from "~/utils/data/useAppData";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useParams, useSubmit, useTransition } from "@remix-run/react";
import { getLinkedAccount, getLinksWithMembers, LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";
import { i18nHelper } from "~/locale/i18n.utils";
import { getUserInfo } from "~/utils/session.server";
import { createContract, getContract } from "~/modules/contracts/db/contracts.db.server";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { ContractStatus } from "~/modules/contracts/enums/ContractStatus";
import { sendContract } from "~/modules/contracts/utils/ContractUtils";
import IconContract from "~/modules/contracts/icons/IconContract";
import IconSign from "~/modules/contracts/icons/IconSign";
import SelectEmployees, { RefSelectEmployees } from "~/modules/contracts/components/employees/SelectEmployees";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantUrl } from "~/utils/services/urlService";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { getPlanFeatureUsage } from "~/utils/services/subscriptionService";
import { getRow, getRows, RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { createRowLog } from "~/utils/db/logs.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";

type LoaderData = {
  title: string;
  links: LinkedAccountWithDetailsAndMembers[];
  preselectLink: LinkedAccountWithDetailsAndMembers | undefined;
  employees: Employee[];
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);
  const tenantUrl = await getTenantUrl(params);
  await verifyUserHasPermission(request, "app.entity.contract.create", tenantUrl.tenantId);

  const url = new URL(request.url);
  const preselectLinkIdQueryParam = url.searchParams.get("l");
  let preselectLink: LinkedAccountWithDetailsAndMembers | undefined;
  const links = await getLinksWithMembers(tenantUrl.tenantId);
  if (preselectLinkIdQueryParam) {
    preselectLink = links.find((f) => f.id === preselectLinkIdQueryParam);
  }
  const featurePlanUsage = await getPlanFeatureUsage(tenantUrl.tenantId, "contract");
  const employeeEntity = await getEntityBySlug("employees");
  if (!employeeEntity) {
    return badRequest({ error: "Employee entity required" });
  }

  const employeeRows = await getRows(employeeEntity.id, tenantUrl.tenantId);
  const employees = employeeRows.map((employee) => ApiHelper.getApiFormat(employeeEntity, employee));
  const data: LoaderData = {
    title: `${t("app.employees.new.multiple")} | ${process.env.APP_NAME}`,
    links,
    preselectLink,
    employees,
    featurePlanUsage,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let { t } = await i18nHelper(request);

  const tenantUrl = await getTenantUrl(params);
  const userInfo = await getUserInfo(request);

  const form = await request.formData();
  const linkedAccountId = form.get("linked-account-id")?.toString();
  const name = form.get("name")?.toString();
  const description = form.get("description")?.toString();
  const file = form.get("contract-file")?.toString();
  const employees = form.getAll("employees[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString()) as RowWithDetails;
  });
  const members = form.getAll("members[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString()) as AddContractMemberDto;
  });

  if (!name) {
    return badRequest({ error: t("app.contracts.errors.nameRequired") });
  } else if (!description) {
    return badRequest({ error: t("app.contracts.errors.descriptionRequired") });
  } else if (!file) {
    return badRequest({ error: t("app.contracts.errors.fileRequired") });
  } else if (!linkedAccountId) {
    return badRequest({ error: t("app.contracts.errors.linkedAccountRequired") });
  } else if (!members || members.filter((f) => f.role === ContractMemberRole.SIGNATORY).length < 2) {
    return badRequest({ error: t("app.contracts.errors.atLeastNSignatories") });
  }

  const linkedAccount = await getLinkedAccount(linkedAccountId);
  if (!linkedAccount) {
    return badRequest({ error: "Invalid link" });
  }

  const entity = await getEntityBySlug("contracts");
  if (!entity) {
    return badRequest({ error: "Contract entity required" });
  }
  const createdContract = await createContract(
    entity.id,
    userInfo.userId,
    tenantUrl.tenantId,
    linkedAccountId,
    {
      name,
      description,
      file,
      status: ContractStatus.PENDING,
    },
    members,
    employees
  );

  if (!createdContract) {
    return badRequest({ error: "Could not create contract" });
  }
  const contract = await getContract(createdContract.id);

  const contractRow = await getRow(entity.id, contract?.rowId ?? "", tenantUrl.tenantId);
  await createRowLog(request, {
    tenantId: tenantUrl.tenantId,
    createdByUserId: userInfo.userId,
    action: DefaultLogActions.Created,
    entity,
    item: contractRow,
  });

  const employeeEntity = await getEntityBySlug("employees");
  if (!employeeEntity) {
    return badRequest({ error: "Employee entity required" });
  }
  if (contract) {
    await sendContract(
      request,
      params,
      contract,
      employees.map((employee) => ApiHelper.getApiFormat(employeeEntity, employee))
    );
  }

  return redirect(UrlUtils.currentTenantUrl(params, "contracts/" + createdContract.id));
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

type Employee = { id: string; firstName: string; lastName: string; email: string };

export default function NewContractRoute() {
  const params = useParams();
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "submitting";

  const inputName = useRef<HTMLInputElement>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const selectEmployees = useRef<RefSelectEmployees>(null);
  const selectContractMembers = useRef<RefSelectContractMembers>(null);
  const linkedAccountSelector = useRef<RefLinkedAccountSelector>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState<LinkedAccountWithDetailsAndMembers | null>(null);
  const [contractFile, setContractFile] = useState("");
  const [members, setMembers] = useState<AddContractMemberDto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (data.preselectLink) {
      linkedAccountSelector.current?.select(data.preselectLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function addMember() {
    if (!link || !link.id) {
      errorModal.current?.show(t("shared.missingFields"), t("app.contracts.errors.linkRequired"));
    } else {
      selectContractMembers.current?.show(
        link,
        members.map((f) => f.userId)
      );
    }
  }
  function addEmployee() {
    selectEmployees.current?.show(employees.map((f) => f.id));
  }
  function removeFile() {
    setContractFile("");
  }
  function removeMember(index: number) {
    setMembers(members.filter((_x, i) => i !== index));
  }
  function removeEmployee(index: number) {
    setEmployees(employees.filter((_x, i) => i !== index));
  }
  function save() {
    const form = new FormData();
    form.set("linked-account-id", link?.id ?? "");
    form.set("name", name);
    form.set("description", description);
    form.set("contract-file", contractFile);
    members.forEach((item) => {
      form.append("members[]", JSON.stringify(item));
    });
    employees.forEach((item) => {
      form.append("employees[]", JSON.stringify(item));
    });
    submit(form, {
      method: "post",
    });
  }
  function droppedContractFile(files: FileBase64[]) {
    if (files.length > 0) {
      const mb = files[0].file.size / 1048576;
      if (mb >= 20) {
        errorModal.current?.show(t("shared.error"), t("app.contracts.errors.maxFileReached"));
      } else {
        setContractFile(files[0].base64);
      }
    }
  }
  function selectedLink(id: string, _link: LinkedAccountWithDetailsAndMembers) {
    setLink(_link);
    // nextTick(() => {
    inputName.current?.focus();
    inputName.current?.select();
    // });
  }
  function selectedEmployees(items: Employee[]) {
    setEmployees(items);
  }
  function selectedContractMembers(items: AddContractMemberDto[]) {
    setMembers(items);
  }
  const imProvider = () => {
    return appData.currentTenant?.id === link?.providerTenantId;
  };

  return (
    <div>
      <Breadcrumb
        menu={[
          {
            title: t("app.contracts.title"),
            routePath: UrlUtils.currentTenantUrl(params, "contracts?status=pending"),
          },
          {
            title: t("app.contracts.new.title"),
            routePath: UrlUtils.currentTenantUrl(params, "contracts/new"),
          },
        ]}
      />
      <div className="lg:py-8 max-w-2xl mx-auto">
        <div>
          <CheckPlanFeatureLimit item={data.featurePlanUsage}>
            <Form method="post">
              <div className="sm:space-y-4 divide-y divide-gray-200">
                <div className="bg-white py-6 px-8 shadow-lg border border-gray-200 space-y-6">
                  <div className="flex items-center space-x-3 justify-between">
                    <div>
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{t("app.contracts.new.title")}</h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{t("app.contracts.new.description")}</p>
                    </div>
                    <IconContract className="h-8 w-8 text-gray-800" />
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <LinkedAccountSelector ref={linkedAccountSelector} className="sm:col-span-6" onSelected={selectedLink} items={data.links} />

                    <div className="sm:col-span-6">
                      <label htmlFor="name" className="block text-xs font-medium text-gray-700 truncate">
                        {t("shared.name")}
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm w-full">
                        <input
                          id="name"
                          name="name"
                          ref={inputName}
                          type="text"
                          autoComplete="off"
                          required
                          value={name}
                          onChange={(e) => setName(e.currentTarget.value)}
                          placeholder={t("app.contracts.placeholders.name")}
                          className="w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="description" className="block text-xs font-medium text-gray-700 truncate">
                        {t("shared.description")}
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm w-full">
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          autoComplete="off"
                          required
                          value={description}
                          onChange={(e) => setDescription(e.currentTarget.value)}
                          placeholder={t("app.contracts.placeholders.description")}
                          className="w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-xs font-medium text-gray-700 truncate">{t("shared.file")}</label>
                      <div className="mt-1">
                        {(() => {
                          if (contractFile) {
                            return <PdfPreview file={contractFile} editing={true} onRemoveFile={removeFile} />;
                          } else {
                            return (
                              <UploadDocument
                                accept=".pdf"
                                description={t("shared.onlyFileTypes", [".PDF"])}
                                onDroppedFiles={droppedContractFile}
                                icon={<IconContract className="mx-auto h-10 w-10 text-gray-400" />}
                              />
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white py-6 px-8 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 justify-between">
                    <div>
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{t("app.contracts.signatories")}</h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{t("app.contracts.new.addSignatories")}.</p>
                    </div>
                    <IconSign className="h-8 w-8 text-gray-800" />
                  </div>
                  <div>
                    {members.map((member, idxMember) => {
                      return (
                        <div key={idxMember} className="grid grid-cols-6 items-center space-x-2 relative py-3 gap-1">
                          <button
                            type="button"
                            disabled={members.length <= 1}
                            className={clsx(
                              "absolute origin-top-right right-0 top-0 mt-1 mr-0 inline-flex items-center px-1.5 py-1.5 border-gray-300 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-theme-500",
                              members.length <= 1 && "text-gray-400 cursor-not-allowed",
                              members.length > 1 && "text-gray-700 hover:bg-gray-50"
                            )}
                            onClick={() => removeMember(idxMember)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="full-name" className="block text-xs font-medium text-gray-700 truncate">
                              {t("account.shared.fullName")}
                            </label>
                            <div className="mt-1">
                              <input
                                id="full-name"
                                // :ref="'fullName-' + idxMember"
                                value={member.name}
                                required
                                type="text"
                                name="full-name"
                                placeholder={t("account.shared.name")}
                                disabled
                                autoComplete="full-name"
                                className="bg-gray-100 cursor-not-allowed shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="col-span-3 sm:col-span-2">
                            <div className="flex items-start space-x-2">
                              <div className="flex-grow">
                                <label htmlFor="email" className="block text-xs font-medium text-gray-700 truncate">
                                  {t("account.shared.email")}
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="email"
                                    value={member.email}
                                    name="email"
                                    type="email"
                                    disabled
                                    placeholder={
                                      member.role === 0 ? t("app.contracts.placeholders.signatoryEmail") : t("app.contracts.placeholders.spectatorEmail")
                                    }
                                    autoComplete="email"
                                    required
                                    className="bg-gray-100 cursor-not-allowed shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-3 sm:col-span-2">
                            <div className="flex items-start space-x-2">
                              <div className="flex-grow">
                                <label htmlFor="role" className="block text-xs font-medium text-gray-700 truncate">
                                  {t("shared.role")}
                                </label>
                                <div className="mt-1">
                                  <select
                                    id="role"
                                    value={member.role}
                                    onChange={(e) => {
                                      updateItem(
                                        members,
                                        setMembers,
                                        member.userId,
                                        {
                                          role: Number(e.target.value),
                                        },
                                        "userId"
                                      );
                                      // const index = members.findIndex((x) => x.userId === member.userId);
                                      // const updated = members[index];
                                      // updated.role = Number(e.target.value);
                                      // setMembers([...members.slice(0, index), updated, ...members.slice(index + 1)]);
                                    }}
                                    autoComplete="email"
                                    className="shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  >
                                    <option value={0}>{t("app.contracts.signatory")}</option>
                                    <option value={1}>{t("app.contracts.spectator")}</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button type="button" onClick={addMember} className="mt-6 flex items-center space-x-1 text-xs text-theme-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="uppercase font-medium">{t("app.contracts.actions.selectSignatoryOrSpectator")}</span>
                    </button>
                  </div>
                </div>

                {imProvider() && (
                  <div className="bg-white py-6 px-8 shadow-lg border border-gray-200">
                    <div className="flex items-center space-x-3 justify-between">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{t("models.employee.plural")}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t("app.employees.actions.select")}.</p>
                      </div>
                      <IconWorkers className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <div>
                        {employees.map((employee, idxEmployee) => {
                          return (
                            <div key={idxEmployee} className="relative mt-1 grid grid-cols-6 items-center space-x-2 py-3 gap-1">
                              <button
                                type="button"
                                className="text-gray-700 hover:bg-gray-50 absolute origin-top-right right-0 top-0 mr-0 inline-flex items-center px-1.5 py-1.5 border-gray-300 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-theme-500"
                                onClick={() => removeEmployee(idxEmployee)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="col-span-6 sm:col-span-2">
                                <label htmlFor="full-name" className="block text-xs font-medium text-gray-700 truncate">
                                  {t("models.employee.fullName")}
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="employee-first-name-"
                                    // :ref="'employee-first-name-' + idxEmployee"
                                    value={employee.firstName}
                                    type="text"
                                    name="employee-first-name-"
                                    placeholder={t("models.employee.object") + " " + (idxEmployee + 1)}
                                    autoComplete="off"
                                    required
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed text-gray-800 shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              <div className="col-span-3 sm:col-span-2">
                                <label htmlFor="full-name" className="block text-xs font-medium text-gray-700 truncate">
                                  {t("models.employee.lastName")}
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="employee-last-name"
                                    value={employee.lastName}
                                    type="text"
                                    name="employee-last-name"
                                    autoComplete="off"
                                    required
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed text-gray-800 shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              <div className="col-span-3 sm:col-span-2">
                                <label htmlFor="email" className="block text-xs font-medium text-gray-700 truncate">
                                  {t("models.employee.email")}
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="email"
                                    value={employee.email}
                                    type="text"
                                    name="email"
                                    autoComplete="off"
                                    required
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed text-gray-800 shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex items-center space-x-3">
                          <button type="button" onClick={addEmployee} className="mt-6 flex items-center space-x-1 text-xs text-theme-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="uppercase font-medium">{t("app.employees.actions.selectEmployees")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="py-5">
                <div className="flex justify-end py-3 px-4 lg:px-0 lg:py-0">
                  <LoadingButton
                    type="button"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                    onClick={save}
                  >
                    {t("app.contracts.new.save")}
                  </LoadingButton>
                </div>
              </div>
            </Form>
          </CheckPlanFeatureLimit>
        </div>
      </div>
      <SelectEmployees ref={selectEmployees} items={data.employees} onSelected={selectedEmployees} />
      <SelectContractMembers ref={selectContractMembers} onSelected={selectedContractMembers} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
