import { Link } from "remix";
import CheckIcon from "../ui/icons/CheckIcon";

const includedFeatures = ["1 year of updates", "Private repository access", "Submit issues", "Get the latest releases"];

export default function Pricing() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-4xl">Developer license</h2>
            <p className="mt-4 text-xl text-gray-600">If you're not satisfied, contact us within the first 14 days and we'll send you a full refund.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white pb-16 sm:mt-12 sm:pb-20 lg:pb-28">
        <div className="relative">
          <div className="absolute inset-0 h-1/2 bg-white dark:bg-gray-900" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none lg:flex border border-gray-200">
              <div className="flex-1 bg-white px-6 py-8 lg:p-12">
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Yours forever</h3>
                <p className="mt-6 text-base text-gray-500">Get constant updates for 1 year.</p>
                <div className="mt-8">
                  <div className="flex items-center">
                    <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-theme-600">What's included</h4>
                    <div className="flex-1 border-t-2 border-gray-200" />
                  </div>
                  <ul role="list" className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
                    {includedFeatures.map((feature) => (
                      <li key={feature} className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <CheckIcon className="h-5 w-5 text-theme-400" aria-hidden="true" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="py-8 px-6 text-center bg-gray-50 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                <p className="text-lg leading-6 font-medium text-gray-900">1 year of updates</p>
                <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
                  <span>$899</span>
                  <span className="ml-1 text-xl font-medium text-gray-700">USD</span>
                </div>

                <div className="mt-6">
                  <div className="rounded-md shadow">
                    <a
                      href="https://alexandromg.gumroad.com/l/SaasFrontends-Remix"
                      className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-theme-500 hover:bg-theme-600"
                    >
                      Get private repo access
                    </a>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="font-medium text-gray-900">Cancel anytime.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
