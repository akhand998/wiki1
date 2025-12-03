"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import db from "@/db";
import { authorizeUserToEditArticle } from "@/db/authz";
import { articles } from "@/db/schema";
import { stackServerApp } from "@/stack/server";

// Server actions for articles (stubs)
// TODO: Replace with real database operations when ready

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  try {
    await db.insert(articles).values({
      title: data.title,
      content: data.content,
      slug: `${Date.now()}`,
      authorId: data.authorId,
      imageUrl: data.imageUrl ?? undefined,
      createdAt: new Date().toISOString(),
    });

    console.log("✨ createArticle called:", data);
    return { success: true, message: "Article created successfully" };
  } catch (error) {
    console.error("Database error, operation failed:", error);
    return {
      success: false,
      message: "Failed to create article (database connection issue)",
    };
  }
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error(
      "❌ Forbidden: You do not have permission to edit this article.",
    );
  }

  console.log("📝 updateArticle called:", { id, ...data });

  try {
    await db
      .update(articles)
      .set({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl ?? undefined,
      })
      .where(eq(articles.id, +id));
    return { success: true, message: `Article ${id} updated successfully` };
  } catch (error) {
    console.error("Database error, operation failed:", error);
    return {
      success: false,
      message: "Failed to update article (database connection issue)",
    };
  }
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error(
      "❌ Forbidden: You do not have permission to delete this article.",
    );
  }

  console.log("🗑️ deleteArticle called:", id);

  try {
    await db.delete(articles).where(eq(articles.id, +id));
    return { success: true, message: `Article ${id} deleted successfully` };
  } catch (error) {
    console.error("Database error, operation failed:", error);
    return {
      success: false,
      message: "Failed to delete article (database connection issue)",
    };
  }
} // Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}
