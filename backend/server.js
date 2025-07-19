// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv"; // ✅ Load .env variables

// ✅ Load .env before anything else
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/requests.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
