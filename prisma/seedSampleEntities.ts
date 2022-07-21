import { LinkedAccount, User } from "@prisma/client";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { Visibility } from "~/application/dtos/shared/Visibility";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import FakePdfBase64 from "~/components/ui/pdf/FakePdfBase64";
import { EmployeeDto } from "~/modules/contracts/dtos/EmployeeDto";
import { ContractMemberRole } from "~/modules/contracts/enums/ContractMemberRole";
import { ContractStatus } from "~/modules/contracts/enums/ContractStatus";
import { db } from "~/utils/db.server";
import { createCoreEntity, createEntity, getEntityByName, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createProperties, CreatePropertyDto } from "~/utils/db/entities/properties.db.server";
import { createRow, getMaxRowFolio } from "~/utils/db/entities/rows.db.server";
import { createManualRowLog } from "~/utils/db/logs.db.server";
import { includeSimpleUser } from "~/utils/db/users.db.server";

export async function seedSampleEntities(tenant1And2Relationship: LinkedAccount, user1: User, seedAttributeEntities = false) {
  await createSampleEntity_Contract(
    tenant1And2Relationship,
    user1.id,
    [] // employees.map((employee) => ApiHelper.getApiFormat(employeesEntity, employee))
  );
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

async function createSampleEntity_Contract(linkedAccount: LinkedAccount, createdByUserId: string, employees: EmployeeDto[]) {
  const contractsEntity = await createEntity({
    name: "contract",
    slug: "contracts",
    prefix: "CON",
    title: "models.contract.object",
    titlePlural: "models.contract.plural",
    isFeature: true,
    isAutogenerated: true,
    isDefault: false,
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
    active: true,
    hasTags: true,
    hasComments: true,
    hasTasks: true,
    hasWorkflow: true,
    defaultVisibility: Visibility.Tenant,
  });
  const tenantAusers = await db.tenantUser.findMany({
    where: { tenantId: linkedAccount.providerTenantId },
    include: { ...includeSimpleUser },
  });
  const tenantBusers = await db.tenantUser.findMany({
    where: { tenantId: linkedAccount.clientTenantId },
    include: { ...includeSimpleUser },
  });

  let folio = 1;
  const maxFolio = await getMaxRowFolio(linkedAccount.providerTenantId, contractsEntity.id, undefined);
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
          visibility: Visibility.Tenant,
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
        create: employees.map((employee) => {
          return {
            rowId: employee.id,
          };
        }),
      },
    },
  });
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
        { order: 2, value: "On Leave", color: Colors.YELLOW },
        { order: 3, value: "Dismissed", color: Colors.GRAY },
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
        { name: PropertyAttributeName.MaxSize, value: "2" },
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
