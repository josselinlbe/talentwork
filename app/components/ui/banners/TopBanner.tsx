import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "remix";
import RemixDark from "~/assets/img/remix-dark.png";

export default function TopBanner() {
  const location = useLocation();
  const [open, setOpen] = useState(true);

  return (
    <span>
      {open && (
        <div className="bg-slate-900 border-b-2 border-yellow-500 shadow-2xl">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="w-full lg:w-auto lg:justify-end flex items-center space-x-3">
              <div className="flex-grow">
                <Link to="/changelog#april-12-2022" className="flex font-bold underline items-center space-x-1 text-white text-sm sm:text-base">
                  Changelog #2 - 🎉 Tenant on URL, Command palette, Dashboards, and User events
                </Link>
              </div>
              <div className="flex-shrink-0 order-2 mt-0 w-auto">
                <a
                  href="https://alexandromg.gumroad.com/l/SaasFrontends-Remix"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm sm:text-sm font-medium text-yellow-900 bg-yellow-400 hover:bg-yellow-500"
                >
                  Get codebase!
                </a>
              </div>
              <div className="flex-shrink-0 order-3 ml-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="-mr-1 flex p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:-mr-2"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
