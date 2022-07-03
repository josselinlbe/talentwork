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
    { name: "roles", color: Colors.GREEN },
    { name: "permissions", color: Colors.EMERALD },
    { name: "crm", color: Colors.GREEN },
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
    {
      slug: "saasrock-v0-2-7-roles-permissions-groups-and-row-level-visibility",
      title: "SaasRock v0.2.7 - Roles, Permissions, Groups, and Row-level visibility",
      description:
        "Added admin and application Roles & Permissions for page views and actions. Added application Groups and Row-level visibility - only you, public, or share with account members, groups, or specific users.",
      date: new Date("2022-06-18T19:43:00.000Z"),
      image:
        "https://res.cloudinary.com/practicaldev/image/fetch/s--lJ0dd22_--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://yahooder.sirv.com/saasrock/blog/june-2022-update/cover2.png",
      readingTime: "2 min",
      authorSlug: "alexandromtzg",
      categoryName: "Article",
      tagNames: ["remix", "roles", "permissions", "javascript"],
      published: true,
    },
    {
      slug: "creating-a-crm-from-scratch-using-the-entity-builder",
      title: "Creating a CRM from scratch using SaasRock’s Entity Builder",
      description: "I’ll write about the steps I take as I’m creating my own CRM for SaasRock’s core.",
      date: new Date("2022-07-01T16:14:00.000Z"),
      image: "https://miro.medium.com/max/1400/1*xxQyXe3hArR9bSibbR75fQ.png",
      readingTime: "5 min",
      authorSlug: "alexandromtzg",
      categoryName: "Article",
      tagNames: ["remix", "crm", "saas", "no-code"],
      published: true,
    },
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
