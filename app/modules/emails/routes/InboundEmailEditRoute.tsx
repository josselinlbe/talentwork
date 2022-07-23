import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import DateUtils from "~/utils/shared/DateUtils";
import { LoaderDataInboundEmailEdit } from "../loaders/inbound-email-edit";

export default function InboundEmailRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderDataInboundEmailEdit>();
  const navigate = useNavigate();
  const submit = useSubmit();

  function onDelete() {
    const formData = new FormData();
    formData.append("action", "delete");
    submit(formData, {
      method: "post",
    });
  }
  function htmlBodyWithImages() {
    const imagesInBody: string[] = [];
    let htmlBody = data.item.htmlBody;

    const regex = new RegExp(`<img.*?src="(.*?)"`, "g");
    let matches: RegExpExecArray | null;
    let times = 0;
    do {
      times++;
      matches = regex.exec(htmlBody);
      if (!matches) {
        break;
      }
      const exact = matches[1];
      if (exact.startsWith("cid:")) {
        const fileName = exact.split("@")[0].replace("cid:", "");
        const file = data.item.attachments.find((file) => file.name === fileName);
        if (file) {
          imagesInBody.push(file.name);
          htmlBody = htmlBody.replace(exact, `${file.content}`);
        }
      }
    } while (matches && times < 10);
    return htmlBody;
  }
  return (
    <div>
      <SlideOverFormLayout
        className="max-w-2xl"
        classNameBg="bg-gray-50"
        title={data.item.subject}
        description={DateUtils.dateAgo(data.item.date)}
        onClosed={() => navigate(data.redirectUrl)}
        options={[
          {
            title: t("shared.delete"),
            onClick: onDelete,
          },
        ]}
      >
        <div className="p-2 space-y-1">
          <div className="grid grid-cols-12 gap-3 bg-white rounded-md border border-gray-300 p-4 shadow">
            <div className="col-span-2 text-end">
              <div className="text-gray-400 text-xs">Subject: </div>
            </div>
            <div className="col-span-10">
              <div className="font-extrabold truncate text-sm">{data.item.subject}</div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-gray-400 text-xs">From: </div>
            </div>
            <div className="col-span-10">
              <div className="flex flex-col text-sm">
                <div className="font-medium">{data.item.fromName}</div>
                <div className="text-sm text-gray-400 truncate select-all">{data.item.fromEmail}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-gray-400 text-xs">To: </div>
            </div>
            <div className="col-span-10">
              <div className="flex flex-col text-sm">
                <div className="font-medium">{data.item.toName}</div>
                <div className="text-sm text-gray-400 truncate select-all">{data.item.toEmail}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-gray-400 text-xs">Date: </div>
            </div>
            <div className="col-span-10">
              <div className="flex space-x-1 items-baseline text-sm">
                <div className="font-medium">{DateUtils.dateAgo(data.item.date)}</div>
                <div className="text-xs text-gray-400">- {DateUtils.dateYMDHMS(data.item.date)}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-gray-400 text-xs">Read at: </div>
            </div>
            <div className="col-span-10">
              <div className="flex space-x-1 items-baseline text-sm">
                <div className="font-medium">{DateUtils.dateAgo(data.myRead.createdAt)}</div>
                <div className="text-xs text-gray-400">- {DateUtils.dateYMDHMS(data.myRead.createdAt)}</div>
              </div>
            </div>

            <div className="col-span-2 text-end">
              <div className="text-gray-400 text-xs">Attachments: </div>
            </div>
            <div className="col-span-10">
              <div className="flex flex-col space-y-1">
                {data.item.attachments.map((item) => {
                  return (
                    <div key={item.id} className="truncate">
                      <div className="text-sm truncate flex items-center space-x-2">
                        <div
                          className={clsx(
                            "w-10 flex-shrink-0 truncate bg-gray-50 border border-gray-300 rounded-md p-0.5 text-gray-500 uppercase text-xs text-center",
                            item.type.includes("xml") && "bg-blue-50 border-blue-300 text-blue-500",
                            item.type.includes("pdf") && "bg-red-50 border-red-300 text-red-500"
                          )}
                        >
                          {item.name.split(".").pop()}
                        </div>
                        <a
                          href={item.publicUrl ?? item.content}
                          download={item.name}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-theme-500 truncate"
                        >
                          {item.name}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <iframe
            className="h-full w-full min-h-screen bg-white rounded-md border border-gray-300 p-4 shadow"
            title={data.item.subject}
            srcDoc={htmlBodyWithImages()}
          />
          {/* <div dangerouslySetInnerHTML={{ __html: data.item.htmlBody }} /> */}
        </div>
      </SlideOverFormLayout>
    </div>
  );
}
