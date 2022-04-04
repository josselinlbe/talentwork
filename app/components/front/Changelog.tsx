import DateUtils from "~/utils/shared/DateUtils";

export type ChangelogItem = {
  date: Date;
  closed: Issue[];
};

type Issue = {
  title: string;
  img?: string;
  video?: string;
};

interface Props {
  items: ChangelogItem[];
}
export default function Changelog({ items }: Props) {
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
  return (
    <div className="mx-auto ">
      <div className="prose text-sm text-black dark:text-white">
        {items.map((item) => {
          return (
            <>
              <h2 className="text-black dark:text-white">{DateUtils.dateMonthDayYear(item.date)}</h2>
              <h3 className="text-black dark:text-white">Closed</h3>
              <ul>
                {item.closed.map((issue, idx) => {
                  return (
                    <li key={idx}>
                      ✅{" "}
                      <a target="_blank" rel="noreferrer" href={getIssueUrl(issue)}>
                        #{getIssueId(issue)}
                      </a>
                      : {issue.title.split("#")[0]}
                      {issue.img && <img alt={issue.title} src={issue.img} className="object-cover rounded-lg shadow-lg overflow-hidden" />}
                    </li>
                  );
                })}
              </ul>
            </>
          );
        })}
      </div>
    </div>
  );
}
