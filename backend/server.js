import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/request.Routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.id);
});

const PORT = 5001;
const HOST = "127.0.0.1";

server.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
