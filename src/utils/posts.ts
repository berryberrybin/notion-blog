import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

/**
 * Get all posts sorted by number (ascending) and publishedAt (descending)
 */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts");

  return posts.sort((a, b) => {
    // Primary sort: number (ascending)
    if (a.data.number !== b.data.number) {
      return a.data.number - b.data.number;
    }
    // Secondary sort: publishedAt (descending)
    const dateA = a.data.publishedAt ? new Date(a.data.publishedAt).getTime() : 0;
    const dateB = b.data.publishedAt ? new Date(b.data.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Get posts sorted by date (most recent first)
 */
export async function getPostsByDate(): Promise<Post[]> {
  const posts = await getCollection("posts");

  return posts.sort((a, b) => {
    const dateA = a.data.publishedAt || a.data.createdAt;
    const dateB = b.data.publishedAt || b.data.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

/**
 * Get posts sorted by update date (most recently updated first)
 */
export async function getPostsByUpdateDate(): Promise<Post[]> {
  const posts = await getCollection("posts");

  return posts.sort((a, b) => {
    return new Date(b.data.updatedAt).getTime() - new Date(a.data.updatedAt).getTime();
  });
}

/**
 * Get all unique categories with post counts
 */
export async function getCategories(): Promise<{ name: string; count: number }[]> {
  const posts = await getCollection("posts");
  const categories = new Map<string, number>();

  posts.forEach((post) => {
    const cat = post.data.category;
    categories.set(cat, (categories.get(cat) || 0) + 1);
  });

  return Array.from(categories.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all unique tags with post counts
 */
export async function getTags(): Promise<{ name: string; count: number }[]> {
  const posts = await getCollection("posts");
  const tags = new Map<string, number>();

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });

  return Array.from(tags.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get posts filtered by category
 */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getSortedPosts();
  return posts.filter((post) => post.data.category === category);
}

/**
 * Get posts filtered by tag
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getSortedPosts();
  return posts.filter((post) => post.data.tags.includes(tag));
}

/**
 * Format date for display (Korean locale)
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date for datetime attribute
 */
export function formatDateISO(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toISOString();
}
