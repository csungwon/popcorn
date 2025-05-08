import { Types } from "mongoose";
import { User } from "../model";

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email: email }).exec();
};

export const findUserByID = async (id: Types.ObjectId) => {
    return await User.findById(id).exec();
};

export const createUser = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    salt: Buffer
) => {
    const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        salt,
    });
    return await newUser.save();
};

export const updateUserGoogleID = async (id: Types.ObjectId, googleID: string) => {
    return await User.findByIdAndUpdate(id, { thirdPartyUniqueID: googleID, provider: "google" }).exec();
};

export const createUserWithGoogleID = async (firstName: string, lastName: string, email: string, googleID: string) => {
    const newUser = new User({
        firstName,
        lastName,
        email,
        thirdPartyUniqueID: googleID,
        provider: "google",
    });

    return await newUser.save();
};
