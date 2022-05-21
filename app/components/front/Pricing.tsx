import { Link } from "remix";
import CheckIcon from "../ui/icons/CheckIcon";
import GitHubIcon from "../ui/icons/GitHubIcon";

const includedFeatures = ["1 year of updates", "Private repository access", "Submit issues"];

export default function Pricing() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-4xl">Developer license</h2>
            <p className="mt-4 text-xl text-gray-600">Build unlimited SaaS applications.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white dark:bg-gray-900 pb-16 sm:mt-12 sm:pb-20 lg:pb-28">
        <div className="relative">
          <div className="absolute inset-0 h-1/2 bg-white dark:bg-gray-900" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none lg:flex border border-gray-200 dark:border-gray-700">
              <div className="flex-1 bg-white dark:bg-gray-900 px-6 py-8 lg:p-12">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">Build unlimited SaaS apps</h3>
                <p className="mt-6 text-base text-gray-500">Get constant updates for 1 year.</p>
                <div className="mt-8">
                  <div className="flex items-center">
                    <h4 className="flex-shrink-0 pr-4 bg-white dark:bg-gray-900 text-sm tracking-wider font-semibold uppercase text-theme-600">
                      What's included
                    </h4>
                    <div className="flex-1 border-t-2 border-gray-200 dark:border-gray-700" />
                  </div>
                  <ul role="list" className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-5">
                    {includedFeatures.map((feature) => (
                      <li key={feature} className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <CheckIcon className="h-5 w-5 text-theme-400" aria-hidden="true" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700 dark:text-gray-400">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="py-8 px-6 text-center bg-gray-50 dark:bg-gray-900 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                <p className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Lifetime license</p>
                <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900 dark:text-white">
                  <span className="text-2xl line-through text-gray-700 dark:text-gray-400 font-medium">$899</span>
                  <span>$299</span>
                  <span className="ml-1 text-xl font-medium text-gray-700">USD</span>
                </div>

                <div className="mt-6">
                  <div className="rounded-md shadow">
                    <a
                      href="https://alexandromg.gumroad.com/l/SaasFrontends-Remix/alpha-access"
                      className="flex items-center justify-center space-x-2 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-theme-500 hover:bg-theme-600"
                    >
                      <div>Get pre-launch price 🚀</div>
                    </a>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="font-medium text-gray-900">1 year of updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
