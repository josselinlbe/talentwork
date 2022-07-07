import { Visibility } from "~/application/dtos/shared/Visibility";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import { createContact, getContactByEmail } from "~/utils/db/crm/contacts.db.server";
import { createDeal } from "~/utils/db/crm/deals.db.server";
import getMaxEntityOrder, { createEntity } from "~/utils/db/entities/entities.db.server";
import { createProperties } from "~/utils/db/entities/properties.db.server";
import { getUserByEmail } from "~/utils/db/users.db.server";
import { getWorkflowStates } from "~/utils/db/workflows/workflowStates.db.server";
import { setRowInitialWorkflowState, updateRowWorkflowState } from "~/utils/services/WorkflowService";

export async function seedCrm() {
  await createEntity_Contact();
  await createEntity_Deal();
}

async function createEntity_Contact() {
  const adminUser = await getUserByEmail(process.env.ADMIN_EMAIL);
  if (!adminUser) {
    throw new Error("No admin user seeded with email: " + process.env.ADMIN_EMAIL);
  }
  const maxOrder = await getMaxEntityOrder();
  const entity = await createEntity({
    name: "contact",
    slug: "contacts",
    prefix: "CTC",
    title: "Contact",
    titlePlural: "Contacts",
    isFeature: false,
    isAutogenerated: false,
    hasApi: false,
    requiresLinkedAccounts: false,
    isDefault: true,
    icon: ``,
    active: true,
    hasTags: true,
    hasComments: true,
    hasTasks: true,
    hasWorkflow: false,
    defaultVisibility: Visibility.Private,
  });

  await createProperties(entity.id, [
    {
      name: "status",
      title: "models.contact.status",
      type: PropertyType.SELECT,
      isDynamic: false,
      isRequired: true,
      isDefault: true,
      options: [
        { order: 1, value: "Lead", color: Colors.YELLOW },
        { order: 2, value: "Prospect", color: Colors.INDIGO },
        { order: 3, value: "Customer", color: Colors.GREEN },
        { order: 4, value: "Partner", color: Colors.VIOLET },
      ],
    },
    {
      name: "email",
      title: "models.contact.email",
      type: PropertyType.TEXT,
      isDynamic: false,
      isRequired: true,
      isDefault: true,
    },
    {
      name: "firstName",
      title: "models.contact.firstName",
      type: PropertyType.TEXT,
      isDynamic: false,
      isRequired: true,
      isDefault: true,
    },
    {
      name: "lastName",
      title: "models.contact.lastName",
      type: PropertyType.TEXT,
      isDynamic: false,
      isRequired: true,
      isDefault: true,
    },
    {
      name: "phone",
      title: "models.contact.phone",
      type: PropertyType.TEXT,
      isDynamic: false,
      isRequired: false,
      isDefault: true,
    },
    {
      name: "company",
      title: "models.contact.company",
      type: PropertyType.TEXT,
      isDynamic: false,
      isRequired: false,
      isDefault: true,
    },
    {
      name: "title",
      title: "models.contact.title",
      type: PropertyType.TEXT,
      isDynamic: false,
      isRequired: false,
      isDefault: true,
    },
  ]);

  await createContact(adminUser.id, {
    status: "Partner",
    email: "joanj.fisher@teleworm.us",
    firstName: "Joan",
    lastName: "J. Fisher",
    phone: "808-885-1423",
    company: "Teleworm",
    title: "Software Engineer",
  });

  await createContact(adminUser.id, {
    status: "Customer",
    email: "john.doe@company.com",
    firstName: "John",
    lastName: "Doe",
    phone: "",
    company: "Acme Corp 10",
    title: "Product Manager",
  });

  await createContact(adminUser.id, {
    status: "Customer",
    email: "wadeb.landis@rhyta.com",
    firstName: "Wade",
    lastName: "B. Landis",
    phone: "801-841-5765",
    company: "RHYTA",
    title: "Marketing Manager",
  });

  await createContact(adminUser.id, {
    status: "Lead",
    email: "luna.davis@company.com",
    firstName: "Luna",
    lastName: "Davis",
    phone: "",
    company: "Acme Corp 12",
    title: "Developer",
  });

  return entity;
}

async function createEntity_Deal() {
  const adminUser = await getUserByEmail(process.env.ADMIN_EMAIL);
  if (!adminUser) {
    throw new Error("No admin user seeded with email: " + process.env.ADMIN_EMAIL);
  }
  const maxOrder = await getMaxEntityOrder();
  const entity = await createEntity({
    name: "deal",
    slug: "deals",
    prefix: "DL",
    title: "Deal",
    titlePlural: "Deals",
    isFeature: false,
    isAutogenerated: false,
    hasApi: false,
    requiresLinkedAccounts: false,
    isDefault: true,
    icon: ``,
    active: true,
    hasTags: true,
    hasComments: true,
    hasTasks: true,
    hasWorkflow: true,
    defaultVisibility: Visibility.Private,
  });

  // const contactEntity = await getEntityByName("contact");
  // await seedProperties(entity, [
  //   {
  //     name: "contactId",
  //     title: "models.contact.plural",
  //     type: PropertyType.ENTITY,
  //     isDynamic: false,
  //     isRequired: true,
  //     parentId: contactEntity?.properties.find((f) => f.name === "id")?.id ?? null,
  //   },
  //   {
  //     name: "name",
  //     title: "models.deal.name",
  //     type: PropertyType.TEXT,
  //     isDynamic: false,
  //     isRequired: true,
  //   },
  //   {
  //     name: "value",
  //     title: "models.deal.value",
  //     type: PropertyType.NUMBER,
  //     isDynamic: false,
  //     isRequired: true,
  //   },
  //   {
  //     name: "subscriptionPriceId",
  //     title: "models.deal.subscriptionPrice",
  //     type: PropertyType.TEXT,
  //     isDynamic: false,
  //     isRequired: true,
  //     isHidden: true,
  //   },
  // ]);

  const contact1 = await getContactByEmail("john.doe@company.com");
  const deal1 = await createDeal(adminUser.id, {
    contactId: contact1?.id ?? "",
    name: "Deal with John Doe",
    value: 2500,
    subscriptionPriceId: null,
  });
  await setRowInitialWorkflowState(entity?.id ?? "", deal1.rowId);

  const contact2 = await getContactByEmail("luna.davis@company.com");
  const deal2 = await createDeal(adminUser.id, {
    contactId: contact2?.id ?? "",
    name: "Deal with Luna Davis",
    value: 4000,
    subscriptionPriceId: null,
  });
  await setRowInitialWorkflowState(entity?.id ?? "", deal2.rowId);

  const workflowStates = await getWorkflowStates(entity.id);
  const pendingState = workflowStates.find((f) => f.title === "Completed");
  if (pendingState) {
    await updateRowWorkflowState(deal2.rowId, pendingState.id);
  }
  return entity;
}
