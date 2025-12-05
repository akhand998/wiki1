"use server";

import redis from "@/cache";
import sendCelebrationEmail from "@/email/celebration-email";

const milestone = [10,50,100,500,1000,5000,10000];

const keyFor = (id: number | string) => `pageviews:article:${id}`;

export async function incrementPageview(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);
  if (milestone.includes(newVal)) {
    sendCelebrationEmail(articleId, newVal);
  }
  return +newVal;
}
