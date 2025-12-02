import assert from "node:assert";
import "dotenv/config";

import { defineConfig } from "drizzle-kit";

assert(
  process.env.DATABASE_URL,
  "DATABASE_URL is not set in environment variables",
);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
