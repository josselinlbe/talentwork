import clsx from "clsx";
import { SocialProofDto } from "~/application/dtos/marketing/SocialProofDto";
import ButtonSecondary from "../ui/buttons/ButtonSecondary";

interface Props {
  title: string;
  subtitle?: string;
  socialProof: SocialProofDto;
  cta?: {
    message: string;
    link: string;
  }[];
}
export default function Community({ title, subtitle, socialProof, cta }: Props) {
  return (
    <div>
      {socialProof.members.length > 0 && (
        <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-8 sm:space-y-12">
            <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
              <p className="text-xl text-gray-500">{subtitle}</p>
              {cta && (
                <div className="flex space-x-2 justify-center">
                  {cta.map((item) => {
                    return (
                      <div key={item.link} className="rounded-md ">
                        <a
                          key={item.message}
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className={clsx(
                            "group w-full flex items-center space-x-2 justify-center px-8 py-3 border text-base font-medium rounded-md md:py-2 md:px-4 hover:bg-gray-100 dark:hover:bg-gray-900"
                          )}
                        >
                          {item.message}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <ul className="mx-auto grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-4 md:gap-x-3 lg:max-w-5xl lg:gap-x-4 lg:gap-y-4 xl:grid-cols-8">
              {socialProof.members.map((item) => (
                <li key={item.user}>
                  <div className="space-y-4">
                    <a href={"https://github.com/" + item.user} target="_blank" rel="noreferrer">
                      <img className="mx-auto h-16 w-16 rounded-full lg:w-20 lg:h-20" src={item.avatar_url} alt={item.user} />
                      <div>
                        <div className="mt-2 text-xs font-medium lg:text-sm">
                          <h4 className="truncate text-gray-500">{item.user}</h4>
                        </div>
                      </div>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
