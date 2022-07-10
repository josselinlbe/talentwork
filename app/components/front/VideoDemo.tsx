interface Props {
  title: string;
  url: string;
  subtitle?: string;
}
export default function VideoDemo({ title, url, subtitle }: Props) {
  return (
    <div>
      {url && (
        <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-8 sm:space-y-12">
            <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
              <p className="text-xl text-gray-500">{subtitle}</p>
            </div>
            <div className="aspect-w-16 aspect-h-5 mt-10 max-w-2xl mx-auto my-12">
              <iframe
                src={url}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
