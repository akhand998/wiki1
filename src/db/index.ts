import assert from "node:assert";
import {neon} from "@neondatabase/serverless";
import {drizzle} from "drizzle-orm/neon-http";
import "dotenv/config";
import schema from "@/db/schema";

assert(
  process.env.DATABASE_URL,
  "DATABASE_URL is not set in environment variables",
);

export const sql=neon(process.env.DATABASE_URL);


const db=drizzle(sql,{schema});
export default db;