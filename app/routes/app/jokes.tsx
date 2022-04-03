import { Link, MetaFunction, Outlet, useLoaderData } from "remix";
import { json } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";
import { i18nHelper } from "~/locale/i18n.utils";

type LoaderData = {
  title: string;
  items: Array<{ id: string; name: string }>;
};

export let loader: LoaderFunction = async ({ request }) => {
  let { t } = await i18nHelper(request);

  const data: LoaderData = {
    title: `${t("models.joke.plural")} | ${process.env.APP_NAME}`,
    items: await db.joke.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  };
  return json(data);
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/app/jokes" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.items.map((joke) => (
                <li key={joke.id}>
                  <Link prefetch="intent" to={joke.id}>
                    {joke.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
