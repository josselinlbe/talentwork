import { useTranslation } from "react-i18next";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, useActionData, useLoaderData, useTransition } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";
import { createEmail, EmailWithSimpleDetails, getAllEmails, getEmailByMessageId } from "~/utils/db/email/emails.db.server";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateUtils from "~/utils/shared/DateUtils";
import Loading from "~/components/ui/loaders/Loading";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import InputSearch from "~/components/ui/input/InputSearch";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { useEffect, useState } from "react";
import { getPostmarkInboundMessage, getPostmarkInboundMessages } from "~/utils/email.server";

type LoaderData = {
  title: string;
  items: EmailWithSimpleDetails[];
  inboundEmailAddress?: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const items = await getAllEmails("inbound");
  const inboundEmailAddress = process.env.POSTMARK_INBOUND_EMAIL;

  const data: LoaderData = {
    title: `${t("models.email.plural")} | ${process.env.APP_NAME}`,
    items,
    inboundEmailAddress,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  items?: EmailWithSimpleDetails[];
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const { t } = await i18nHelper(request);
  const form = await request.formData();

  const action = form.get("action");
  if (action === "sync") {
    const allEmails = await getPostmarkInboundMessages();
    await Promise.all(
      allEmails.map(async (newEmail) => {
        const messageId = newEmail.MessageID.toString();
        const existing = await getEmailByMessageId(messageId);
        if (existing) {
          return;
        }
        const email = await getPostmarkInboundMessage(messageId);
        if (!email) {
          return;
        }
        const attachmentsWithContent = email.Attachments.filter((f) => f.Content);
        await createEmail({
          messageId: email.MessageID,
          type: "inbound",
          date: new Date(email.Date),
          subject: email.Subject,
          fromEmail: email.From,
          fromName: email.FromName,
          toEmail: email.ToFull[0].Email,
          toName: email.ToFull[0].Name,
          textBody: email.TextBody,
          htmlBody: email.HtmlBody,
          cc: { create: email.CcFull.map((cc: any) => ({ toEmail: cc.Email, toName: cc.Name })) },
          attachments:
            attachmentsWithContent.length > 0
              ? {
                  create: attachmentsWithContent.map((attachment: any) => ({
                    name: attachment.Name,
                    content: attachment.Content,
                    type: attachment.ContentType,
                    length: attachment.ContentLength,
                  })),
                }
              : undefined,
        });
      })
    );

    const items = await getAllEmails("inbound");
    return json({
      items,
    });
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};

export const meta: MetaFunction = ({ data }) => ({
  title: data?.title,
});

export default function AdminEmailsInboundRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const transition = useTransition();

  const [items, setItems] = useState(data.items ?? []);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (actionData?.items) {
      setItems(actionData.items);
    }
  }, [actionData]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.fromEmail?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.fromName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.toEmail?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.toName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.subject?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.textBody?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  return (
    <div>
      <InfoBanner title="Inbound Email Address" text="">
        <div>
          Send emails to: <span className="font-bold select-all">{data.inboundEmailAddress}</span>
        </div>
      </InfoBanner>

      <Form method="post" className="flex justify-between space-x-1">
        <input hidden readOnly name="action" value="sync" />
        <div className="flex-grow">
          <InputSearch value={searchInput} setValue={setSearchInput} />
        </div>
        <ButtonSecondary type="submit">Sync</ButtonSecondary>
      </Form>

      {transition.state === "loading" ? (
        <Loading />
      ) : (
        <TableSimple
          items={filteredItems()}
          headers={[
            {
              name: "from",
              title: t("models.email.from"),
              value: (i) => i.fromEmail,
            },
            // {
            //   name: "to",
            //   title: t("models.email.to"),
            //   value: (i) => i.toEmail,
            // },
            {
              name: "subject",
              title: t("models.email.subject"),
              value: (i) => i.subject,
            },
            {
              name: "body",
              title: t("models.email.textBody"),
              value: (i) => i.textBody,
              className: "max-w-sm truncate",
            },
            {
              name: "attachments",
              title: t("models.email.attachments"),
              value: (i) => i._count.attachments,
            },
            {
              name: "date",
              title: t("models.email.date"),
              value: (i) => DateUtils.dateAgo(i.date),
            },
          ]}
        />
      )}
    </div>
  );
}
