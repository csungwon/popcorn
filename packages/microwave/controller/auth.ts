import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { VerifyFunction } from "passport-local";

import { CRYPTO_PARAM, PASSWORD_RULE } from "../const";
import { userDao } from "../db/dao";
import { CryptoUtils } from "../util";
import { generateToken } from "../util/jwt";

export const LocalPassportStrategy: VerifyFunction = async (email, password, cb) => {
    try {
        const user = await userDao.findUserByEmail(email);
        if (!user) {
            return cb(null, false, { message: "invalid credentials" });
        }

        if (user.password === null || user.password === undefined) {
            return cb(null, false, { message: "invalid credentials" });
        }

        const passwordMatch = await CryptoUtils.comparePassword(password, user.password);
        if (!passwordMatch) {
            return cb(null, false, { message: "invalid credentials" });
        }
        return cb(null, user);
    } catch (error) {
        return cb(error);
    }
};

export const GooglePassportStrategy = async (
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    cb: VerifyCallback
) => {
    const googleID = profile.id;
    const googleEmail = profile.emails?.[0].value;

    if (!googleEmail) {
        return cb(new Error("Google email not found"));
    }

    try {
        // check if user already exists by email
        const user = await userDao.findUserByEmail(googleEmail);
        if (user) {
            // if user exists and has no googleID, update the user with the googleID
            // NOTE: this is a one-way binding, if the user already has a googleID, we don't update it
            if (!user.thirdPartyUniqueID) {
                const updatedUser = await userDao.updateUserGoogleID(user._id, googleID, { new: true });
                if (!updatedUser) {
                    return cb(null, user);
                }
                return cb(null, updatedUser);
            }
            return cb(null, user);
        }

        // if user does not exist, create a new user
        const savedUser = await userDao.createUserWithGoogleID(
            profile.name?.givenName || "",
            profile.name?.familyName || "",
            googleEmail,
            googleID
        );

        return cb(null, savedUser);
    } catch (error) {
        console.error("error while creating user via google oauth:", error);
        return cb(error);
    }
};

export const SignUpController = async (req: Request, res: Response) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "missing required fields" });
    }

    if (req.body.password.length > PASSWORD_RULE.MAX_LENGTH || req.body.password.length < PASSWORD_RULE.MIN_LENGTH) {
        return res.status(400).json({ message: "password length must be between 8 and 20 characters" });
    }

    try {
        const salt = await bcrypt.genSalt(CRYPTO_PARAM.SALT_LENGTH);
        const hashedPassword = await CryptoUtils.hashPassword(req.body.password, salt);

        const newUser = await userDao.createUser(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            hashedPassword.toString(),
            Buffer.from(salt, "utf-8")
        );

        const jwtToken = await generateToken(newUser.email, "1d");
        return res.status(201).json({
            token: jwtToken,
        });
    } catch (err) {
        console.error("error while creating user with err:", err);
        return res.status(500).json({ message: "error while creating user" });
    }
};
