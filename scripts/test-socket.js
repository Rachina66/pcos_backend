import { io } from "socket.io-client";

const SERVER = "http://localhost:4000";

const WATCHED_EVENTS = [
  "appointment:new",
  "appointment:cancelled_by_user",
  "appointment:status_updated",
];

function timestamp() {
  return new Date().toISOString();
}

function makeClient(label, joinPayload) {
  const socket = io(SERVER, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log(`[${timestamp()}] [${label}] connected (id: ${socket.id})`);
    socket.emit("join", joinPayload);
    console.log(`[${timestamp()}] [${label}] sent join:`, joinPayload);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[${timestamp()}] [${label}] disconnected — ${reason}`);
  });

  socket.on("connect_error", (err) => {
    console.error(`[${timestamp()}] [${label}] connection error: ${err.message}`);
  });

  WATCHED_EVENTS.forEach((event) => {
    socket.on(event, (data) => {
      console.log(`[${timestamp()}] [${label}] EVENT "${event}":`, JSON.stringify(data, null, 2));
    });
  });

  return socket;
}

const adminClient  = makeClient("ADMIN",  { type: "admin" });
const doctorClient = makeClient("DOCTOR", { type: "doctor", doctorId: "test123" });

process.on("SIGINT", () => {
  console.log("\nDisconnecting…");
  adminClient.disconnect();
  doctorClient.disconnect();
  process.exit(0);
});
