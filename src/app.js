import express from "express";
import cors from "cors";
import routes from "./routes/index.js"; // root route aggregator
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use("/api", routes);

// Health check route
app.get("/", (req, res) => {
  res.send("PCOS Backend API is running");
});

export default app; // default export required for server.js
