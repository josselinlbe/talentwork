import { BlogPost, BlogAuthor, BlogCategory, BlogPostTag, BlogTag } from "@prisma/client";
import { Colors } from "~/application/enums/shared/Colors";
import { db } from "../db.server";

export type BlogPostWithDetails = BlogPost & {
  author: BlogAuthor;
  category: BlogCategory;
  tags: (BlogPostTag & { tag: BlogTag })[];
};

export async function getAllBlogPosts(published?: boolean): Promise<BlogPostWithDetails[]> {
  let where = {};
  if (published) {
    where = {
      published,
    };
  }
  return await db.blogPost.findMany({
    where,
    orderBy: {
      date: "desc",
    },
    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getBlogPost(idOrSlug: string): Promise<BlogPostWithDetails | null> {
  return await db.blogPost.findFirst({
    where: {
      OR: [
        {
          id: idOrSlug,
        },
        {
          slug: idOrSlug,
        },
      ],
    },
    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function deleteBlogPost(id: string) {
  return await db.blogPost.delete({
    where: {
      id,
    },
  });
}

export async function getAllAuthors(): Promise<BlogAuthor[]> {
  return await db.blogAuthor.findMany({
    orderBy: {
      firstName: "asc",
    },
  });
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  return await db.blogCategory.findMany({
    orderBy: {
      color: "asc",
    },
  });
}

export async function getAllTags(): Promise<BlogTag[]> {
  return await db.blogCategory.findMany({
    orderBy: {
      color: "asc",
    },
  });
}

export async function createBlogPost(data: {
  slug: string;
  title: string;
  description: string;
  date: Date;
  image: string;
  content: string;
  readingTime: string;
  published: boolean;
  authorId: string;
  categoryId: string;
  tagNames: string[];
}): Promise<BlogPost> {
  const tags: BlogTag[] = [];

  Promise.all(
    data.tagNames.map(async (tagName) => {
      const tag = await db.blogTag.findUnique({
        where: { name: tagName.trim() },
      });
      if (tag) {
        tags.push(tag);
      } else {
        const tag = await db.blogTag.create({
          data: {
            name: tagName.trim(),
            color: Colors.BLUE,
          },
        });
        tags.push(tag);
      }
    })
  );

  const tagIds = tags.map((tag) => {
    return {
      tagId: tag.id,
    };
  });

  const post = await db.blogPost.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      date: data.date,
      image: data.image,
      content: data.content,
      readingTime: data.readingTime,
      published: data.published,
      authorId: data.authorId,
      categoryId: data.categoryId,
      tags: {
        create: tagIds,
      },
    },
  });

  await syncPostTags(post, data.tagNames);

  return post;
}

export async function updateBlogPost(
  id: string,
  data: {
    slug: string;
    title: string;
    description: string;
    date: Date;
    image: string;
    content: string;
    readingTime: string;
    published: boolean;
    authorId: string;
    categoryId: string;
    tagNames: string[];
  }
): Promise<BlogPost> {
  const post = await db.blogPost.update({
    where: {
      id,
    },
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      date: data.date,
      image: data.image,
      content: data.content,
      readingTime: data.readingTime,
      published: data.published,
      authorId: data.authorId,
      categoryId: data.categoryId,
    },
  });

  await syncPostTags(post, data.tagNames);

  return post;
}

export async function updateBlogPostPublished(id: string, published: boolean): Promise<BlogPost> {
  return await db.blogPost.update({
    where: {
      id,
    },
    data: {
      published,
    },
  });
}

export async function syncPostTags(post: BlogPost, tagNames: string[]) {
  const tagsWithoutDuplicates = Array.from(new Set(tagNames));
  const tags = await Promise.all(
    tagsWithoutDuplicates.map(async (tagName) => {
      const tag = await db.blogTag.findUnique({
        where: { name: tagName.trim() },
      });
      if (tag) {
        return tag;
      } else {
        return await db.blogTag.create({
          data: {
            name: tagName.trim(),
            color: Colors.BLUE,
          },
        });
      }
    })
  );
  await db.blogPostTag.deleteMany({
    where: {
      postId: post.id,
    },
  });
  Promise.all(
    tags.map(async (tag) => {
      return await db.blogPostTag.create({
        data: {
          postId: post.id,
          tagId: tag.id,
        },
      });
    })
  );
}
