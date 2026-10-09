import express from "express";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import cors from "cors";

const app = express();
const PORT = env.port;

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use(cors({ origin: env.corsOrigin }));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);

app.use("/api/feed", feedRoutes);

try {
    await connectDB();
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
