import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./src/modules/user/user.routes";
import weeklyPlanRoutes from "./src/modules/weekly-plan/weekly-plan.routes";
import dailyPlanRoutes from "./src/modules/daily-plan/daily.plan.routes";

dotenv.config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const VERSION = process.env.VERSION;

console.log("ENVIRONMENT:", NODE_ENV);

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(`/api/${VERSION}`, userRoutes);
app.use(`/api/${VERSION}/weekly-plan`, weeklyPlanRoutes)
app.use(`/api/${VERSION}/foreman`, dailyPlanRoutes)

app.get("/health", async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // query sederhana ke Postgres
    res.json({ status: "ok", message: "Connected to Postgres" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Database not connected", error: err });
  }
});

console.log("REQUEST RECEIVED WITHOUT ROUTE");

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));