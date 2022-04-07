// eslint-disable import/first
var postmark = require("postmark");

import { Template, TemplateInList, TemplateTypes } from "postmark/dist/client/models";
import { EmailTemplateDto } from "~/application/dtos/email/EmailTemplateDto";

function getClient() {
  try {
    return new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN?.toString() ?? "");
  } catch (e) {
    return null;
  }
}

function getBaseTemplateModel() {
  const appUrl = process.env.SERVER_URL?.toString();
  return {
    product_url: appUrl,
    login_url: appUrl + "/login",
    product_name: process.env.APP_NAME,
    support_email: process.env.SUPPORT_EMAIL,
    sender_name: process.env.APP_NAME,
    company_name: process.env.COMPANY_NAME,
    company_address: process.env.COMPANY_ADDRESS,
  };
}

export async function sendEmail(to: string, alias: string, data: any, Attachments?: { Name: string; Content: string; ContentType: string }[]) {
  var client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN?.toString() ?? "");

  await client.sendEmailWithTemplate({
    From: process.env.POSTMARK_FROM_EMAIL,
    To: to,
    TemplateAlias: alias,
    TemplateModel: {
      ...getBaseTemplateModel(),
      ...data,
    },
    Attachments,
  });
}

export async function getPostmarkTemplates(): Promise<EmailTemplateDto[]> {
  const client = getClient();
  if (!client) {
    return [];
  }
  const items: TemplateInList[] = (await client.getTemplates()).Templates;
  const templatesPromises = items.map(async (item: TemplateInList) => {
    const postmarkTemplate: Template = await client.getTemplate(item.Alias ?? "");
    const template: EmailTemplateDto = {
      type: item.TemplateType === TemplateTypes.Standard ? "standard" : "layout",
      name: postmarkTemplate.Name,
      alias: postmarkTemplate.Alias ?? "",
      subject: postmarkTemplate.Subject ?? "",
      htmlBody: postmarkTemplate.HtmlBody ?? "",
      active: postmarkTemplate.Active,
      associatedServerId: postmarkTemplate.AssociatedServerId,
      templateId: postmarkTemplate.TemplateId,
    };
    return template;
  });
  const templates = await Promise.all(templatesPromises);
  return templates;
}

export async function createPostmarkTemplate(template: EmailTemplateDto, layoutTemplate?: string | undefined) {
  const client = getClient();
  if (!client) {
    throw Error("Undefined Postmark client");
  }
  return client.createTemplate({
    LayoutTemplate: layoutTemplate,
    TemplateType: template.alias.startsWith("layout-") ? TemplateTypes.Layout : TemplateTypes.Standard,
    Alias: template.alias,
    Name: template.name,
    Subject: template.subject,
    HtmlBody: template.htmlBody,
  });
}
