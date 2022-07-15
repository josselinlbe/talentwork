import { LinkedAccount, User } from "@prisma/client";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import { createCoreEntity, createEntity, getEntityByName, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createProperties, CreatePropertyDto } from "~/utils/db/entities/properties.db.server";
import { createRow, getRow } from "~/utils/db/entities/rows.db.server";
import { createManualRowLog } from "~/utils/db/logs.db.server";

export async function seedSampleEntities(tenant1And2Relationship: LinkedAccount, user1: User, seedAttributeEntities = false) {
  await createSampleEntity_Employees(tenant1And2Relationship.providerTenantId, user1.id);

  if (seedAttributeEntities) {
    // Text attributes
    await createCoreEntity(
      {
        name: "text-attribute-test",
        slug: "text-attribute-tests",
        title: "Text Attribute Test",
        titlePlural: "Text Attribute Tests",
        prefix: "TXT",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
      },
      [
        {
          name: "textWithPattern",
          title: "Text with pattern (email)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$" },
        },
        {
          name: "textWithMinLength",
          title: "Text with Min length (9)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { min: 9 },
        },
        {
          name: "textWithMaxLength",
          title: "Text with Max length (10)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { max: 10 },
        },
        {
          name: "textWithDefaultValue",
          title: "Text with Default Value (Abc123)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { defaultValue: "Abc123" },
        },
        {
          name: "textWithHintText",
          title: "Text with Hint Text (Hi)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { hintText: "Hi" },
        },
        {
          name: "textWithHelpText",
          title: "Text with Help Text (Hello)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { helpText: "Hello" },
        },
        {
          name: "textWithPlaceholder",
          title: "Text with Placeholder (Type your name...)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { placeholder: "Type your name..." },
        },
        {
          name: "textWithIcon",
          title: "Text with Icon",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
          },
        },
        {
          name: "textWithRows",
          title: "Text with Rows (2)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { rows: 2 },
        },
        {
          name: "textAsUppercase",
          title: "Text as Uppercase",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { uppercase: true },
        },
        {
          name: "textAsLowercase",
          title: "Text as Lowercase",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: { lowercase: true },
        },
      ]
    );

    // Number attributes
    await createCoreEntity(
      {
        name: "number-attribute-test",
        slug: "number-attribute-tests",
        title: "Number Attribute Test",
        titlePlural: "Number Attribute Tests",
        prefix: "NUM",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
      },
      [
        {
          name: "numberWithMin",
          title: "Number with Min (11)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: { min: 11 },
        },
        {
          name: "numberWithMax",
          title: "Number with Max (12)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: { max: 12 },
        },
        {
          name: "numberWithDefaultValue",
          title: "Number with Default Value (6)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: { defaultValue: "6" },
        },
        {
          name: "numberWithHintText",
          title: "Number with Hint Text (Hi)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: { hintText: "Hi" },
        },
        {
          name: "numberWithHelpText",
          title: "Number with Help Text (Hello)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: { helpText: "Hello" },
        },
        {
          name: "numberWithPlaceholder",
          title: "Number with Placeholder (Type your age 😉)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: { placeholder: "Type your age 😉" },
        },
        {
          name: "numberWithIcon",
          title: "Number with Icon",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
          },
        },
      ]
    );

    // Date attributes
    await createCoreEntity(
      {
        name: "date-attribute-test",
        slug: "date-attribute-tests",
        title: "Date Attribute Test",
        titlePlural: "Date Attribute Tests",
        prefix: "DAT",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
      },
      [
        {
          name: "dateWithHintText",
          title: "Date with Hint Text (Hi)",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: { hintText: "Hi" },
        },
        {
          name: "dateWithHelpText",
          title: "Date with Help Text (Hello)",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: { helpText: "Hello" },
        },
        {
          name: "dateWithIcon",
          title: "Date with Icon",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
          },
        },
      ]
    );

    // Select attributes
    await createCoreEntity(
      {
        name: "select-attribute-test",
        slug: "select-attribute-tests",
        title: "Select Attribute Test",
        titlePlural: "Select Attribute Tests",
        prefix: "SLT",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
      },
      [
        {
          name: "selectWithDefaultValue",
          title: "Select with Default Value (Option 2)",
          type: PropertyType.SELECT,
          isDynamic: true,
          options: [
            { order: 1, value: "1", name: "Option 1", color: Colors.BLUE },
            { order: 2, value: "2", name: "Option 2", color: Colors.RED },
          ],
          attributes: { defaultValue: "2" },
        },
        {
          name: "selectWithHintText",
          title: "Select with Hint Text (Hi)",
          type: PropertyType.SELECT,
          isDynamic: true,
          options: [
            { order: 1, value: "1", name: "Option 1", color: Colors.BLUE },
            { order: 2, value: "2", name: "Option 2", color: Colors.RED },
          ],
          attributes: { hintText: "Hi" },
        },
        {
          name: "selectWithHelpText",
          title: "Select with Help Text (Hello)",
          type: PropertyType.SELECT,
          isDynamic: true,
          options: [
            { order: 1, value: "1", name: "Option 1", color: Colors.BLUE },
            { order: 2, value: "2", name: "Option 2", color: Colors.RED },
          ],
          attributes: { helpText: "Hello" },
        },
        {
          name: "selectWithPlaceholder",
          title: "Select with Placeholder (Select one...)",
          type: PropertyType.SELECT,
          isDynamic: true,
          options: [
            { order: 1, value: "1", name: "Option 1", color: Colors.BLUE },
            { order: 2, value: "2", name: "Option 2", color: Colors.RED },
          ],
          attributes: { placeholder: "Select one..." },
        },
        {
          name: "selectWithIcon",
          title: "Select with Icon",
          type: PropertyType.SELECT,
          isDynamic: true,
          options: [
            { order: 1, value: "1", name: "Option 1", color: Colors.BLUE },
            { order: 2, value: "2", name: "Option 2", color: Colors.RED },
          ],
          attributes: {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
          },
        },
      ]
    );

    // Boolean attributes
    await createCoreEntity(
      {
        name: "boolean-attribute-test",
        slug: "boolean-attribute-tests",
        title: "Boolean Attribute Test",
        titlePlural: "Boolean Attribute Tests",
        prefix: "BOO",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
      },
      [
        {
          name: "booleanWithDefaultValue",
          title: "Boolean with Default Value (true)",
          type: PropertyType.BOOLEAN,
          isDynamic: true,
          attributes: { defaultValue: "true" },
        },
        {
          name: "booleanWithHintText",
          title: "Boolean with Hint Text (Hi)",
          type: PropertyType.BOOLEAN,
          isDynamic: true,
          attributes: { hintText: "Hi" },
        },
        {
          name: "booleanWithHelpText",
          title: "Boolean with Help Text (Hello)",
          type: PropertyType.BOOLEAN,
          isDynamic: true,
          attributes: { helpText: "Hello" },
        },
      ]
    );

    // Media attributes
    await createCoreEntity(
      {
        name: "media-attribute-test",
        slug: "media-attribute-tests",
        title: "Media Attribute Test",
        titlePlural: "Media Attribute Tests",
        prefix: "MED",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
      },
      [
        {
          name: "mediaWithMinLength",
          title: "Media with Min files (2)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: { min: 2 },
        },
        {
          name: "mediaWithMaxLength",
          title: "Media with Max files (3)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: { max: 3 },
        },
        {
          name: "mediaWithAccepFileTypes",
          title: "Media with Accept File Types (images)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: { acceptFileTypes: "image/png, image/gif, image/jpeg" },
        },
        {
          name: "mediaWithMaxSize",
          title: "Media with Max File Size (5 MB)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: { maxSize: 5 },
        },
        {
          name: "mediaWithHintText",
          title: "Media with Hint Text (Hi)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: { hintText: "Hi" },
        },
        {
          name: "mediaWithHelpText",
          title: "Media with Help Text (Hello)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: { helpText: "Hello" },
        },
      ]
    );
  }
}

