import { Colors } from "~/application/enums/shared/Colors";
import { db } from "~/utils/db.server";
import { getMdxContent } from "~/utils/services/blogService";

export async function seedBlog() {
  await seedTags([
    { name: "webdev", color: Colors.PURPLE },
    { name: "javascript", color: Colors.YELLOW },
    { name: "tips", color: Colors.INDIGO },
    { name: "tutorial", color: Colors.BLUE },
    { name: "learnings", color: Colors.GREEN },
    { name: "remix", color: Colors.GRAY },
    { name: "vue", color: Colors.GREEN },
    { name: "react", color: Colors.BLUE },
    { name: "svelte", color: Colors.ORANGE },
    { name: "tailwindcss", color: Colors.TEAL },
    { name: "dotnet", color: Colors.VIOLET },
    { name: "saas", color: Colors.TEAL },
    { name: "boilerplate", color: Colors.GREEN },
    { name: "design", color: Colors.PINK },
    { name: "winforms", color: Colors.GRAY },
    { name: "no-code", color: Colors.GRAY },
    { name: "entity-builder", color: Colors.GRAY },
  ]);

  await seedAuthors([
    {
      slug: "alexandromtzg",
      firstName: "Alexandro",
      lastName: "Martínez",
      image: "https://pbs.twimg.com/profile_images/884523699419795456/KPDJKlum_400x400.jpg",
      url: "https://twitter.com/AlexandroMtzG",
    },
  ]);

  await seedCategories([
    { name: "Article", color: Colors.INDIGO },
    { name: "Tutorial", color: Colors.ORANGE },
  ]);

  await seedBlogPosts();
}

export async function seedBlogPosts() {
  const posts = [
    // {
    //   slug: "my-designs-from-2016-to-2020-as-a-non-designer",
    //   title: "My designs from 2016 to 2020 as a non-designer",
    //   description: "I've been a developer for almost 9 years, but I always found designing to be tedious work. These are my application designs since 2016.",
    //   date: new Date("2020-12-18T08:11:34.000Z"),
    //   image:
    //     "https://res.cloudinary.com/practicaldev/image/fetch/s--CB8fG5zp--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/i/qhurjvqjjtv8ti3b9h5p.png",
    //   readingTime: "2 min",
    //   authorSlug: "alexandromtzg",
    //   categoryName: "Article",
    //   tagNames: ["webdev", "design", "winforms", "tailwindcss"],
    //   published: true,
    // },
    // {
    //   slug: "saasfrontends-v1",
    //   title: "SaasFrontends - Vue2, Vue3, React and Svelte templates",
    //   description:
    //     "Today I'm finally releasing SaasFrontends v1.0, a SaaS template in Vue2, Vue3, React and Svelte, using Tailwind CSS as CSS Framework and .NET as the backend.",
    //   date: new Date("2022-01-17T13:09:29.000Z"),
    //   image:
    //     "https://res.cloudinary.com/practicaldev/image/fetch/s--tVwYN6PG--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://yahooder.sirv.com/saasfrontends/meta/social-card-large.jpg",
    //   readingTime: "5 min",
    //   authorSlug: "alexandromtzg",
    //   categoryName: "Article",
    //   tagNames: ["vue", "react", "svelte", "boilerplate"],
    //   published: true,
    // },
    {
      slug: "remix-saas-kit-v0-0-1-quickstart-core-concepts",
      title: "Remix SaaS kit v0.0.1 - QuickStart & Core Concepts",
      description: "Learn what you can do with the Remix SaaS kit.",
      date: new Date("2022-01-16T16:43:00.000Z"),
      image: "https://yahooder.sirv.com/saasfrontends/remix/blog/quickstart/cover.png",
      readingTime: "10 min",
      authorSlug: "alexandromtzg",
      categoryName: "Tutorial",
      tagNames: ["remix", "react", "saas", "tutorial"],
      published: true,
    },
    {
      slug: "7-things-i-ve-learned-using-remix-for-1-month",
      title: "7 things I've learned using Remix for 1 month",
      description: "Full-stack routes, loaders, actions, error boundaries, optimistic UI, and more.",
      date: new Date("2022-04-20T13:48:43.000Z"),
      image:
        "https://res.cloudinary.com/practicaldev/image/fetch/s--FKLSECa6--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://yahooder.sirv.com/saasfrontends/remix/blog/1-month/cover.png",
      readingTime: "8 min",
      authorSlug: "alexandromtzg",
      categoryName: "Article",
      tagNames: ["remix", "webdev", "javascript", "react"],
      published: true,
    },
    {
      slug: "saasrock-the-remix-saas-kit-may-2022-product-update",
      title: "SaasRock - The Remix SaaS kit - May 2022 Product Update",
      description: "Custom Entities with Views/Forms/API/Webhooks, PER_SEAT pricing model, and new docs page.",
      date: new Date("2022-05-31T21:09:43.000Z"),
      image:
        "https://res.cloudinary.com/practicaldev/image/fetch/s--Bad8lSI0--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://yahooder.sirv.com/saasrock/blog/may-2022-update/cover.png",
      readingTime: "2 min",
      authorSlug: "alexandromtzg",
      categoryName: "Article",
      tagNames: ["remix", "webdev", "no-code", "entity-builder"],
      published: true,
    },
    // {
    //   slug: "saas-dev-challenges-01-ui-ux-design-system",
    //   title: "🎯 SaaS dev challenges - #01 - 🎨 UI/UX & design system",
    //   description: "It's daunting thinking of building a SaaS app because deep down, we all know how much stuff we'll need to go through...",
    //   date: new Date("2022-04-25T09:02:30.000Z"),
    //   image:
    //     "https://res.cloudinary.com/practicaldev/image/fetch/s--UcfrSJUG--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://yahooder.sirv.com/blog/saas-dev-challenges/01/thumb.png",
    //   readingTime: "4 min",
    //   authorSlug: "alexandromtzg",
    //   categoryName: "Article",
    //   tagNames: ["learnings", "saas", "webdev", "tips"],
    //   published: true,
    // },
    // {
    //   slug: "saas-dev-challenges-02-authentication",
    //   title: "🎯 SaaS dev challenges - #02 - 🗝 ️Authentication",
    //   description: "In my previous post, I talked about how UI/UX is a challenge you face right after you start your SaaS. TLDR: Use an existing UI library...",
    //   date: new Date("2022-04-26T09:02:30.000Z"),
    //   image:
    //     "https://res.cloudinary.com/practicaldev/image/fetch/s--Iyh8V1FV--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://yahooder.sirv.com/blog/saas-dev-challenges/02/thumb.png",
    //   readingTime: "3 min",
    //   authorSlug: "alexandromtzg",
    //   categoryName: "Article",
    //   tagNames: ["learnings", "saas", "webdev", "authentication"],
    //   published: true,
    // },
  ];

  return Promise.all(
    posts.map(async (post) => {
      return await seedBlogPost(post);
    })
  );
}

