import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";
import {TenantUserJoined} from "~/application/enums/tenants/TenantUserJoined";
import {TenantUserType} from "~/application/enums/tenants/TenantUserType";
import {TenantUserStatus} from "~/application/enums/tenants/TenantUserStatus";
import {seedSampleEntities} from "./seedSampleEntities";
import {createLinkedAccount} from "~/utils/db/linkedAccounts.db.server";
import {LinkedAccountStatus} from "~/application/enums/tenants/LinkedAccountStatus";
import {seedRolesAndPermissions} from "./seedRolesAndPermissions";
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
  // Talent Pool
  await createCoreEntity(
      {
        name: "talents",
        slug: "talents-pool",
        title: "Talent Pool",
        titlePlural: "Talents Pool",
        prefix: "TALENT",
        icon: `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.3488 20.1C23.2488 19.05 23.8488 17.7 23.8488 16.35C23.8488 13.05 21.1488 10.5 17.9988 10.5C14.8488 10.5 12.1488 13.05 12.1488 16.2C12.1488 17.7 12.7488 19.05 13.6488 19.95C11.6988 21 10.1988 22.5 9.29876 24.6C8.84876 25.65 8.99876 27 9.59876 28.05C10.3488 29.1 11.5488 29.7 12.7488 29.7H23.0988C24.2988 29.7 25.4988 29.1 26.2488 28.05C26.9988 27 26.9988 25.8 26.5488 24.6C25.7988 22.65 24.2988 21 22.3488 20.1ZM15.1488 16.2C15.1488 14.7 16.4988 13.5 17.9988 13.5C19.4988 13.5 20.8488 14.7 20.8488 16.35C20.8488 18 19.4988 19.05 17.9988 19.05C16.4988 19.05 15.1488 17.85 15.1488 16.2ZM23.8488 26.4C23.6988 26.55 23.3988 26.7 23.2488 26.7H12.7488C12.4488 26.7 12.2988 26.55 12.1488 26.4C11.9988 26.4 11.9988 26.1 11.9988 25.8C13.0488 23.4 15.2988 21.9 17.9988 21.9C20.6988 21.9 22.9488 23.4 23.9988 25.8C23.9988 26.1 23.9988 26.4 23.8488 26.4Z" fill="black"/><path d="M10.9491 18.9C10.9491 18.15 10.3491 17.4 9.44905 17.4H4.49905C5.09905 15.9 6.59905 15 8.24905 15C10.7991 15 12.7491 13.05 12.7491 10.5C12.7491 7.95 10.6491 6 8.24905 6C5.84905 6 3.74905 7.95 3.74905 10.5C3.74905 11.4 4.04905 12.3 4.64905 13.05C3.29905 13.8 2.24905 14.85 1.79905 16.2C1.34905 17.1 1.49905 18.15 1.94905 19.05C2.54905 19.95 3.44905 20.4 4.49905 20.4H9.29905C10.1991 20.4 10.9491 19.8 10.9491 18.9ZM6.74905 10.5C6.74905 9.6 7.49905 9 8.24905 9C8.99905 9 9.74905 9.75 9.74905 10.5C9.74905 11.4 8.99905 12 8.24905 12C7.49905 12 6.74905 11.25 6.74905 10.5Z" fill="black"/><path d="M34.2 16.1996C33.6 14.8496 32.55 13.6496 31.35 12.8996C31.8 12.1496 32.25 11.2496 32.25 10.3496C32.25 7.94961 30.15 5.84961 27.75 5.84961C25.35 5.84961 23.25 7.79961 23.25 10.3496C23.25 12.8996 25.35 14.8496 27.75 14.8496C29.4 14.8496 30.9 15.7496 31.35 17.3996H26.55C25.65 17.3996 25.05 17.9996 25.05 18.8996C25.05 19.6496 25.65 20.3996 26.55 20.3996H31.35C32.4 20.3996 33.3 19.9496 33.9 19.0496C34.5 18.1496 34.65 17.0996 34.2 16.1996ZM27.75 8.99961C28.65 8.99961 29.25 9.74961 29.25 10.4996C29.25 11.3996 28.5 11.9996 27.75 11.9996C27 11.9996 26.25 11.2496 26.25 10.4996C26.25 9.59961 26.85 8.99961 27.75 8.99961Z" fill="black"/></svg>`
      },
      [
        {
          name: "firstName",
          title: "models.employee.firstName",
          type: PropertyType.TEXT,
          isDynamic: true,
        },
        {
          name: "lastName",
          title: "models.employee.lastName",
          type: PropertyType.TEXT,
          isDynamic: true,
        },
        {
          name: "email",
          title: "models.employee.email",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Pattern, value: "[a-zA-Z0-9._%+-]+@[a-z0-9.-]+.[a-zA-Z]{2,4}" }],
        },
        {
          name: "urlLinkedin",
          title: "Linkedin",
          type: PropertyType.TEXT,
          isDynamic: true,
        },
        {
          name: "website",
          title: "Website",
          type: PropertyType.TEXT,
          isDynamic: true,
        },
        {
          name: "otherLink",
          title: "Other Link",
          type: PropertyType.TEXT,
          isDynamic: true,
        },
        {
          name: "phone",
          title: "Phone",
          type: PropertyType.TEXT,
          isDynamic: true,
        },
        {
          name: "priceDay",
          title: "Price Day",
          type: PropertyType.NUMBER,
          isDynamic: true,
        },
        {
          name: "priceHour",
          title: "Price Hour",
          type: PropertyType.NUMBER,
          isDynamic: true,
        },
        {
          name: "photo",
          title: "Photo",
          type: PropertyType.MEDIA,
          isDynamic: true,
          isRequired: false,
          attributes: [
            { name: PropertyAttributeName.Max, value: "1" },
            { name: PropertyAttributeName.AcceptFileTypes, value: "image/png, image/gif, image/jpeg" },
          ],
        },
        {
          name: "favorite",
          title: "Favorite",
          type: PropertyType.BOOLEAN,
          isDynamic: true
        },
        {
          name: "remote",
          title: "Remote",
          type: PropertyType.BOOLEAN,
          isDynamic: true
        },
        {
          name: "status",
          title: "Status",
          type: PropertyType.SELECT,
          isDynamic: true,
          options: [
            { order: 1, value: "Active", color: Colors.GREEN },
            { order: 2, value: "Onboarding", color: Colors.YELLOW },
            { order: 3, value: "Inactive", color: Colors.YELLOW },
            { order: 4, value: "Aborted", color: Colors.GRAY },
          ],
          attributes: [
            { name: PropertyAttributeName.DefaultValue, value: "Active" },
          ]
        },
        {
          name: "files",
          title: "Files",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.AcceptFileTypes, value: "image/png, image/gif, image/jpeg" },
            { name: PropertyAttributeName.Max, value: "1" },
            { name: PropertyAttributeName.HelpText, value: "CV File" }
          ],
        },
      ]
  );

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
        icon: `<svg width="13" height="13" viewBox="0 0 13 13" fill="white" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2_92)"><path d="M10.2917 1.62503H8.66667C8.58325 1.62503 8.49875 1.60553 8.42454 1.56815L6.71504 0.713403C6.49025 0.601278 6.23946 0.542236 5.98867 0.542236H4.875C3.38163 0.542236 2.16667 1.75719 2.16667 3.25057V7.58336C2.16667 9.07674 3.38163 10.2917 4.875 10.2917H10.2917C11.785 10.2917 13 9.07674 13 7.58336V4.33336C13 2.83999 11.785 1.62503 10.2917 1.62503ZM4.875 1.62503H5.98867C6.07208 1.62503 6.15658 1.64453 6.23079 1.6819L7.93975 2.53665C8.164 2.64878 8.41533 2.70782 8.66667 2.70782H10.2917C10.998 2.70782 11.5998 3.16065 11.8235 3.79115H3.25V3.24949C3.25 2.35357 3.97908 1.62449 4.875 1.62449V1.62503ZM10.2917 9.20836H4.875C3.97908 9.20836 3.25 8.47928 3.25 7.58336V4.87503H11.9167V7.58336C11.9167 8.47928 11.1876 9.20836 10.2917 9.20836ZM10.8333 11.9167C10.8333 12.2162 10.5912 12.4584 10.2917 12.4584H2.70833C1.21496 12.4584 0 11.2434 0 9.75003V4.33336C0 4.03382 0.242667 3.79169 0.541667 3.79169C0.840667 3.79169 1.08333 4.03382 1.08333 4.33336V9.75003C1.08333 10.6459 1.81242 11.375 2.70833 11.375H10.2917C10.5912 11.375 10.8333 11.6172 10.8333 11.9167Z" fill="white"/></g><defs><clipPath id="clip0_2_92"><rect width="13" height="13" fill="white"/></clipPath></defs></svg>`
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
        icon: `<svg width="13" height="13" viewBox="0 0 13 13" fill="white" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2_94)"><path d="M8.06057 9.20832C7.9219 9.20832 7.78324 9.15524 7.67761 9.04961C7.46582 8.83782 7.46582 8.49549 7.67761 8.2837L9.05128 6.91003C9.26253 6.69878 9.26253 6.35536 9.05128 6.14411L7.62344 4.71628C7.41165 4.50449 7.41165 4.16161 7.62344 3.95036C7.83524 3.73857 8.17757 3.73857 8.38936 3.95036L9.81719 5.3782C10.1232 5.68424 10.2917 6.09211 10.2917 6.52707C10.2917 6.96203 10.1227 7.3699 9.81719 7.67595L8.44353 9.04961C8.3379 9.15524 8.19923 9.20832 8.06057 9.20832ZM13 10.2917V6.68415C13 3.1747 10.3437 0.245904 6.95286 0.0156961C5.07219 -0.112679 3.2289 0.576321 1.90074 1.9072C0.572568 3.23699 -0.114265 5.07974 0.0162766 6.96257C0.25461 10.4043 3.29444 13 7.08719 13H10.2922C11.7856 13 13.0006 11.785 13.0006 10.2917H13ZM6.87974 1.09632C9.70453 1.28807 11.9167 3.74236 11.9167 6.68415V10.2917C11.9167 11.1876 11.1876 11.9167 10.2917 11.9167H7.08665C3.81769 11.9167 1.2984 9.80145 1.09636 6.88728C0.987485 5.31699 1.55948 3.78082 2.66665 2.67203C3.68607 1.65153 5.06894 1.08332 6.50761 1.08332C6.63111 1.08332 6.75515 1.08711 6.87919 1.09578L6.87974 1.09632ZM5.32244 9.04961C5.53424 8.83836 5.53424 8.49549 5.32244 8.2837L3.94932 6.91003C3.73807 6.69878 3.73807 6.35536 3.94932 6.14411L5.37715 4.71628C5.58894 4.50449 5.58894 4.16161 5.37715 3.95036C5.16536 3.73857 4.82303 3.73857 4.61123 3.95036L3.1834 5.3782C2.87736 5.68424 2.7089 6.09211 2.7089 6.52707C2.7089 6.96203 2.8779 7.3699 3.1834 7.67595L4.55653 9.04961C4.66215 9.15524 4.80082 9.20832 4.93949 9.20832C5.07815 9.20832 5.21682 9.15524 5.32244 9.04961Z" fill="white"/></g><defs><clipPath id="clip0_2_94"><rect width="13" height="13" fill="white"/></clipPath></defs></svg>`
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

  // Invoices
  await createCoreEntity(
      {
        name: "invoice",
        slug: "invoices",
        title: "Invoice",
        titlePlural: "Invoices",
        prefix: "INVOICE",
        icon: `<svg width="13" height="13" viewBox="0 0 13 13" fill="white" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2_98)"><path d="M11.4589 1.77233L10.2218 0.494542C10.0698 0.338523 9.88827 0.214413 9.68773 0.129492C9.48719 0.0445696 9.27172 0.00054515 9.05394 0L6.49998 0C5.87587 0.000787867 5.27111 0.216715 4.78764 0.611389C4.30416 1.00606 3.97153 1.55535 3.84581 2.16667H3.79165C3.07362 2.16753 2.38524 2.45314 1.87752 2.96087C1.36979 3.46859 1.08417 4.15697 1.08331 4.875V10.2917C1.08417 11.0097 1.36979 11.6981 1.87752 12.2058C2.38524 12.7135 3.07362 12.9991 3.79165 13H7.04165C7.75968 12.9991 8.44805 12.7135 8.95578 12.2058C9.4635 11.6981 9.74912 11.0097 9.74998 10.2917V10.2375C10.3613 10.1118 10.9106 9.77915 11.3053 9.29568C11.6999 8.8122 11.9159 8.20745 11.9166 7.58333V2.90333C11.9175 2.48106 11.7532 2.07519 11.4589 1.77233ZM7.04165 11.9167H3.79165C3.36067 11.9167 2.94734 11.7455 2.6426 11.4407C2.33785 11.136 2.16665 10.7226 2.16665 10.2917V4.875C2.16665 4.44402 2.33785 4.0307 2.6426 3.72595C2.94734 3.42121 3.36067 3.25 3.79165 3.25V7.58333C3.79251 8.30136 4.07812 8.98974 4.58585 9.49747C5.09357 10.0052 5.78195 10.2908 6.49998 10.2917H8.66665C8.66665 10.7226 8.49544 11.136 8.1907 11.4407C7.88595 11.7455 7.47262 11.9167 7.04165 11.9167ZM9.20831 9.20833H6.49998C6.069 9.20833 5.65568 9.03713 5.35093 8.73238C5.04618 8.42764 4.87498 8.01431 4.87498 7.58333V2.70833C4.87498 2.27736 5.04618 1.86403 5.35093 1.55928C5.65568 1.25454 6.069 1.08333 6.49998 1.08333H8.66665V2.16667C8.66665 2.45398 8.78078 2.72953 8.98395 2.9327C9.18711 3.13586 9.46266 3.25 9.74998 3.25H10.8333V7.58333C10.8333 8.01431 10.6621 8.42764 10.3574 8.73238C10.0526 9.03713 9.63929 9.20833 9.20831 9.20833Z" fill="white"/></g><defs><clipPath id="clip0_2_98"><rect width="13" height="13" fill="white"/></clipPath></defs></svg>`,
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
            { name: PropertyAttributeName.Max, value: "1" },
            { name: PropertyAttributeName.HelpText, value: "Invoice file (.pdf)" }
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
        icon: `<svg width="13" height="13" viewBox="0 0 13 13" fill="white" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2_96)"><path d="M2.16642 3.24999C1.95287 3.25055 1.74133 3.20876 1.54403 3.12703C1.34674 3.04531 1.16761 2.92527 1.017 2.77386L0.18067 2.02961C0.0733566 1.93394 0.00844609 1.79955 0.000217932 1.65601C-0.00801023 1.51248 0.0411179 1.37155 0.136795 1.26424C0.232472 1.15693 0.36686 1.09202 0.510395 1.08379C0.653931 1.07556 0.794857 1.12469 0.90217 1.22036L1.76071 1.98628C1.80986 2.04147 1.86978 2.08603 1.93679 2.1172C2.00381 2.14836 2.07649 2.16549 2.15036 2.16752C2.22424 2.16955 2.29775 2.15644 2.36637 2.129C2.43499 2.10155 2.49727 2.06036 2.54938 2.00795L4.50154 0.149489C4.60652 0.0560354 4.7437 0.00704095 4.88413 0.0128541C5.02455 0.0186673 5.15722 0.0788329 5.25411 0.180643C5.35099 0.282453 5.40452 0.417936 5.40337 0.558475C5.40222 0.699014 5.3465 0.833606 5.24796 0.933822L3.30392 2.78307C3.1543 2.93182 2.97682 3.04963 2.78164 3.12974C2.58646 3.20986 2.3774 3.25072 2.16642 3.24999ZM12.9998 2.16666C12.9998 2.023 12.9427 1.88522 12.8411 1.78364C12.7395 1.68206 12.6017 1.62499 12.4581 1.62499H7.04142C6.89776 1.62499 6.75999 1.68206 6.6584 1.78364C6.55682 1.88522 6.49975 2.023 6.49975 2.16666C6.49975 2.31031 6.55682 2.44809 6.6584 2.54967C6.75999 2.65125 6.89776 2.70832 7.04142 2.70832H12.4581C12.6017 2.70832 12.7395 2.65125 12.8411 2.54967C12.9427 2.44809 12.9998 2.31031 12.9998 2.16666ZM3.30392 7.11641L5.24796 5.26716C5.30222 5.21885 5.34621 5.16012 5.37731 5.09447C5.40841 5.02881 5.42598 4.95758 5.42899 4.88499C5.43199 4.81241 5.42037 4.73996 5.3948 4.67196C5.36923 4.60396 5.33025 4.5418 5.28017 4.48917C5.23009 4.43655 5.16993 4.39453 5.10328 4.36563C5.03663 4.33673 4.96485 4.32153 4.8922 4.32094C4.81956 4.32035 4.74754 4.33437 4.68042 4.36218C4.61331 4.38999 4.55248 4.43102 4.50154 4.48282L2.55154 6.34128C2.44843 6.43988 2.31126 6.49491 2.16859 6.49491C2.02592 6.49491 1.88874 6.43988 1.78563 6.34128L0.924378 5.48274C0.822219 5.38407 0.685392 5.32947 0.543369 5.33071C0.401346 5.33194 0.265489 5.38891 0.16506 5.48934C0.0646303 5.58977 0.00766382 5.72562 0.00642968 5.86765C0.00519554 6.00967 0.0597925 6.1465 0.158461 6.24866L1.017 7.1072C1.32016 7.41042 1.73087 7.58154 2.15965 7.58327C2.58842 7.58499 3.0005 7.41718 3.30609 7.11641H3.30392ZM12.9998 6.49999C12.9998 6.35633 12.9427 6.21855 12.8411 6.11697C12.7395 6.01539 12.6017 5.95832 12.4581 5.95832H7.04142C6.89776 5.95832 6.75999 6.01539 6.6584 6.11697C6.55682 6.21855 6.49975 6.35633 6.49975 6.49999C6.49975 6.64365 6.55682 6.78142 6.6584 6.88301C6.75999 6.98459 6.89776 7.04166 7.04142 7.04166H12.4581C12.6017 7.04166 12.7395 6.98459 12.8411 6.88301C12.9427 6.78142 12.9998 6.64365 12.9998 6.49999ZM3.30392 11.4497L5.2458 9.60049C5.30006 9.55218 5.34404 9.49346 5.37514 9.4278C5.40624 9.36215 5.42382 9.29091 5.42682 9.21833C5.42983 9.14574 5.4182 9.07329 5.39263 9.00529C5.36707 8.93729 5.32808 8.87513 5.278 8.82251C5.22792 8.76988 5.16776 8.72787 5.10111 8.69897C5.03446 8.67006 4.96268 8.65486 4.89004 8.65427C4.81739 8.65368 4.74537 8.66771 4.67826 8.69552C4.61114 8.72333 4.55031 8.76435 4.49938 8.81616L2.54938 10.6746C2.49727 10.727 2.43499 10.7682 2.36637 10.7957C2.29775 10.8231 2.22424 10.8362 2.15036 10.8342C2.07649 10.8322 2.00381 10.815 1.93679 10.7839C1.86978 10.7527 1.80986 10.7081 1.76071 10.6529L0.90217 9.88703C0.794857 9.79135 0.653931 9.74223 0.510395 9.75045C0.36686 9.75868 0.232472 9.82359 0.136795 9.93091C0.0411179 10.0382 -0.00801023 10.1791 0.000217932 10.3227C0.00844609 10.4662 0.0733566 10.6006 0.18067 10.6963L1.017 11.4405C1.32016 11.7438 1.73087 11.9149 2.15965 11.9166C2.58842 11.9183 3.0005 11.7505 3.30609 11.4497H3.30392ZM12.9998 10.8333C12.9998 10.6897 12.9427 10.5519 12.8411 10.4503C12.7395 10.3487 12.6017 10.2917 12.4581 10.2917H7.04142C6.89776 10.2917 6.75999 10.3487 6.6584 10.4503C6.55682 10.5519 6.49975 10.6897 6.49975 10.8333C6.49975 10.977 6.55682 11.1148 6.6584 11.2163C6.75999 11.3179 6.89776 11.375 7.04142 11.375H12.4581C12.6017 11.375 12.7395 11.3179 12.8411 11.2163C12.9427 11.1148 12.9998 10.977 12.9998 10.8333Z" fill="white"/></g><defs><clipPath id="clip0_2_96"><rect width="13" height="13" fill="white"/></clipPath></defs></svg>`
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
            { name: PropertyAttributeName.Max, value: "10" },
            { name: PropertyAttributeName.HelpText, value: "10 files max" }
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
