// external import
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { createServer } from "http";
import path from "path";

// internal imports
import { globalErrorHandler, noMatchRoute } from "./lib/error";
import appRouter from "./routes/index.js";
import { socketHandler } from "./socket";

// create new application and config
const app = express();
dotenv.config();
const httpServer = createServer(app);

// middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // ✅ THIS is critical
  })
);
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// health route
app.use("/health", (_req, res) => {
  res.status(200).json({ healthStatus: "ok" });
});

// routes ( version-1 )
app.use("/api/v1", appRouter);

// handle socket
socketHandler(httpServer);

// unknown route
app.use(noMatchRoute);

// global error handler
app.use(globalErrorHandler);

const port = process.env.PORT || 4000;

// server create
httpServer.listen(port, () => {
  console.log(`Server running on ${port}`);
});
