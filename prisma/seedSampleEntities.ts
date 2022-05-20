import { LinkedAccount, User, Employee } from "@prisma/client";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import FakePdfBase64 from "~/components/ui/pdf/FakePdfBase64";
import { ContractMemberRole } from "~/modules/contracts/enums/ContractMemberRole";
import { ContractStatus } from "~/modules/contracts/enums/ContractStatus";
import { db } from "~/utils/db.server";
import { createEntity } from "~/utils/db/entities/entities.db.server";
import { createProperty } from "~/utils/db/entities/properties.db.server";
import { createRow, RowWithDetails, getRow, getMaxRowFolio } from "~/utils/db/entities/rows.db.server";
import { defaultProperties } from "~/utils/helpers/PropertyHelper";

export async function seedSampleEntities(tenant1And2Relationship: LinkedAccount, user1: User) {
  const employees = await createSampleEntity_Employees(tenant1And2Relationship.providerTenantId, user1.id);
  // await createSampleEntity_Contract(tenant1And2Relationship, user1.id, employees);
}

async function createSampleEntity_Contract(linkedAccount: LinkedAccount, createdByUserId: string, employees: (RowWithDetails | null)[]) {
  const contractsEntity = await createEntity({
    name: "contract",
    slug: "contracts",
    prefix: "CON",
    title: "models.contract.object",
    titlePlural: "models.contract.plural",
    isFeature: true,
    isAutogenerated: true,
    hasApi: true,
    requiresLinkedAccounts: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 172 172" fill="currentColor">
      <g
        fill="none"
        fillRule="nonzero"
        stroke="none"
        strokeWidth="1"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeDasharray=""
        strokeDashoffset="0"
        fontFamily="none"
        fontWeight="none"
        fontSize="none"
        textAnchor="none"
        // style="mix-blend-mode: normal"
      >
        <path d="M0,172v-172h172v172z" fill="none" />
        <g fill="currentColor">
          <path d="M51.6,17.2c-15.76389,0 -28.66667,12.90277 -28.66667,28.66667v5.73333c0.00032,3.1663 2.56703,5.73302 5.73333,5.73333h63.06667c3.1663,-0.00032 5.73302,-2.56703 5.73333,-5.73333v-5.73333c0,-9.56597 7.63403,-17.2 17.2,-17.2c9.56597,0 17.2,7.63403 17.2,17.2v80.26667h-5.73333c0,4.0248 -0.73162,7.8776 -2.00442,11.46667h12.50807c1.67906,0.28606 3.39838,-0.18915 4.6922,-1.2969c1.29381,-1.10775 2.02818,-2.73336 2.00416,-4.43644v-86c0,-15.76389 -12.90277,-28.66667 -28.66667,-28.66667zM40.13333,68.8v63.06667c0,3.1648 2.56853,5.73333 5.73333,5.73333h13.47109c-1.2728,-3.58907 -2.00442,-7.44187 -2.00442,-11.46667h-5.73333v-57.33333zM74.53333,80.26667c-2.06765,-0.02924 -3.99087,1.05709 -5.03322,2.843c-1.04236,1.78592 -1.04236,3.99474 0,5.78066c1.04236,1.78592 2.96558,2.87225 5.03322,2.843h34.4c2.06765,0.02924 3.99087,-1.05709 5.03322,-2.843c1.04236,-1.78592 1.04236,-3.99474 0,-5.78066c-1.04236,-1.78592 -2.96558,-2.87225 -5.03322,-2.843zM91.73333,103.2c-12.59782,0 -22.93333,10.33551 -22.93333,22.93333c0,5.73428 2.21189,10.93616 5.73333,14.97161v30.89505l17.2,-11.46667l17.2,11.46667v-30.89505c3.52144,-4.03546 5.73333,-9.23733 5.73333,-14.97161c0,-12.59782 -10.33551,-22.93333 -22.93333,-22.93333zM91.73333,114.66667c6.40077,0 11.46667,5.06589 11.46667,11.46667c0,6.40077 -5.06589,11.46667 -11.46667,11.46667c-6.40077,0 -11.46667,-5.06589 -11.46667,-11.46667c0,-6.40077 5.06589,-11.46667 11.46667,-11.46667z" />
        </g>
      </g>
    </svg>`,
    order: 1,
    active: true,
  });
  const tenantAusers = await db.tenantUser.findMany({
    where: { tenantId: linkedAccount.providerTenantId },
    include: { user: true },
  });
  const tenantBusers = await db.tenantUser.findMany({
    where: { tenantId: linkedAccount.clientTenantId },
    include: { user: true },
  });

  let folio = 1;
  const maxFolio = await getMaxRowFolio(contractsEntity.id, undefined);
  if (maxFolio && maxFolio._max.folio !== null) {
    folio = maxFolio._max.folio + 1;
  }
  await db.contract.create({
    data: {
      row: {
        create: {
          folio,
          entityId: contractsEntity.id,
          createdByUserId,
          tenantId: linkedAccount.providerTenantId,
          linkedAccountId: linkedAccount.id,
        },
      },
      name: "Contract 1",
      description: "Lorem ipsum 1...",
      file: FakePdfBase64,
      status: ContractStatus.PENDING,
      members: {
        create: [
          {
            userId: tenantAusers[0].user.id,
            role: ContractMemberRole.SIGNATORY,
          },
          {
            userId: tenantBusers[1].user.id,
            role: ContractMemberRole.SIGNATORY,
          },
        ],
      },
      employees: {
        create: [
          {
            employeeId: employees[0]?.employeeId ?? "",
          },
          {
            employeeId: employees[1]?.employeeId ?? "",
          },
        ],
      },
    },
  });
}

async function createSampleEntity_Employees(tenantId: string, createdByUserId: string) {
  const employeesEntity = await createEntity({
    name: "employee",
    slug: "employees",
    prefix: "EMP",
    title: "models.employee.object",
    titlePlural: "models.employee.plural",
    isFeature: true,
    isAutogenerated: true,
    hasApi: true,
    requiresLinkedAccounts: false,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 172 172" fill="currentColor">
      <g
        fill="none"
        fillRule="nonzero"
        stroke="none"
        strokeWidth="1"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeDasharray=""
        strokeDashoffset="0"
        fontFamily="none"
        fontWeight="none"
        fontSize="none"
        textAnchor="none"
        // style="mix-blend-mode: normal"
      >
        <path d="M0,172v-172h172v172z" fill="none" />
        <g fill="currentColor">
          <path d="M40.13333,11.46667c-6.33533,0 -11.46667,5.13133 -11.46667,11.46667v126.13333c0,6.33533 5.13133,11.46667 11.46667,11.46667h91.73333c6.33533,0 11.46667,-5.13133 11.46667,-11.46667v-126.13333c0,-6.33533 -5.13133,-11.46667 -11.46667,-11.46667h-28.66667v17.2c0,3.1648 -2.56853,5.73333 -5.73333,5.73333h-22.93333c-3.1648,0 -5.73333,-2.56853 -5.73333,-5.73333v-17.2zM86,11.46667c-3.16643,0 -5.73333,2.5669 -5.73333,5.73333c0,3.16643 2.5669,5.73333 5.73333,5.73333c3.16643,0 5.73333,-2.5669 5.73333,-5.73333c0,-3.16643 -2.5669,-5.73333 -5.73333,-5.73333zM86,57.33333c4.99947,0 7.89453,3.94167 7.89453,3.94167c6.79973,0 10.85078,6.21054 10.85078,14.27734c0,4.0248 -2.22839,8.24167 -2.22839,8.24167c0,0 1.24297,0.42221 1.24297,3.19141c0,3.99613 -3.2362,6.22604 -3.2362,6.22604c-0.344,3.05014 -4.04146,7.15888 -5.75573,8.92474v9.24948c5.39507,7.66547 25.63203,4.06073 25.63203,20.48099h-68.8c0,-16.42027 20.23696,-12.81006 25.63203,-20.46979v-9.24948c-1.71427,-1.76587 -5.40599,-5.88581 -5.75573,-8.93594c0,0 -3.2362,-1.20364 -3.2362,-6.22604c0,-2.58573 1.24297,-3.19141 1.24297,-3.19141c0,0 -2.7211,-3.77226 -2.7211,-8.6112c0,-11.4552 8.61416,-17.84948 19.23802,-17.84948z" />
        </g>
      </g>
    </svg>`,
    order: 2,
    active: true,
  });

  const fields = [
    {
      name: "firstName",
      title: "models.employee.firstName",
      type: PropertyType.TEXT,
      isDynamic: false,
    },
    {
      name: "lastName",
      title: "models.employee.lastName",
      type: PropertyType.TEXT,
      isDynamic: false,
    },
    {
      name: "email",
      title: "models.employee.email",
      type: PropertyType.TEXT,
      isDynamic: false,
      pattern: "[a-zA-Z0-9._%+-]+@[a-z0-9.-]+.[a-zA-Z]{2,4}",
    },
    {
      name: "salary",
      title: "Salary",
      type: PropertyType.NUMBER,
      isDynamic: true,
    },
  ];

  const properties = await Promise.all(
    fields.map(async (field, idx) => {
      return await createProperty({
        entityId: employeesEntity.id,
        order: defaultProperties.length + idx + 1,
        ...field,
        isDefault: false,
        isRequired: true,
        isHidden: false,
        isDetail: false,
        pattern: "",
        parentId: null,
      });
    })
  );
  const salaryProperty = properties.find((f) => f.name === "salary");

  const employee1 = await createRow({
    entityId: employeesEntity.id,
    tenantId,
    createdByUserId,
    linkedAccountId: null,
    dynamicProperties: [
      {
        propertyId: salaryProperty?.id ?? "",
        numberValue: 100,
      },
    ],
    properties: {
      employee: {
        create: {
          firstName: "David",
          lastName: "N. Crowell",
          email: "davidn.crowell@dayrep.com",
        },
      },
    },
    dynamicRows: [],
  });
  // So both employees have different createdAt value
  await new Promise((r) => setTimeout(r, 1000));
  const employee2 = await createRow({
    entityId: employeesEntity.id,
    tenantId,
    createdByUserId,
    linkedAccountId: null,
    dynamicProperties: [
      {
        propertyId: salaryProperty?.id ?? "",
        numberValue: 200,
      },
    ],
    properties: {
      employee: {
        create: {
          firstName: "Sonny",
          lastName: "L. Hill",
          email: "sonnyl.hill@rhyta.com",
        },
      },
    },
    dynamicRows: [],
  });

  return [await getRow(employeesEntity.id, employee1.id, tenantId), await getRow(employeesEntity.id, employee2.id, tenantId)];
}
