import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    <div>
      <footer>
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link to="/" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Product
              </Link>
            </div>

            <div className="px-5 py-2">
              <Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Pricing
              </Link>
            </div>

            <div className="px-5 py-2">
              <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Contact
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/blog" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Blog
              </Link>
            </div>

            {/* <div className="px-5 py-2">
              <Link to="/terms-and-conditions" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Terms and Conditions
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/privacy-policy" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Privacy Policy
              </Link>
            </div> */}
            <div className="px-5 py-2">
              <Link to="/changelog" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Changelog
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/components" className="text-base text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Components
              </Link>
            </div>
          </nav>
          <div className="mt-8 flex justify-center space-x-6">
            <a target="_blank" rel="noreferrer" href="https://twitter.com/AlexandroMtzG" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">2022, All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
