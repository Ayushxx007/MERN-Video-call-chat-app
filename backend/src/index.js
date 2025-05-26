import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import { connectDB } from "./lib/db.lib.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());


const port = process.env.PORT || 5101;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});


app.use("/api/auth", authRouter);
app.use("/api/users",userRouter);


