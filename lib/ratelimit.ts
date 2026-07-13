import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisClient = Redis.fromEnv();

export const loginRateLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, "5 m"), 
  analytics: true, 
  prefix: "@upstash/ratelimit",
});