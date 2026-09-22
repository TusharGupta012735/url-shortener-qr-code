import path from "node:path";
import dotenv from "dotenv";

// Loads the repo-root .env regardless of which module imports this file.
dotenv.config({ path: path.resolve(import.meta.dirname, "../../../.env") });
