import { useTranslation } from "react-i18next";
import { SetupItem } from "~/application/dtos/setup/SetupItem";
import ButtonSecondary from "../ui/buttons/ButtonSecondary";

interface Props {
  items: SetupItem[];
}
export default function SetupSteps({ items }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className=" leading-4 font-medium text-gray-900">Set up steps</h3>
      <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          return (
            <li key={idx} className="bg-white p-4 border border-gray-300 space-y-3 rounded-lg">
              <div className="flex items-center space-x-2">
                {!item.completed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-300 border border-gray-300 rounded-full"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-teal-500 border border-teal-500 rounded-full"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <div className=" font-medium">{item.title}</div>
              </div>
              <p className=" text-sm">{item.description}</p>
              <ButtonSecondary to={item.path} className="mt-3">
                {!item.completed ? t("app.sidebar.setup") : `${t("shared.goTo")} ${item.title.toLowerCase()}`} &rarr;
              </ButtonSecondary>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
