import express from "express";
import cors from "cors";
import { connectDB, db } from "./src/db.js";
import { env } from "./src/env.js";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { toNodeHandler } from "better-auth/node";
import { bearer, jwt } from "better-auth/plugins";

async function start() {
  await connectDB();

  const auth = betterAuth({
    secret: env.authSecret,

    database: mongodbAdapter(db),

    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: "offline",
        prompt: "select_account consent",
      },
    },
    plugins: [bearer()],
    trustedOrigins: [env.clientUrl],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60, // 1 Hour, then Go falls back to DB lookup
        strategy: "jwt",
      },
    },
  });

  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );

  app.use(express.json());

  app.use("/api/auth", toNodeHandler(auth));

  app.listen(env.port, () => {
    console.log(`Auth server running on port ${env.port}`);
  });
}

start();
