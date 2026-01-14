import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("posts");

  // Sort by publishedAt descending
  const sortedPosts = posts.sort((a, b) => {
    const dateA = a.data.publishedAt || a.data.createdAt;
    const dateB = b.data.publishedAt || b.data.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return rss({
    title: "Tech Blog",
    description: "Development notes, tutorials, and insights",
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt ? new Date(post.data.publishedAt) : new Date(post.data.createdAt),
      description: post.data.summary,
      link: `/posts/${post.data.slug}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>ko-kr</language>`,
  });
}
