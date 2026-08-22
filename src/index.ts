import express from "express";
import { connectDB } from "./config/db.js";
import { env } from "node:process";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = Number(env.port ?? 3000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);

try {
await connectDB();
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
