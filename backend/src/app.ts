import express from "express";
import cors from "cors";
import "./config/env";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import testRoutes from "./routes/test.routes";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/test", testRoutes);
app.get("/", (_, res) => {
  res.send("JustUs Backend Running ❤️");
});

// Auth routes
app.use("/auth", authRoutes);

app.get("/me", authMiddleware, (req: any, res) => {
  res.json({ userId: req.userId });
});

export default app;
