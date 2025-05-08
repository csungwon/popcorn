import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import passport from "passport";

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

app.use(
    session({
        secret: process.env.SESSION_SECRET || "development",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: true, // requires HTTPS
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
        // store: new RedisStore({{}) // Uncomment this line to use Redis for session storage
        // NOTE: RedisStore requires additional setup and configuration
    })
);

app.use(passport.initialize());
app.use(passport.session());

// ! NOTE: TO BE REMOVED
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/", router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${port}`);
});