async function seedTags(tags: { name: string; color: Colors }[]) {
  Promise.all(
    tags.map(async (data) => {
      return await db.blogTag.create({
        data,
      });
    })
  );
}

async function seedAuthors(
  authors: {
    slug: string;
    firstName: string;
    lastName: string;
    image: string;
    url: string;
  }[]
) {
  Promise.all(
    authors.map(async (data) => {
      return await db.blogAuthor.create({
        data,
      });
    })
  );
}

async function seedCategories(
  items: {
    name: string;
    color: Colors;
  }[]
) {
  Promise.all(
    items.map(async (data) => {
      return await db.blogCategory.create({
        data,
      });
    })
  );
}

async function seedBlogPost(post: {
  slug: string;
  title: string;
  description: string;
  date: Date;
  image: string;
  readingTime: string;
  published: boolean;
  authorSlug: string;
  categoryName: string;
  tagNames: string[];
}) {
  const existingBlogPost = await db.blogPost.findUnique({
    where: {
      slug: post.slug,
    },
  });
  if (existingBlogPost) {
    // eslint-disable-next-line no-console
    console.log("existing blog post with slug: " + post.slug);
    return;
  }

  const author = await db.blogAuthor.findUnique({
    where: {
      slug: post.authorSlug,
    },
  });
  const category = await db.blogCategory.findUnique({
    where: {
      name: post.categoryName,
    },
  });
  const tags = await db.blogTag.findMany({
    where: {
      name: { in: post.tagNames },
    },
  });
  const tagIds = tags.map((tag) => {
    return {
      tagId: tag.id,
    };
  });

  const content = await getMdxContent(post.slug);
  return await db.blogPost.create({
    data: {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      image: post.image,
      content,
      readingTime: post.readingTime,
      published: post.published,
      authorId: author?.id ?? "",
      categoryId: category?.id ?? "",
      tags: {
        create: tagIds,
      },
    },
  });
}
