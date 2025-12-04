import { eq } from "drizzle-orm";
import { usersSync } from "drizzle-orm/neon";
import db from "@/db/index";
import { articles } from "@/db/schema";
import {redis} from "@/cache";

const mockArticles = [
  {
    id: 1,
    title: "Welcome to WikiFlow",
    content: `# Getting Started\n\nWelcome to WikiFlow!`,
    author: "Admin User",
    createdAt: "2024-01-15T10:00:00Z",
    imageUrl: "/placeholder-image.svg",
  },
  {
    id: 2,
    title: "Markdown Guide",
    content: `# Markdown Basics\n\nLearn Markdown here.`,
    author: "John Doe",
    createdAt: "2024-01-16T14:30:00Z",
    imageUrl: null,
  },
];

export async function getArticles() {
  const cached = await redis.get("articles:all");
  if (cached) {
    console.log("✅ Articles fetched from cache");
    return cached;
  }
  
  console.log("⚠️ Articles not in cache, fetching from DB");
  try {
    const response = await db
      .select({
        title: articles.title,
        id: articles.id,
        createdAt: articles.createdAt,
        content: articles.content,
        author: usersSync.name,
      })
      .from(articles)
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
    await redis.set("articles:all", response, { ex: 60 }); 

    return response;
  } catch (error) {
    console.error("Database connection failed, using mock data:", error);
    return mockArticles;
  }
}

export async function getArticleById(id: number) {
  try {
    const response = await db
      .select({
        title: articles.title,
        id: articles.id,
        createdAt: articles.createdAt,
        content: articles.content,
        author: usersSync.name,
        imageUrl: articles.imageUrl,
      })
      .from(articles)
      .where(eq(articles.id, id))
      .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
    return response[0] ? response[0] : null;
  } catch (error) {
    console.error("Database connection failed, using mock data:", error);
    return mockArticles.find((a) => a.id === id) || null;
  }
}
