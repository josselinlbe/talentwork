import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";
import {TenantUserJoined} from "~/application/enums/tenants/TenantUserJoined";
import {TenantUserType} from "~/application/enums/tenants/TenantUserType";
import {TenantUserStatus} from "~/application/enums/tenants/TenantUserStatus";
import {seedSampleEntities} from "./seedSampleEntities";
import {createLinkedAccount} from "~/utils/db/linkedAccounts.db.server";
import {LinkedAccountStatus} from "~/application/enums/tenants/LinkedAccountStatus";
import {seedRolesAndPermissions} from "./seedRolesAndPermissions";
import {seedCrm} from "./seedCrm";
import {getAvailableTenantInboundAddress, getAvailableTenantSlug} from "~/utils/services/emailService";
import {createCoreEntity, getEntityByName} from "~/utils/db/entities/entities.db.server";
import {PropertyType} from "~/application/enums/entities/PropertyType";
import {Colors} from "~/application/enums/shared/Colors";
import {PropertyAttributeName} from "~/application/enums/entities/PropertyAttributeName";

const db = new PrismaClient();

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL?.toString();
  const adminPassword = process.env.ADMIN_PASSWORD?.toString();
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }
  const admin = await createUser("Josselin", "Liebe", adminEmail, adminPassword, TenantUserType.OWNER);
  const user1 = await createUser("Guillaume", "Scaglia", "guillaume@talentwork.io", "password", TenantUserType.MEMBER);

  const tenant1 = await createTenant("Talentwork", [
    { ...admin, type: TenantUserType.OWNER },
    { ...user1, type: TenantUserType.ADMIN },
  ]);

  const tenant2 = await createTenant("321Founded", [
    { ...admin, type: TenantUserType.OWNER },
    { ...user1, type: TenantUserType.MEMBER },
  ]);

  const tenant1And2Relationship = await createLinkedAccount({
    createdByUserId: user1.id,
    createdByTenantId: tenant1.id,
    providerTenantId: tenant1.id,
    clientTenantId: tenant2.id,
    status: LinkedAccountStatus.LINKED,
  });

  // Sample Entities
  await seedSampleEntities(tenant1And2Relationship, user1);

  await seedCoreEntities();

  // Permissions
  await seedRolesAndPermissions();
}

