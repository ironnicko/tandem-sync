import express from "express";
import cors from "cors";
import { connectDB, db } from "./src/db.js";
import { env } from "./src/env.js";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { toNodeHandler } from "better-auth/node";

async function start() {
  await connectDB();

  const auth = betterAuth({
    secret: env.authSecret,

    database: mongodbAdapter(db),

    emailAndPassword: {
      enabled: true,
    },

    trustedOrigins: [env.clientUrl],
  });

  const app = express();

  app.use(
    cors({
      origin: env.hostUrl,
      credentials: true,
    })
  );

  app.use(express.json());

  app.use("/api/auth", toNodeHandler(auth));

  app.listen(env.port, () => {
    console.log(`Auth server running on port ${env.port}`);
  });
}

start();