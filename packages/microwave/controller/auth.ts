import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { VerifyFunction } from "passport-local";

import { MongoServerError } from 'mongodb';
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

export const CheckUserFromGoogle = async (req: Request, res: Response) => {
    try {
        const token = await generateToken(res.locals.userEmail, "1d");
        // check if user already exists by email
        const user = await userDao.findUserByEmail(res.locals.userEmail);
        if (user) {
            // if user exists and has no googleID, update the user with the googleID
            // NOTE: this is a one-way binding, if the user already has a googleID, we don't update it
            if (!user.thirdPartyUniqueID) {
                const updatedUser = await userDao.updateUserGoogleID(user._id, res.locals.googleID, { new: true });
                if (!updatedUser) {
                    res.status(500).json({ message: "error while updating user with googleID" });
                    return;
                }
                res.status(200).json({
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    token: token,
                });
                return;
            }
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                token: token,
            });
            return;
        }

        // if user does not exist, create a new user
        const savedUser = await userDao.createUserWithGoogleID(
            res.locals.firstName,
            res.locals.lastName,
            res.locals.userEmail,
            res.locals.googleID
        );

        if (!savedUser) {
            res.status(500).json({ message: "error while creating user with googleID" });
            return;
        }

        res.status(201).json({
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            token: token,
        });
        return;
    } catch (error) {
        console.error("error while creating user via google oauth:", error);
        res.status(500).json({ message: "error while creating user via google" });
        return;
    }
};

export const SignUpController = async (req: Request, res: Response) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
        res.status(400).json({ message: "missing required fields" });
        return;
    }

    if (req.body.password.length > PASSWORD_RULE.MAX_LENGTH || req.body.password.length < PASSWORD_RULE.MIN_LENGTH) {
        res.status(400).json({ message: "password length must be between 8 and 20 characters" });
        return;
    }

    let newUser
    try {
      const salt = await bcrypt.genSalt(CRYPTO_PARAM.SALT_LENGTH)
      const hashedPassword = await CryptoUtils.hashPassword(req.body.password, salt);

      newUser = await userDao.createUser(
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        hashedPassword.toString(),
        Buffer.from(salt, "utf-8")
      );
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) {
        console.error('error while creating user with err:', err)
        res.status(400).json({ message: 'email already exists' })
        return
      }
      console.error('error while creating user with err:', err)
      res.status(500).json({ message: 'error while creating user' })
      return
    }

    const jwtToken = await generateToken(newUser.email, '1d')
    res.status(201).json({
      token: jwtToken
    })
};