async function seedCoreEntities() {
  // Admin Entities
  await seedCrm();

  // Projects
  const employeesEntity = await getEntityByName("employee");
  if (!employeesEntity) {
    throw new Error("Could not get entity with name: employee");
  }
  await createCoreEntity(
      {
        name: "project",
        slug: "projects",
        title: "Project",
        titlePlural: "Projects",
        prefix: "PROJECT",
        icon: `<svg width="36" height="36" viewBox="0 0 36 36" fill="white" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 7.80822C7.5 5.12803 9.5737 3 12.2663 3H16.9527C18.4658 3 19.9939 3.57549 21.1443 4.74065L22.692 6.30822H29.7337C32.4263 6.30822 34.5 8.43625 34.5 11.1164V22.1918C34.5 24.872 32.4263 27 29.7337 27H12.2663C9.5737 27 7.5 24.872 7.5 22.1918V7.80822ZM12.2663 6C11.2665 6 10.5 6.74868 10.5 7.80822V22.1918C10.5 23.2513 11.2665 24 12.2663 24H29.7337C30.7335 24 31.5 23.2513 31.5 22.1918V11.1164C31.5 10.0569 30.7335 9.30822 29.7337 9.30822H22.0651C21.6639 9.30822 21.2795 9.14754 20.9977 8.86209L19.0095 6.84839C18.4558 6.28752 17.7117 6 16.9527 6H12.2663Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3 9C3.82843 9 4.5 9.67157 4.5 10.5V25.0878C4.5 27.8263 6.67325 30 9.23377 30H27C27.8284 30 28.5 30.6716 28.5 31.5C28.5 32.3284 27.8284 33 27 33H9.23377C4.93714 33 1.5 29.4027 1.5 25.0878V10.5C1.5 9.67157 2.17157 9 3 9Z" fill="white"/></svg>`,
      },
      [
        {
          name: "name",
          title: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          isDynamic: true,
        },
        {
          name: "logo",
          title: "Logo",
          type: PropertyType.MEDIA,
          isRequired: false,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.AcceptFileTypes, value: `image/png, image/gif, image/jpeg` }],
        },
        {
          name: "code",
          title: "Code",
          type: PropertyType.TEXT,
          isRequired: false,
          isDynamic: true,
        },
        {
          name: "description",
          title: "Description",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Rows, value: "5" }],
        },
        {
          name: "employee",
          title: "Manager",
          type: PropertyType.ENTITY,
          isDynamic: true,
          isRequired: true,
          parentId: employeesEntity?.properties.find((f) => f.name === "id")?.id ?? null,
       },
        {
          name: "status",
          title: "Status",
          type: PropertyType.SELECT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.DefaultValue, value: "Active" }],
          options: [
            { order: 1, value: "Active", color: Colors.GREEN },
            { order: 2, value: "Inactive", color: Colors.YELLOW },
            { order: 3, value: "Aborted", color: Colors.GRAY },
          ],
        },
      ]
  );

  // Code Analytics
  const projectsEntity = await getEntityByName("project");
  if (!projectsEntity) {
    throw new Error("Could not get entity with name: projects");
  }
  await createCoreEntity(
      {
        name: "codeAnalytics",
        slug: "code-analytics",
        title: "Code Analytic",
        titlePlural: "Code Analytics",
        prefix: "CODE",
        icon: `<svg width="36" height="36" viewBox="0 0 36 36" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M8.02247 12.5552C8.02247 9.72099 10.4494 7.48343 13.4831 7.48343C14.3933 7.48343 15 6.88674 15 5.99171C15 5.09669 14.3933 4.5 13.4831 4.5C8.7809 4.5 4.98876 8.08011 4.98876 12.5552V13.4503C4.98876 14.7928 4.07865 16.1354 2.5618 16.5829C1.95506 16.732 1.5 17.3287 1.5 17.9254C1.5 18.5221 1.95506 19.1188 2.5618 19.4171C4.07865 19.8646 4.98876 21.058 4.98876 22.5497V23.4448C4.98876 27.9199 8.7809 31.5 13.4831 31.5C14.3933 31.5 15 30.9033 15 30.0083C15 29.1133 14.3933 28.5166 13.4831 28.5166C10.4494 28.5166 8.02247 26.279 8.02247 23.4448V22.4006C8.02247 20.6105 7.26404 18.9696 6.05056 17.9254C7.26404 16.732 8.02247 15.0912 8.02247 13.4503V12.5552Z" fill="white"/><path d="M33.4382 16.5C31.9213 16.05 31.0112 14.85 31.0112 13.35V12.6C31.0112 8.1 27.2191 4.5 22.5169 4.5C21.6067 4.5 21 5.1 21 6C21 6.9 21.6067 7.5 22.5169 7.5C25.5506 7.5 27.9775 9.75 27.9775 12.6V13.5C27.9775 15.3 28.736 16.95 29.9494 18C28.736 19.2 27.9775 20.85 27.9775 22.5V23.4C27.9775 26.25 25.5506 28.5 22.5169 28.5C21.6067 28.5 21 29.1 21 30C21 30.9 21.6067 31.5 22.5169 31.5C27.2191 31.5 31.0112 27.9 31.0112 23.4V22.5C31.0112 21.15 31.9213 19.8 33.4382 19.35C34.0449 19.2 34.5 18.6 34.5 18C34.5 17.4 34.0449 16.8 33.4382 16.5Z" fill="white"/></svg>`,
      },
      [
        {
          name: "code",
          title: "Code",
          type: PropertyType.TEXT,
          isRequired: true,
          isDynamic: true,
        },
        {
          name: "project",
          title: "Project",
          type: PropertyType.ENTITY,
          isDynamic: true,
          isRequired: true,
          parentId: projectsEntity?.properties.find((f) => f.name === "id")?.id ?? null,
        },
        {
          name: "status",
          title: "Status",
          type: PropertyType.SELECT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.DefaultValue, value: "Active" }],
          options: [
            { order: 1, value: "Active", color: Colors.GREEN },
            { order: 2, value: "Inactive", color: Colors.RED },
          ],
        },
      ]
  );

  // Tasks
  const codeAnalyticsEntity = await getEntityByName("codeAnalytics");
  if (!codeAnalyticsEntity) {
    throw new Error("Could not get entity with name: code analytics");
  }
  await createCoreEntity(
      {
        name: "task",
        slug: "tasks",
        title: "Task",
        titlePlural: "Tasks",
        prefix: "TASK",
        icon: `<svg width="36" height="36" viewBox="0 0 36 36" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M13.0412 15.3042C12.4326 14.7043 11.5198 14.7043 10.9112 15.3042C10.3027 15.904 10.3027 16.8038 10.9112 17.4037L17.1489 24.0021C17.4532 24.3021 17.9096 24.452 18.2139 24.452C18.6703 24.452 19.1267 24.3021 19.2789 23.8522L34.1885 5.40654C34.6449 4.80668 34.6449 3.75693 33.8842 3.30703C33.4278 2.85714 32.515 2.85714 31.9064 3.60696L28.8636 7.35607C26.1251 4.65671 22.1695 3.0071 18.2139 3.0071C9.84626 3.0071 3 9.75551 3 18.0036C3 26.2516 9.84626 33 18.2139 33C26.5816 33 33.4278 26.2516 33.4278 18.0036C33.4278 16.6539 33.2757 15.3042 32.8193 13.9545C32.515 13.2047 31.7543 12.7548 30.9936 12.9048C30.2329 13.0547 29.7765 13.9545 29.9286 14.7043C30.2329 15.7541 30.385 16.9538 30.385 18.0036C30.385 24.602 24.908 30.0007 18.2139 30.0007C11.5198 30.0007 6.04278 24.602 6.04278 18.0036C6.04278 11.4051 11.5198 6.00639 18.2139 6.00639C21.561 6.00639 24.6038 7.35607 27.038 9.75551L18.2139 20.7029L13.0412 15.3042Z" fill="white"/></svg>`,
      },
      [
        {
          name: "name",
          title: "Name",
          type: PropertyType.TEXT,
          isRequired: true,
          isDynamic: true,
        },
        {
          name: "startDate",
          title: "Start Date",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.HelpText, value: "Start date" }
          ],
        },
        {
          name: "endDate",
          title: "End Date",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.HelpText, value: "End date" }
          ],
        },
        {
          name: "description",
          title: "Description",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.Rows, value: "3" }
          ],
        },
        {
          name: "codeAnalytic",
          title: "Code Analytic",
          type: PropertyType.ENTITY,
          isDynamic: true,
          isRequired: false,
          parentId: codeAnalyticsEntity?.properties.find((f) => f.name === "id")?.id ?? null,
        },
        {
          name: "status",
          title: "Status",
          type: PropertyType.SELECT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.DefaultValue, value: "Planned" }],
          options: [
            { order: 1, value: "Planned", color: Colors.YELLOW },
            { order: 2, value: "In Progress", color: Colors.GREEN },
            { order: 3, value: "Done", color: Colors.BLUE },
          ],
        },
        {
          name: "files",
          title: "Files",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.Rows, value: "10" },
            { name: PropertyAttributeName.HelpText, value: "10 files max" }
          ],
        },
      ]
  );

  // Invoices
  await createCoreEntity(
      {
        name: "invoice",
        slug: "invoices",
        title: "Invoice",
        titlePlural: "Invoices",
        prefix: "INV",
        icon: `<svg width="36" height="36" viewBox="0 0 36 36" fill="white" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.5 8.7002C5.32843 8.7002 6 9.37177 6 10.2002V27.0002C6 29.4014 8.10625 31.5002 10.8 31.5002H23.85C24.6784 31.5002 25.35 32.1718 25.35 33.0002C25.35 33.8286 24.6784 34.5002 23.85 34.5002H10.8C6.59375 34.5002 3 31.199 3 27.0002V10.2002C3 9.37177 3.67157 8.7002 4.5 8.7002Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 6.28571C9 3.49953 11.369 1.5 13.9759 1.5H21.3621C22.9943 1.5 24.5396 2.04046 25.7229 3.19469L31.2052 8.17549C31.2204 8.18929 31.2353 8.2034 31.2499 8.21781C32.4212 9.37316 33 10.9082 33 12.4286V23.7143C33 26.5005 30.631 28.5 28.0241 28.5H13.9759C11.369 28.5 9 26.5005 9 23.7143V6.28571ZM13.9759 4.5C12.8172 4.5 12 5.35762 12 6.28571V23.7143C12 24.6424 12.8172 25.5 13.9759 25.5H28.0241C29.1828 25.5 30 24.6424 30 23.7143V12.4286C30 11.6721 29.7165 10.9299 29.1627 10.3731L23.6844 5.39594C23.6693 5.38214 23.6543 5.36803 23.6397 5.35361C23.0881 4.80946 22.3259 4.5 21.3621 4.5H13.9759Z" fill="white"/></svg>`,
      },
      [
        {
          name: "project",
          title: "Project",
          type: PropertyType.ENTITY,
          isDynamic: true,
          isRequired: true,
          parentId: projectsEntity?.properties.find((f) => f.name === "id")?.id ?? null,
        },
        {
          name: "amount",
          title: "Amount",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.HelpText, value: "Excl. taxes" }
          ],
        },
        {
          name: "startDate",
          title: "Start Date",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.HelpText, value: "Start date" }
          ],
        },
        {
          name: "endDate",
          title: "End Date",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.HelpText, value: "End date" }
          ],
        },
        {
          name: "status",
          title: "Status",
          type: PropertyType.SELECT,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.DefaultValue, value: "To paid" }
          ],
          options: [
            { order: 1, value: "To Paid", color: Colors.RED },
            { order: 2, value: "Paid", color: Colors.GREEN },
          ],
        },
        {
          name: "taxes",
          title: "Taxes",
          type: PropertyType.SELECT,
          isDynamic: true,
          options: [
            { order: 1, value: "0" },
            { order: 2, value: "20" },
          ],
          attributes: [
            { name: PropertyAttributeName.DefaultValue, value: "20" },
            { name: PropertyAttributeName.HelpText, value: "Taxe percent" }
          ]
        },
        {
          name: "invoice_file",
          title: "Invoice",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [
              { name: PropertyAttributeName.AcceptFileTypes, value: "application/pdf" },
              { name: PropertyAttributeName.Rows, value: "1" },
              { name: PropertyAttributeName.HelpText, value: "Invoice file (.pdf)" }
          ],
        },
      ]
  );
}

async function createUser(firstName: string, lastName: string, email: string, password: string, adminRole?: TenantUserType) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      avatar: "",
      firstName,
      lastName,
      phone: "",
    },
  });
  if (adminRole !== undefined) {
    await db.adminUser.create({
      data: {
        userId: user.id,
        role: adminRole,
      },
    });
  }
  return user;
}

async function createTenant(name: string, users: { id: string; type: TenantUserType }[]) {
  const slug = await getAvailableTenantSlug(name);
  const address = await getAvailableTenantInboundAddress(name);
  const tenant = await db.tenant.create({
    data: {
      name,
      slug,
      icon: "",
      inboundAddresses: {
        create: {
          address,
        },
      },
    },
  });

  await db.tenantSubscription.create({
    data: {
      tenantId: tenant.id,
      stripeCustomerId: "",
      stripeSubscriptionId: "",
      quantity: 0,
    },
  });

  users.forEach(async (user) => {
    await db.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        type: user.type,
        joined: TenantUserJoined.CREATOR,
        status: TenantUserStatus.ACTIVE,
      },
    });
  });

  return tenant;
}

seed();
