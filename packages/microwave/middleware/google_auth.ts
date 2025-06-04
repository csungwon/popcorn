import { NextFunction, Request, Response } from "express";
import { OAuth2Client, TokenPayload } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validateGoogleToken = async (payload?: TokenPayload) => {
    if (!payload) {
        return {
            valid: false,
            error: "invalid google token",
        };
    }
    if (!payload.email_verified) {
        return {
            valid: false,
            error: "google email not verified",
        };
    }
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        return {
            valid: false,
            error: "google token audience mismatch",
        };
    }
    if (payload.iss !== "accounts.google.com" && payload.iss !== "https://accounts.google.com") {
        return {
            valid: false,
            error: "issuer mismatch",
        };
    }

    return {
        valid: true,
    };
};

export const VerifyGoogleToken = async (req: Request, res: Response, next: NextFunction) => {
    const googleToken = req.body.token;
    if (!googleToken) {
        res.status(400).json({ error: "google token is required" });
        return;
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const validation = await validateGoogleToken(payload);
        if (!validation.valid) {
            res.status(400).json({ error: validation.error });
            return
        }

        res.locals = {
            userEmail: payload?.email,
            googleID: payload?.sub,
            firstName: payload?.given_name || "",
            lastName: payload?.family_name || "",
        };

        next();
    } catch (error) {
        console.error("error verifying Google token:", error);
        res.status(500).json({ error: "internal server error" });
        return;
    }

};
