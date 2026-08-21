import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { registerSocketHandlers } from "./socket/handlers";

// Routes
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import voteRoutes from "./routes/votes";
import commentRoutes from "./routes/comments";
import aiRoutes from "./routes/ai";
import userRoutes from "./routes/users";
import mapRoutes from "./routes/map";
import emergencyRoutes from "./routes/emergency";

/* ─── Env validation ─── */

const REQUIRED_ENV = ["JWT_SECRET", "JWT_REFRESH_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = parseInt(process.env.PORT || "4000", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

/* ─── Express app ─── */

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

/* ─── HTTP + Socket.io server ─── */

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: CORS_ORIGIN, credentials: true },
});

// Make io accessible in route handlers via req.app.io.
(app as any).io = io;

// Register Socket.io event handlers.
registerSocketHandlers(io);

/* ─── Mount API routes ─── */

const api = express.Router();
api.use("/auth", authRoutes);
api.use("/posts", postRoutes);
api.use("/posts", voteRoutes); // /posts/:id/vote
api.use("/posts", commentRoutes); // /posts/:id/comments
api.use("/posts", aiRoutes); // /posts/:id/ai-suggest
api.use("/comments", commentRoutes); // /comments/:id (DELETE)
api.use("/users", userRoutes);
api.use("/map", mapRoutes);
api.use("/emergency", emergencyRoutes);

app.use("/api/v1", api);

// Health check.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ─── Global error handler ─── */

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Internal server error", code: "INTERNAL" });
});

/* ─── Start ─── */

server.listen(PORT, () => {
  console.log(`\n🟢 UpAware API running on http://localhost:${PORT}`);
  console.log(`   REST  → http://localhost:${PORT}/api/v1`);
  console.log(`   WS    → ws://localhost:${PORT}`);
  console.log(`   CORS  → ${CORS_ORIGIN}\n`);
});
