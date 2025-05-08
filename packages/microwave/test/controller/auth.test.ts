import { Request, Response } from "express";

import { AuthController } from "../../controller";
import { connectMongoDBForTest, destroyTestbedDB } from "../../db";
import { userDao } from "../../db/dao";

beforeEach(async () => {
    await connectMongoDBForTest();
});

afterEach(async () => {
    await destroyTestbedDB();
});

describe("AuthController", () => {
    it("should have a LocalPassportStrategy function", () => {
        expect(AuthController.LocalPassportStrategy).toBeDefined();
    });

    it("should have a SignUpController function", () => {
        expect(AuthController.SignUpController).toBeDefined();
    });

    it("should be able to sign up a user and log in successfully with valid user credentials and log in should fail with invalid credentials provided", async () => {
        const req = {
            body: {
                firstName: "Sean",
                lastName: "Cho",
                email: "seancho@test.com",
                password: "password1234",
            },
            login: jest.fn((user, callback) => callback(null)), // simulate passport's req.login
        } as unknown as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            redirect: jest.fn(),
        } as unknown as Response;

        await AuthController.SignUpController(req as Request, res as Response, jest.fn());
        expect(req.login).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);

        const user = await userDao.findUserByEmail("seancho@test.com");
        expect(user).toBeDefined();
        expect(user).not.toBeNull();
        expect(user?.firstName).toEqual("Sean");
        expect(user?.lastName).toEqual("Cho");
        expect(user?.email).toEqual("seancho@test.com");

        // Log in
        await AuthController.LocalPassportStrategy(req.body.email, req.body.password, (first, second) => {
            expect(first).toBeNull();
            expect(second).toBeDefined();
            if (typeof second !== "boolean") {
                expect(second?.email).toEqual("seancho@test.com");
            }
        });

        // test invalid login
    });

    it("should return 400 if required fields are missing", async () => {
        const req = {
            body: {
                firstName: "Sean",
                lastName: "Cho",
            },
            login: jest.fn((user, callback) => callback(null)), // simulate passport's req.login
        } as unknown as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            redirect: jest.fn(),
        } as unknown as Response;

        await AuthController.SignUpController(req as Request, res as Response, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "missing required fields" });
    });

    it("should return 400 if password length is less or greater than the password limit", async () => {
        const req = {
            body: {
                firstName: "Sean",
                lastName: "Cho",
                email: "seancho@test.com",
                password: "short",
            },
            login: jest.fn((user, callback) => callback(null)), // simulate passport's req.login
        } as unknown as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            redirect: jest.fn(),
        } as unknown as Response;

        await AuthController.SignUpController(req as Request, res as Response, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "password length must be between 8 and 20 characters" });

        req.body.password = "thispasswordiswaytoolong12312312312312312312312312312312321";
        await AuthController.SignUpController(req as Request, res as Response, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "password length must be between 8 and 20 characters" });
    });
});
