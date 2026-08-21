import express from "express";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

try {
await connectDB();
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
