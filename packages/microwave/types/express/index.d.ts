import type express from "express";
import { ObjectId } from "mongodb";

interface LogInUserSession {
    email: string;
}

declare global {
    namespace Express {
        interface User {
            _id: ObjectId;
            email: string;
        }

        interface Request {
            login(user: LogInUserSession, done: (err: Error) => void): void;
        }
    }
}
