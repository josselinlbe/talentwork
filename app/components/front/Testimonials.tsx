import { SocialProofDto } from "~/application/dtos/marketing/SocialProofDto";
import { TestimonialDto } from "~/application/dtos/marketing/TestimonialDto";
import Testimonial from "./Testimonial";

interface Props {
  items?: TestimonialDto[];
  socialProof?: SocialProofDto;
}
export default function Testimonials({ items, socialProof }: Props) {
  return (
    <div className="py-12 space-y-10 relative">
      <div className="hidden lg:block lg:absolute lg:inset-0" aria-hidden="true">
        <svg
          className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
          width="404"
          height="784"
          fill="none"
          viewBox="0 0 404 784"
        >
          <defs>
            <pattern id="f210dbf6-a58d-4871-961e-36d5016a0f49" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-gray-800" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="784" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
        </svg>
        <svg
          className="  absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2 text-gray-200 dark:text-gray-800"
          width="404"
          height="784"
          fill="none"
          viewBox="0 0 404 784"
        >
          <defs>
            <pattern id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="784" fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
        </svg>
      </div>
      <div className="flex justify-center">
        <div className="space-y-3 text-center">
          <h3 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">Don't take our word for it.</h3>
          {socialProof && <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">Used by {socialProof.totalMembers} developers</p>}
        </div>
      </div>
      {items && items?.length === 1 ? <Testimonial item={items[0]} /> : <div>TODO: Multiple testimonials components</div>}
    </div>
  );
}
