import Carousel from "../ui/images/Carousel";

const featureImages = [
  {
    group: "Tasks",
    title: "Create Task",
    src: "https://tlyriaxy.sirv.com/Talentwork/demo1.png",
  },
  {
    group: "Tasks Portal",
    title: "View Tasks",
    src: "https://tlyriaxy.sirv.com/Talentwork/demo2.png",
  },
];

export default function FeatureImages() {
  return (
    <div className="relative overflow-hidden pt-2">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-5xl space-y-8">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-theme-600 uppercase">Say goodbye to excel files</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">The ultimate all-in-one dashboard</p>
          <p className="mt-5 max-w-prose mx-auto text-base text-gray-500">
            Manage your missions, workforce, documents, expenses and more 👀
          </p>
        </div>
        <div className="mx-auto">
          <Carousel images={featureImages} />
        </div>
      </div>
    </div>
  );
}
