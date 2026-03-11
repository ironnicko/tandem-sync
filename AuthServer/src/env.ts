import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const env = {
  port: Number(process.env.PORT),
  hostUrl: process.env.BETTER_AUTH_URL!,
  mongoUri: process.env.MONGODB_URI!,
  authSecret: process.env.BETTER_AUTH_SECRET!,
  clientUrl: process.env.CLIENT_URL!,
};
