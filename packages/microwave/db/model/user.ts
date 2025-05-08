import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    salt: {
        type: Buffer,
    },
    thirdPartyUniqueID: {
        type: String,
        sparse: true,
        unique: true,
    },
    provider: {
        type: String,
        enum: ["google", "email"],
        default: "email",
    },    
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export const User = mongoose.model("User", UserSchema);
