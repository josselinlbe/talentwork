import { EmailTemplate } from "~/application/dtos/email/EmailTemplate";
import { createPostmarkTemplate } from "../email.server";

export async function createEmailTemplates(templates: EmailTemplate[]) {
  const template = templates.find((f) => f.type === "layout");
  if (template) {
    await createPostmarkTemplate(template);
  }
  templates
    .filter((f) => f.type === "standard")
    .forEach(async (item) => {
      await createPostmarkTemplate(item, template?.alias);
    });
}
