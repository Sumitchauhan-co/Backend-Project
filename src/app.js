import express from "express";
import userRouter from "./routes/user.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { SERVER_LIMIT } from "./constants.js";

// server created

const app = express();

// config middlewares

app.use(cors());

app.use(express.json({ limit: SERVER_LIMIT }));

app.use(express.urlencoded({ extended: true, limit: SERVER_LIMIT }));

app.use(express.static("public"));

app.use(cookieParser());


// routes


app.use("/api/v1/users", userRouter)


export default app;
