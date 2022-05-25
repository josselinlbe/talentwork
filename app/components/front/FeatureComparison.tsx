import { ReactNode } from "react";
import { getFeatures } from "~/utils/services/marketingService";
import CheckIcon from "../ui/icons/CheckIcon";
import XIcon from "../ui/icons/XIcon";

type FeatureSolution = {
  name: string;
  noCode: string | boolean;
  lowCode: string | boolean;
  customCode: string | boolean;
};

const features: FeatureSolution[] = [
  {
    name: "Admin Portal",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "App Portal",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "Authentication",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "Subscriptions",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "Blogging",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "Audit Trails",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "Entity Builder",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "API",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "Webhooks",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
  {
    name: "Components",
    noCode: "Coming Soon",
    lowCode: true,
    customCode: true,
  },
];

export default function FeatureComparison() {
  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Feature
                    </th>
                    <th scope="col" className="px-3 py-3 text-sm font-semibold text-gray-900 text-center">
                      No-code
                    </th>
                    <th scope="col" className="px-3 py-3 text-sm font-semibold text-gray-900 text-center">
                      Low-code
                    </th>
                    <th scope="col" className="px-3 py-3 text-sm font-semibold text-gray-900 text-center">
                      Custom-code
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {features.map((feature) => (
                    <tr key={feature.name}>
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{feature.name}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 text-center">
                        {typeof feature.noCode === "string" ? (
                          feature.noCode
                        ) : (
                          <div className="flex justify-center">
                            {feature.noCode ? <CheckIcon className="text-theme-500 h-5 w-5" /> : <XIcon className="text-gray-500 h-5 w-5" />}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 text-center">
                        {typeof feature.lowCode === "string" ? (
                          feature.lowCode
                        ) : (
                          <div className="flex justify-center">
                            {feature.lowCode ? <CheckIcon className="text-theme-500 h-5 w-5" /> : <XIcon className="text-gray-500 h-5 w-5" />}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 text-center">
                        {typeof feature.customCode === "string" ? (
                          feature.customCode
                        ) : (
                          <div className="flex justify-center">
                            {feature.customCode ? <CheckIcon className="text-theme-500 h-5 w-5" /> : <XIcon className="text-gray-500 h-5 w-5" />}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