async function createSampleEntity_Employees(tenantId: string, createdByUserId: string) {
  await createEntity({
    name: "employee",
    slug: "employees",
    prefix: "EMP",
    title: "models.employee.object",
    titlePlural: "models.employee.plural",
    isFeature: true,
    isAutogenerated: true,
    isDefault: false,
    hasApi: true,
    requiresLinkedAccounts: false,
    icon: `<svg width="36" height="36" viewBox="0 0 36 36" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M10.2007 27.1498H5.25072C4.95072 27.1498 4.80072 26.9998 4.65072 26.8498C4.50072 26.6998 4.35072 26.3998 4.50072 26.0998C5.40072 23.5498 7.65072 22.0498 10.2007 22.0498C13.3507 22.0498 15.9007 19.3498 15.9007 16.1998C15.9007 13.0498 13.3507 10.0498 10.2007 10.0498C7.05072 10.0498 4.50072 12.7498 4.50072 16.0498C4.50072 17.5498 5.10072 19.0498 6.00072 20.0998C4.05072 21.1498 2.55072 22.7998 1.65072 25.0498C1.35072 26.0998 1.50072 27.4498 2.25072 28.4998C3.00072 29.5498 4.05072 30.1498 5.25072 30.1498H10.2007C11.1007 30.1498 11.7007 29.5498 11.7007 28.6498C11.7007 27.7498 11.1007 27.1498 10.2007 27.1498ZM7.50072 16.0498C7.50072 14.3998 8.70072 13.1998 10.2007 13.1998C11.7007 13.1998 12.9007 14.5498 12.9007 16.0498C12.9007 17.6998 11.7007 18.8998 10.2007 18.8998C8.70072 18.8998 7.50072 17.5498 7.50072 16.0498Z" fill="white"/><path d="M34.3508 24.1496C33.3008 21.2996 31.2008 19.1996 28.8008 17.9996C30.1508 16.7996 30.9008 14.9996 30.9008 12.8996C30.9008 8.99961 27.9008 5.84961 24.3008 5.84961C20.7008 5.84961 17.7008 8.99961 17.7008 12.8996C17.7008 14.8496 18.4508 16.6496 19.8008 17.9996C17.4008 19.1996 15.3008 21.2996 14.2508 24.1496C13.5008 25.4996 13.8008 26.9996 14.5508 28.1996C15.3008 29.3996 16.6508 29.9996 18.0008 29.9996H30.4508C31.8008 29.9996 33.1508 29.2496 33.9008 28.1996C34.8008 26.9996 34.9508 25.4996 34.3508 24.1496ZM20.5508 13.0496C20.5508 10.7996 22.2008 8.99961 24.1508 8.99961C26.1008 8.99961 27.7508 10.7996 27.7508 13.0496C27.7508 15.2996 26.1008 17.0996 24.1508 17.0996C22.2008 17.0996 20.5508 15.1496 20.5508 13.0496ZM31.3508 26.5496C31.2008 26.6996 30.9008 27.1496 30.4508 27.1496H18.0008C17.4008 27.1496 17.1008 26.6996 17.1008 26.5496C16.9508 26.3996 16.6508 25.7996 16.9508 25.1996C18.1508 22.0496 21.1508 19.9496 24.3008 19.9496C27.4508 19.9496 30.4508 22.0496 31.6508 25.1996C31.8008 25.7996 31.5008 26.3996 31.3508 26.5496Z" fill="white"/></svg>`,
    active: true,
    hasTags: true,
    hasComments: true,
    hasTasks: true,
    hasWorkflow: true,
    defaultVisibility: Visibility.Tenant,
  });
  const employeesEntity = await getEntityByName("employee");
  if (!employeesEntity) {
    throw new Error("Could not get entity with name: employee");
  }
  const fields: CreatePropertyDto[] = [
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
      attributes: {
        pattern: "[a-zA-Z0-9._%+-]+@[a-z0-9.-]+.[a-zA-Z]{2,4}",
      },
    },
    {
      name: "salary",
      title: "Salary",
      type: PropertyType.NUMBER,
      isDynamic: true,
    },
    {
      name: "status",
      title: "Status",
      type: PropertyType.SELECT,
      isDynamic: true,
      options: [
        { order: 1, value: "Active", color: Colors.GREEN },
        { order: 2, value: "On Leave", color: Colors.YELLOW },
        { order: 3, value: "Dismissed", color: Colors.GRAY },
      ],
    },
  ];

  const properties = await createProperties(employeesEntity.id, fields);
  const firstNameProperty = properties.find((f) => f.name === "firstName");
  const lastNameProperty = properties.find((f) => f.name === "lastName");
  const emailProperty = properties.find((f) => f.name === "email");
  const salaryProperty = properties.find((f) => f.name === "salary");
  const statusProperty = properties.find((f) => f.name === "status");

  const employee1 = await createRow({
    entityId: employeesEntity.id,
    tenantId,
    createdByUserId,
    linkedAccountId: null,
    dynamicProperties: [
      {
        propertyId: firstNameProperty?.id ?? "",
        textValue: "David",
      },
      {
        propertyId: lastNameProperty?.id ?? "",
        textValue: "N. Crowell",
      },
      {
        propertyId: emailProperty?.id ?? "",
        textValue: "davidn.crowell@dayrep.com",
      },
      {
        propertyId: salaryProperty?.id ?? "",
        numberValue: 100,
      },
      {
        propertyId: statusProperty?.id ?? "",
        textValue: "Active",
      },
    ],
    properties: null,
    dynamicRows: [],
  });
  const employee1Item = await getRow(employeesEntity.id, employee1.id, tenantId);
  await createManualRowLog({ tenantId, createdByUserId, action: DefaultLogActions.Created, entity: employeesEntity, item: employee1Item });

  // So both employees have different createdAt value
  await new Promise((r) => setTimeout(r, 1000));

  const employee2 = await createRow({
    entityId: employeesEntity.id,
    tenantId,
    createdByUserId,
    linkedAccountId: null,
    dynamicProperties: [
      {
        propertyId: firstNameProperty?.id ?? "",
        textValue: "Sonny",
      },
      {
        propertyId: lastNameProperty?.id ?? "",
        textValue: "L. Hill",
      },
      {
        propertyId: emailProperty?.id ?? "",
        textValue: "sonnyl.hill@rhyta.com",
      },
      {
        propertyId: salaryProperty?.id ?? "",
        numberValue: 200,
      },
      {
        propertyId: statusProperty?.id ?? "",
        textValue: "On Leave",
      },
    ],
    properties: null,
    dynamicRows: [],
  });
  const employee2Item = await getRow(employeesEntity.id, employee2.id, tenantId);
  await createManualRowLog({ tenantId, createdByUserId, action: DefaultLogActions.Created, entity: employeesEntity, item: employee2Item });

  return {
    employeesEntity: await getEntityBySlug("employees"),
    employees: [await getRow(employeesEntity.id, employee1.id, tenantId), await getRow(employeesEntity.id, employee2.id, tenantId)],
  };
}
