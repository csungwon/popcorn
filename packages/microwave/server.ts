import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// DB
import { connectMongoDB } from "./db";

// Routers
import router from "./router";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// @TODO: when we have frontend domain, we need to specify it.
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Middleware to parse cookies
app.use(cookieParser());

// Initialize MongoDB via Mongoose
connectMongoDB()
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/", router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${port}`);
});
