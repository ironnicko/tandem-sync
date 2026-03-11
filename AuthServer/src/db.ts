import { Db, MongoClient } from "mongodb";
import { env } from "./env.js";

export let client: MongoClient;
export let db: Db;

export async function connectDB() {
  client = new MongoClient(env.mongoUri);
  await client.connect();
  db = client.db("bikeapp");
  console.log("MongoDB connected");
}
