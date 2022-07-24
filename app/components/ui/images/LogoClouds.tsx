import Logo321Founded from "~/assets/logos/321founded.png";
import LogoMalt from "~/assets/logos/malt.png";

export default function LogoClouds() {
  return (
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 md:grid-cols-4 lg:grid-cols-2">
            <div className="col-span-1 flex justify-center">
              <img className="h-12" src={Logo321Founded} alt="321Founded" />
            </div>
            <div className="col-span-1 flex justify-center">
              <img className="h-12 object-cover" src={LogoMalt} alt="Malt" />
            </div>
          </div>
        </div>
      </div>
  );
}
