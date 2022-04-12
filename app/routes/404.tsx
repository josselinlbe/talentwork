import { Link } from "remix";
import Footer from "~/components/front/Footer";
import Logo from "~/components/front/Logo";

export default function Page404() {
  return (
    <>
      <div className="dark">
        <div className="min-h-full pt-16 pb-12 flex flex-col">
          <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-shrink-0 flex justify-center">
              <Link to="/" className="inline-flex">
                <Logo />
              </Link>
            </div>
            <div className="py-16">
              <div className="text-center">
                <p className="text-sm font-semibold text-theme-600 uppercase tracking-wide">Unauthorized</p>
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">You're not authorized to see this page.</h1>
                {/* <p className="mt-2 text-base text-gray-500">Click the button below.</p> */}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
