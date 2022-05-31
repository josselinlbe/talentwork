import { TestimonialDto } from "~/application/dtos/marketing/TestimonialDto";

interface Props {
  item: TestimonialDto;
}
export default function Testimonial({ item }: Props) {
  return (
    <section className="overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* {item.company === "Piloterr" ? (
            <Piloterr className="mx-auto h-8" />
          ) : (
            <a href={item.companyUrl}>
              <img className="hidden dark:block w-auto mx-auto h-8" src={item.logoDarkMode} alt={item.company} />
              <img className="dark:hidden w-auto mx-auto h-8" src={item.logoLightMode} alt={item.company} />
            </a>
          )} */}
          <div className="p-12">
            <a href={item.companyUrl}>
              <img className="hidden dark:block w-auto mx-auto h-6" src={item.logoDarkMode} alt={item.company} />
              <img className="dark:hidden w-auto mx-auto h-6" src={item.logoLightMode} alt={item.company} />
            </a>
            <blockquote className="mt-10">
              <div className="max-w-3xl mx-auto text-center text-2xl leading-9 text-gray-900 dark:text-white">
                <p>&ldquo;{item.quote}&rdquo;</p>
              </div>
              <footer className="mt-8">
                <div className="md:flex md:items-center md:justify-center">
                  <div className="md:flex-shrink-0">
                    <img className="mx-auto h-10 w-10 rounded-full" src={item.avatar} alt={item.name} />
                  </div>
                  <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {item.personalWebsite ? (
                        <a href={item.personalWebsite} className="border-b border-theme-300 border-dashed hover:border-dotted">
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </div>

                    <svg className="hidden md:block mx-1 h-5 w-5 text-theme-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 0h3L9 20H6l5-20z" />
                    </svg>

                    <div className="text-base font-medium text-gray-500">
                      {item.role},{" "}
                      <a href={item.companyUrl} className="border-b border-theme-300 border-dashed hover:border-dotted">
                        {item.company}
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
