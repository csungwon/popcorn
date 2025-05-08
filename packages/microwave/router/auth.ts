import express from "express";
import { Types } from "mongoose";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { AuthController } from "../controller";
import { userDao } from "../db/dao";

const router = express.Router();

// Authentication method for user with email and password.
passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        AuthController.LocalPassportStrategy
    )
);

// Authorization method for Google
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
        },
        AuthController.GooglePassportStrategy
    )
);

// Serialize/deserialize the user id and store it in the session.
passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, user._id);
    });
});

passport.deserializeUser((id: Types.ObjectId, cb) => {
    process.nextTick(async () => {
        const user = await userDao.findUserByID(id);
        return cb(null, user);
    });
});

router.post(
    "/signin/email",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login",
        failureMessage: true,
    })
);

router.post("/signout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/"); //  do not redirect
    });
});

router.post("/signup", (req, res, next) => {
    AuthController.SignUpController(req, res, next).catch(next);
});

export default router;
