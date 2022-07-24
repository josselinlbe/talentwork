import { LinkedAccount, User } from "@prisma/client";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import { createCoreEntity, createEntity, getEntityByName, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createProperties, CreatePropertyDto } from "~/utils/db/entities/properties.db.server";
import { createRow } from "~/utils/db/entities/rows.db.server";
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
          attributes: [{ name: PropertyAttributeName.Pattern, value: "[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$" }],
        },
        {
          name: "textWithMinLength",
          title: "Text with Min length (9)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Min, value: "9" }],
        },
        {
          name: "textWithMaxLength",
          title: "Text with Max length (10)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Max, value: "10" }],
        },
        {
          name: "textWithDefaultValue",
          title: "Text with Default Value (Abc123)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.DefaultValue, value: "Abc123" }],
        },
        {
          name: "textWithHintText",
          title: "Text with Hint Text (Hi)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HintText, value: "Hi" }],
        },
        {
          name: "textWithHelpText",
          title: "Text with Help Text (Hello)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HelpText, value: "Hello" }],
        },
        {
          name: "textWithPlaceholder",
          title: "Text with Placeholder (Type your name...)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Placeholder, value: "Type your name..." }],
        },
        {
          name: "textWithIcon",
          title: "Text with Icon",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [
            {
              name: PropertyAttributeName.Icon,
              value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
            },
          ],
        },
        {
          name: "textWithRows",
          title: "Text with Rows (2)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Rows, value: "2" }],
        },
        {
          name: "textAsUppercase",
          title: "Text as Uppercase",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Uppercase, value: "true" }],
        },
        {
          name: "textAsLowercase",
          title: "Text as Lowercase",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Lowercase, value: "true" }],
        },
        {
          name: "textWithEditorTypeScript",
          title: "Text with Editor (monaco-typescript)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.Editor, value: "monaco" },
            { name: PropertyAttributeName.EditorLanguage, value: "typescript" },
          ],
        },
        {
          name: "textWithEditorMarkdown",
          title: "Text with Editor (monaco-markdown)",
          type: PropertyType.TEXT,
          isDynamic: true,
          attributes: [
            { name: PropertyAttributeName.Editor, value: "monaco" },
            { name: PropertyAttributeName.EditorLanguage, value: "markdown" },
          ],
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
          name: "numberWithStep",
          title: "Number with Step (0.01)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Step, value: "0.01" }],
        },
        {
          name: "numberWithMin",
          title: "Number with Min (11)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Min, value: "11" }],
        },
        {
          name: "numberWithMax",
          title: "Number with Max (12)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Max, value: "12" }],
        },
        {
          name: "numberWithDefaultValue",
          title: "Number with Default Value (6)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.DefaultValue, value: "6" }],
        },
        {
          name: "numberWithHintText",
          title: "Number with Hint Text (Hi)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HintText, value: "Hi" }],
        },
        {
          name: "numberWithHelpText",
          title: "Number with Help Text (Hello)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HelpText, value: "Hello" }],
        },
        {
          name: "numberWithPlaceholder",
          title: "Number with Placeholder (Type your age 😉)",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Placeholder, value: "Type your age 😉" }],
        },
        {
          name: "numberWithIcon",
          title: "Number with Icon",
          type: PropertyType.NUMBER,
          isDynamic: true,
          attributes: [
            {
              name: PropertyAttributeName.Icon,
              value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
            },
          ],
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
          attributes: [{ name: PropertyAttributeName.HintText, value: "Hi" }],
        },
        {
          name: "dateWithHelpText",
          title: "Date with Help Text (Hello)",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HelpText, value: "Hello" }],
        },
        {
          name: "dateWithIcon",
          title: "Date with Icon",
          type: PropertyType.DATE,
          isDynamic: true,
          attributes: [
            {
              name: PropertyAttributeName.Icon,
              value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
            },
          ],
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
          attributes: [{ name: PropertyAttributeName.DefaultValue, value: `2` }],
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
          attributes: [{ name: PropertyAttributeName.HintText, value: "Hi" }],
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
          attributes: [{ name: PropertyAttributeName.HelpText, value: "Hello" }],
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
          attributes: [{ name: PropertyAttributeName.Placeholder, value: `Select one...` }],
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
          attributes: [
            {
              name: PropertyAttributeName.Icon,
              value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clip-rule="evenodd" /> </svg>`,
            },
          ],
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
          attributes: [{ name: PropertyAttributeName.DefaultValue, value: `true` }],
        },
        {
          name: "booleanWithHintText",
          title: "Boolean with Hint Text (Hi)",
          type: PropertyType.BOOLEAN,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HintText, value: "Hi" }],
        },
        {
          name: "booleanWithHelpText",
          title: "Boolean with Help Text (Hello)",
          type: PropertyType.BOOLEAN,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HelpText, value: "Hello" }],
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
          attributes: [{ name: PropertyAttributeName.Min, value: `2` }],
        },
        {
          name: "mediaWithMaxLength",
          title: "Media with Max files (3)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.Max, value: `3` }],
        },
        {
          name: "mediaWithAccepFileTypes",
          title: "Media with Accept File Types (images)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.AcceptFileTypes, value: `image/png, image/gif, image/jpeg` }],
        },
        {
          name: "mediaWithMaxSize",
          title: "Media with Max File Size (5 MB)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.MaxSize, value: `5` }],
        },
        {
          name: "mediaWithHintText",
          title: "Media with Hint Text (Hi)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HintText, value: "Hi" }],
        },
        {
          name: "mediaWithHelpText",
          title: "Media with Help Text (Hello)",
          type: PropertyType.MEDIA,
          isDynamic: true,
          attributes: [{ name: PropertyAttributeName.HelpText, value: "Hello" }],
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
    icon: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2_90)"><path d="M4.0625 7.04167C3.58041 7.04167 3.10914 6.89871 2.7083 6.63088C2.30745 6.36304 1.99503 5.98235 1.81054 5.53696C1.62606 5.09156 1.57778 4.60146 1.67184 4.12864C1.76589 3.65581 1.99804 3.22149 2.33893 2.88059C2.67982 2.5397 3.11414 2.30756 3.58697 2.2135C4.0598 2.11945 4.5499 2.16772 4.99529 2.35221C5.44069 2.5367 5.82137 2.84912 6.08921 3.24997C6.35704 3.65081 6.5 4.12208 6.5 4.60417C6.49928 5.25041 6.24225 5.86998 5.78528 6.32695C5.32832 6.78391 4.70875 7.04095 4.0625 7.04167ZM4.0625 3.25C3.79467 3.25 3.53286 3.32942 3.31017 3.47822C3.08747 3.62702 2.91391 3.83851 2.81141 4.08595C2.70892 4.33339 2.6821 4.60567 2.73435 4.86835C2.7866 5.13104 2.91558 5.37232 3.10496 5.56171C3.29434 5.75109 3.53563 5.88006 3.79832 5.93231C4.061 5.98457 4.33328 5.95775 4.58072 5.85526C4.82816 5.75276 5.03965 5.57919 5.18845 5.3565C5.33725 5.13381 5.41667 4.872 5.41667 4.60417C5.41667 4.24502 5.274 3.90058 5.02004 3.64663C4.76609 3.39267 4.42165 3.25 4.0625 3.25ZM8.125 10.8333C8.12414 10.1153 7.83852 9.42693 7.3308 8.9192C6.82307 8.41148 6.1347 8.12586 5.41667 8.125H2.70833C1.9903 8.12586 1.30193 8.41148 0.794202 8.9192C0.286478 9.42693 0.00086009 10.1153 0 10.8333L0 13H1.08333V10.8333C1.08333 10.4024 1.25454 9.98903 1.55928 9.68429C1.86403 9.37954 2.27736 9.20833 2.70833 9.20833H5.41667C5.84764 9.20833 6.26097 9.37954 6.56572 9.68429C6.87046 9.98903 7.04167 10.4024 7.04167 10.8333V13H8.125V10.8333ZM9.47917 4.875C8.99708 4.875 8.52581 4.73204 8.12496 4.46421C7.72412 4.19637 7.4117 3.81569 7.22721 3.37029C7.04272 2.9249 6.99445 2.4348 7.0885 1.96197C7.18255 1.48914 7.4147 1.05482 7.75559 0.713928C8.09649 0.373038 8.53081 0.140888 9.00363 0.046837C9.47646 -0.0472145 9.96656 0.00105613 10.412 0.185545C10.8574 0.370033 11.238 0.682454 11.5059 1.0833C11.7737 1.48414 11.9167 1.95541 11.9167 2.4375C11.9159 3.08375 11.6589 3.70332 11.2019 4.16028C10.745 4.61725 10.1254 4.87428 9.47917 4.875ZM9.47917 1.08333C9.21134 1.08333 8.94952 1.16275 8.72683 1.31155C8.50414 1.46035 8.33057 1.67184 8.22808 1.91928C8.12559 2.16673 8.09877 2.439 8.15102 2.70169C8.20327 2.96437 8.33224 3.20566 8.52163 3.39504C8.71101 3.58443 8.9523 3.7134 9.21498 3.76565C9.47766 3.8179 9.74994 3.79108 9.99738 3.68859C10.2448 3.58609 10.4563 3.41253 10.6051 3.18984C10.7539 2.96714 10.8333 2.70533 10.8333 2.4375C10.8333 2.07835 10.6907 1.73392 10.4367 1.47996C10.1828 1.22601 9.83831 1.08333 9.47917 1.08333ZM13 8.66667C12.9991 7.94864 12.7135 7.26026 12.2058 6.75254C11.6981 6.24481 11.0097 5.95919 10.2917 5.95833H8.125V7.04167H10.2917C10.7226 7.04167 11.136 7.21287 11.4407 7.51762C11.7455 7.82237 11.9167 8.23569 11.9167 8.66667V10.8333H13V8.66667Z" fill="white"/></g><defs><clipPath id="clip0_2_90"><rect width="13" height="13" fill="white"/></clipPath></defs></svg>`,
    active: true,
    hasTags: true,
    hasComments: true,
    hasTasks: true,
    hasWorkflow: false,
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
      attributes: [{ name: PropertyAttributeName.Pattern, value: "[a-zA-Z0-9._%+-]+@[a-z0-9.-]+.[a-zA-Z]{2,4}" }],
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
        { order: 2, value: "Inactive", color: Colors.YELLOW }
      ],
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
  ];

  const properties = await createProperties(employeesEntity.id, fields);
  const firstNameProperty = properties.find((f) => f.name === "firstName");
  const lastNameProperty = properties.find((f) => f.name === "lastName");
  const emailProperty = properties.find((f) => f.name === "email");
  const salaryProperty = properties.find((f) => f.name === "salary");
  const statusProperty = properties.find((f) => f.name === "status");
  const photoProperty = properties.find((f) => f.name === "photo");

  const employee1 = await createRow({
    entityId: employeesEntity.id,
    tenantId,
    createdByUserId,
    linkedAccountId: null,
    dynamicProperties: [
      {
        propertyId: firstNameProperty?.id ?? "",
        textValue: "Josselin",
      },
      {
        propertyId: lastNameProperty?.id ?? "",
        textValue: "Liebe",
      },
      {
        propertyId: emailProperty?.id ?? "",
        textValue: "josselin.liebe@321founded.com",
      },
      {
        propertyId: salaryProperty?.id ?? "",
        numberValue: 500,
      },
      {
        propertyId: statusProperty?.id ?? "",
        textValue: "Active",
      },
      {
        propertyId: photoProperty?.id ?? "",
        media: [
          {
            title: "My pic",
            name: "My pic",
            type: "image/png",
            file: "https://via.placeholder.com/500x500.png",
          },
        ],
      },
    ],
    properties: null,
    dynamicRows: [],
  });
  await createManualRowLog({ tenantId, createdByUserId, action: DefaultLogActions.Created, entity: employeesEntity, item: employee1 });

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
        textValue: "Guillaume",
      },
      {
        propertyId: lastNameProperty?.id ?? "",
        textValue: "Scaglia",
      },
      {
        propertyId: emailProperty?.id ?? "",
        textValue: "guillaume.scgl31@gmail.com",
      },
      {
        propertyId: salaryProperty?.id ?? "",
        numberValue: 500,
      },
      {
        propertyId: statusProperty?.id ?? "",
        textValue: "Active",
      },
      {
        propertyId: photoProperty?.id ?? "",
        media: [
          {
            title: "My pic",
            name: "My pic",
            type: "image/png",
            file: "https://via.placeholder.com/500x500.png",
          },
        ],
      },
    ],
    properties: null,
    dynamicRows: [],
  });
  await createManualRowLog({ tenantId, createdByUserId, action: DefaultLogActions.Created, entity: employeesEntity, item: employee2 });

  return {
    employeesEntity: await getEntityBySlug("employees"),
    employees: [employee1, employee2],
  };
}
