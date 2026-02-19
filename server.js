import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  let uri = process.env.MONGODB_URI;

  // In development, fall back to in-memory MongoDB if no URI is configured
  if (!uri || uri === "mongodb://localhost:27017/marketpoint") {
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log("Using in-memory MongoDB for local development");
    } catch {
      console.error(
        "No MONGODB_URI set and mongodb-memory-server not available.",
      );
      console.error("Set MONGODB_URI in your environment variables.");
      process.exit(1);
    }
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Startup error:", err.message);
  process.exit(1);
});
