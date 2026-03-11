import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  secret: env.authSecret,

  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [env.clientUrl],
});
