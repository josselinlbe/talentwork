import fs from "fs";
import path from "path";
import { Command } from "~/application/dtos/layout/Command";
import { DocsSidebar } from "~/application/sidebar/DocsSidebar";
import { SideBarItem } from "~/application/sidebar/SidebarItem";

type Doc = {
  items: Doc[];
};

export async function getDoc(fileName: string): Promise<string> {
  const items: Doc[] = [];
  const dir = path.join("./", "./app/routes/docs/" + fileName);
  const filePath = "./app/routes/docs/" + fileName;
  const content = fs.readFileSync(path.join(dir, filePath), "utf8");
  return `---
meta:
  title: Introduction
  description: TODO
headers:
  Cache-Control: no-cache
---

# Introduction

## What is SaasRock?

SaasRock Low-code & extensible framework with out-of-the-box SaaS features.

## Community

- Follow us on [Twitter](https://twitter.com/saas_rock) to get project status updates.
- Join the [Discord](https://twitter.com/saas_rock) server.

## Documents

Browse the documentation to explore the codebase features.

### Getting Started

- [Installation](/docs/instalation)
- [Deployment](/docs/deployment)

### Tutorials

- [Create an Invoice app](/docs/tutorials/create-an-invoice-saas-app)

### Guides

- Theme Customization
  - [Colors](/docs/guides/theme/colors)
  - [Brand](/docs/guides/theme/brand)
- Localization (i18n)
  - [Supporting a Language](/docs/guides/localization/languages)

### Core Concepts

- Account
  - [User](/docs/core-models/account/user)
  - [Tenant](/docs/core-models/account/tenant)
  - [Tenant User](/docs/core-models/account/tenant-user)
- Subscription
  - [Product](/docs/core-models/subscription/product)
  - [Price](/docs/core-models/subscription/price)
  - [Feature](/docs/core-models/subscription/feature)
  - [Tenant Subscription](/docs/core-models/subscription/tenant-subscription)
- Custom Entity
  - [Entity](/docs/core-models/custom-entity/entity)
  - [Property](/docs/core-models/custom-entity/property)
  - [Row](/docs/core-models/custom-entity/row)
  - [Row Value](/docs/core-models/custom-entity/row-value)
`;
}

export async function getDocCommands() {
  const commands: Command[] = [];
  DocsSidebar.forEach((doc, idx) => {
    const command: Command = {
      command: (idx + 1).toString(),
      title: doc.title,
      description: doc.description ?? "",
      toPath: "",
      items: [],
    };
    if (doc.items !== undefined && doc.items?.length > 0) {
      doc.items.forEach((item) => {
        command.items?.push({
          command: (idx + 1).toString(),
          title: item.title,
          description: item.description ?? "",
          toPath: item.path,
        });
      });
    } else {
      command.toPath = doc.path;
    }
    commands.push(command);
  });
  return commands;
}
