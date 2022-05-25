import { EmailTemplate } from "~/application/dtos/email/EmailTemplate";
import emailTemplates from "~/application/emails/emailTemplates.server";
import UrlUtils from "../app/UrlUtils";
import { db } from "../db.server";
import { createPostmarkTemplate, deletePostmarkTemplate, getPostmarkTemplates } from "../email.server";

export async function getEmailTemplates() {
  const items = await emailTemplates();
  const templates = await getPostmarkTemplates();

  items.forEach((item) => {
    const template = templates.find((f) => f.alias === item.alias);
    if (template) {
      item.associatedServerId = template.associatedServerId;
      item.active = template.active;
      item.templateId = template.templateId;
    }
  });
  return items;
}

export async function createEmailTemplates(templates: EmailTemplate[], alias?: string) {
  const layoutTemplate = templates.find((f) => f.type === "layout");
  if (layoutTemplate && layoutTemplate.associatedServerId <= 0) {
    await createPostmarkTemplate(layoutTemplate);
  }
  if (alias) {
    const template = templates.find((f) => f.alias === alias);
    if (template) {
      await createPostmarkTemplate(template, layoutTemplate?.alias);
    }
  } else {
    templates
      .filter((f) => f.type === "standard")
      .forEach(async (item) => {
        await createPostmarkTemplate(item, layoutTemplate?.alias);
      });
  }
}

export async function deleteEmailTemplate(alias: string) {
  return await deletePostmarkTemplate(alias);
}

export async function getAvailableTenantSlug(name: string) {
  let slug = UrlUtils.slugify(name);
  let tries = 1;
  do {
    const existingSlug = await db.tenant.findFirst({
      where: {
        slug,
      },
    });
    if (existingSlug !== null) {
      slug = UrlUtils.slugify(name) + tries.toString();
      tries++;
    } else {
      break;
    }
  } while (true);
  return slug;
}
