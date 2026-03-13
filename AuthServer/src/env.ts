import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const env = {
  port: Number(process.env.AUTH_PORT),
  hostUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
  mongoUri: process.env.MONGODB_URI!,
  authSecret: process.env.JWT_SECRET!,
  clientUrl: process.env.FRONTEND_URL!,
};
