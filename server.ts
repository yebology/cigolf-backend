import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";

dotenv.config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

console.log("ENVIRONMENT:", NODE_ENV);

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // query sederhana ke Postgres
    res.json({ status: "ok", message: "Connected to Postgres" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Database not connected", error: err });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
