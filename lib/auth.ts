import "server-only";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { nextCookies } from "better-auth/next-js";
import { getDatabase } from "./database.ts";
function authBaseUrl() {
  return process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BETTER_AUTH_URL;
}
export function cloudConfigured() {
  return (
    !!process.env.DATABASE_URL &&
    (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32 &&
    !!authBaseUrl()
  );
}
function createAuth() {
  if (!cloudConfigured()) throw new Error("CLOUD_CONFIG");
  return betterAuth({
    appName: "Aasra",
    database: getDatabase(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: authBaseUrl(),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/username": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
      },
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 30,
        usernameValidator: (value) => /^[a-zA-Z0-9_.]{3,30}$/.test(value),
      }),
      nextCookies(),
    ],
  });
}
let auth: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return (auth ??= createAuth());
}
