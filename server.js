import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import dotenv from "dotenv";
import { startExpireAppointmentsJob } from "./src/jobs/expireAppointment.jobs.js";
import { startCyclePredictionJob } from "./src/jobs/cyclePrediction.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://self-plaza-calibrate.ngrok-free.dev",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket] connected: ${socket.id}`);

  socket.on("join", ({ type, userId, doctorId }) => {
    if (type === "user" && userId) {
      socket.join(`user:${userId}`);
      console.log(`[Socket] user:${userId} joined (socket ${socket.id})`);
    } else if (type === "doctor" && doctorId) {
      socket.join(`doctor:${doctorId}`);
      console.log(`[Socket] doctor:${doctorId} joined (socket ${socket.id})`);
    } else if (type === "admin") {
      socket.join("admin");
      console.log(`[Socket] admin joined (socket ${socket.id})`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startExpireAppointmentsJob();
  startCyclePredictionJob();
});
