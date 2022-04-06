import { Listbox } from "@headlessui/react";
import { Tenant } from "@prisma/client";
import { useState } from "react";
import { useParams } from "remix";

interface Props {
  tenants: Tenant[];
  onClose: () => void;
}

export default function TenantList({ tenants, onClose }: Props) {
  const params = useParams();
  const [selectedTenant, setSelectedTenant] = useState(tenants.find((f) => f.id === params.tenant));
  return (
    <div className="text-gray-800">
      <Listbox value={selectedTenant} onChange={setSelectedTenant}>
        {selectedTenant?.id}
        <Listbox.Options static>
          {tenants.map((item) => (
            <Listbox.Option key={item.id} value={item}>
              {({ active, selected }) => (
                <li className={`${active ? "bg-blue-500 text-white" : "bg-white text-black"}`}>
                  {selected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {item.name}
                </li>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
      <div className="mt-4 flex">
        <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 w-full">
          Create another tenant<span aria-hidden="true"> &rarr;</span>
        </button>
      </div>
    </div>
  );
}
