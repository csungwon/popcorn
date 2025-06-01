import express from "express";
import { Types } from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";

import { AuthController } from "../controller";
import { userDao } from "../db/dao";

const router = express.Router();

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || "",
        },
        async (jwtPayload, done) => {
            const email = jwtPayload.email;

            try {
                const user = await userDao.findUserByEmail(email);
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
                console.error(new Error("unauthorized token"));
                return done(error, false);
            }
        }
    )
);

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

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        successRedirect: "/",
    })
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
    "/default",
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
    AuthController.SignUpController(req, res).catch(next);
});

export default router;
