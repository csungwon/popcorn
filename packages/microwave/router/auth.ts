import express from "express";
import { Types } from "mongoose";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";

import { AuthController, jwtController } from "../controller";
import { userDao } from "../db/dao";
import { googleAuthMiddleware } from "../middleware";
import { asyncHandler } from "../util/asyncHandler";
import { generateToken } from "../util/jwt";
import { User } from "../db/model/user";

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

router.get(
    "/google",
    asyncHandler(googleAuthMiddleware.VerifyGoogleToken),
    asyncHandler(AuthController.CheckUserFromGoogle)
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

router.post("/default", async (req, res) => {
    passport.authenticate(
        "local",
        { session: false },
        async (err: Error | null, user: User, info?: { message?: string }) => {
            if (err) {
                return res.status(500).json({ message: "Internal server error" });
            }
            if (!user) {
                return res.status(401).json({ message: info?.message || "Invalid credentials" });
            }

            const jwtToken = await generateToken(user.email, "1d");

            return res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                token: jwtToken,
            });
        }
    )(req, res);
});

router.post("/signout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/"); //  do not redirect
    });
});

router.post("/signup", asyncHandler(AuthController.SignUpController));

router.get("/check", jwtController.jwtAuthenticator, (req, res) => {
    res.status(200).json({
        message: "Authenticated",
        userEmail: req.user?.email,
    });
})

export default router;
