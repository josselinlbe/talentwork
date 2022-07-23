import { useLoaderData, useNavigate } from "@remix-run/react";
import SlideOverFormLayout from "~/components/ui/slideOvers/SlideOverFormLayout";
import DateUtils from "~/utils/shared/DateUtils";
import { LoaderDataInboundEmailEdit } from "../loaders/inbound-email-edit";

export default function InboundEmailRoute() {
  const data = useLoaderData<LoaderDataInboundEmailEdit>();
  const navigate = useNavigate();
  return (
    <div>
      <SlideOverFormLayout
        className="max-w-2xl bg-gray-50"
        title={data.item.subject}
        description={DateUtils.dateAgo(data.item.date)}
        onClosed={() => navigate(data.redirectUrl)}
      >
        <div className="p-2">
          <div className="grid grid-cols-12 gap-3">
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
              <div className="flex flex-col">
                {data.item.attachments.map((item) => {
                  return (
                    <div key={item.id}>
                      <div className="text-sm">
                        <a
                          href={item.publicUrl ?? item.content}
                          download={item.name}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-theme-500"
                        >
                          {item.name}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white col-span-12 rounded-md border border-dashed border-gray-300 p-4 min-h-screen">
              <iframe className="h-full w-full" title={data.item.subject} srcDoc={data.item.htmlBody} />
              {/* <div dangerouslySetInnerHTML={{ __html: data.item.htmlBody }} /> */}
            </div>
          </div>
        </div>
      </SlideOverFormLayout>
    </div>
  );
}
