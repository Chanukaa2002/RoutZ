import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import graphRoutes from "./routes/graphRoutes.js";
import dsRoutes from "./routes/dsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/graph", graphRoutes);
app.use("/api/ds", dsRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "FindFast API Server is running!" });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
