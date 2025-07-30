import "reflect-metadata"; // Must be imported first
import express from "express";
import { useExpressServer } from "routing-controllers";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";
import { FileController } from "./controllers/FileController";
import { PrismaClient } from "@prisma/client";

dotenv.config();

async function main() {
  await initializeDatabase();
  console.log(
    "Successfully connected to MySQL database: frontend_file_library"
  );

  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
    errorFormat: "pretty",
  });
  try {
    await prisma.$connect();
    console.log("Prisma successfully connected to the database");
    await prisma.file.findMany({ take: 1 });
    console.log("Prisma schema validated successfully");
  } catch (error) {
    console.error("Prisma failed to connect to the database:", error);
    process.exit(1);
  }

  const app = express();
  const port = process.env.PORT || 3001;

  // Explicitly use express.json() first to handle JSON parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(cors());

  const server = createServer(app);

  useExpressServer(app, {
    controllers: [FileController],
    defaultErrorHandler: false,
    defaults: {
      paramOptions: {
        required: true,
      },
    },
  });

  server.listen(port, () => {
    console.log(`Frontend backend running on port ${port}`);
  });
}

main().catch((error) => {
  console.error("Failed to start Frontend Backend:", error);
  process.exit(1);
});
