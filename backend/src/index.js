import express from "express";
import cors from "cors";


import "dotenv/config";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());


const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URL;


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);


app.get("/", (req, res) => {
  res.send("API is working");
});

app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("DB connected");
    })
    .catch((error) => {
        console.error("DB connection error:", error.message);
    });
});