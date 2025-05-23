import jwt from "jsonwebtoken";

export const generateToken = (email: string, expiresIn: jwt.SignOptions["expiresIn"]) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret);
};
