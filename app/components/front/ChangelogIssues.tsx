import { useState } from "react";

export type ChangelogItem = {
  date: string;
  title: string;
  closed: Issue[];
  added: Issue[];
};

type Issue = {
  title: string;
  img?: { title: string; img: string }[];
  video?: string;
};

interface Props {
  title: string;
  icon: string;
  items: Issue[];
}
export default function ChangelogIssues({ title, icon, items }: Props) {
  const [viewImages, setViewImages] = useState(true);
  function getIssueId(item: Issue) {
    if (item.title.includes("#")) {
      const id = item.title.split("#")[1];
      return Number(id);
    }
    return 0;
  }
  function getIssueUrl(item: Issue) {
    const id = getIssueId(item);
    if (id > 0) {
      return "https://github.com/AlexandroMtzG/remix-saas-kit/issues/" + id;
    }
    return "";
  }
  function imageCount() {
    return items.filter((f) => (f.img?.length ?? 0) > 0).length;
  }
  return (
    <div className="mx-auto ">
      <div className="prose text-sm text-black dark:text-white">
        <>
          {items.length > 0 && (
            <>
              <div className=" flex space-x-1 items-baseline">
                <h2 className="text-black dark:text-white font-semibold text-sm">{title}</h2>
                {imageCount() > 0 && (
                  <button className=" text-xs underline" type="button" onClick={() => setViewImages(!viewImages)}>
                    ({!viewImages ? "Click here to view images" : "Close images"})
                  </button>
                )}
              </div>
              <ul>
                {items.map((issue, idx) => {
                  return (
                    <li key={idx}>
                      {icon}{" "}
                      <a className=" text-theme-600 dark:text-theme-400" target="_blank" rel="noreferrer" href={getIssueUrl(issue)}>
                        #{getIssueId(issue)}
                      </a>
                      : {issue.title.split("#")[0]}
                      {viewImages && (
                        <>
                          {issue.img?.map((image, idx) => {
                            return (
                              <div key={idx} className="">
                                <img alt={image.title} src={image.img} className="object-cover rounded-lg shadow-lg overflow-hidden" />
                                {image.title && <h4 className="text-sm font-normal text-center flex justify-center mx-auto text-gray-500">{image.title}</h4>}
                              </div>
                            );
                          })}
                          {issue.video && (
                            <a href={issue.video} target="_blank" rel="noreferrer">
                              Watch demo video
                            </a>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      </div>
    </div>
  );
}
