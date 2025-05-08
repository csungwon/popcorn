import { userDao } from "../../../db/dao";
import { connectMongoDBForTest, destroyTestbedDB } from "../../../db";
import { Types } from "mongoose";

beforeEach(async () => {
    await connectMongoDBForTest();
});

afterEach(async () => {
    await destroyTestbedDB();
});

const user1 = Object.freeze({
    lastName: "Cho",
    firstName: "Sean",
    email: "seancho@test.com",
    password: "password",
    salt: Buffer.from("test_salt"),
});

const user2 = Object.freeze({
    lastName: "Kim",
    firstName: "Chole",
    email: "chloekim@test.com",
    password: "password2",
    salt: Buffer.from("test_salt2"),
});

describe("testing user DAO function", () => {
    it("should have createUser function", () => {
        expect(userDao.createUser).toBeDefined();
    });

    it("should have findUserByEmail function", () => {
        expect(userDao.findUserByEmail).toBeDefined();
    });

    it("should have findUserByID function", () => {
        expect(userDao.findUserByID).toBeDefined();
    });

    it("should have updateUserGoogleID function", () => {
        expect(userDao.updateUserGoogleID).toBeDefined();
    });

    describe("createUser", () => {
        it("should create a user object", async () => {
            const createdUser = await userDao.createUser(
                user1.firstName,
                user1.lastName,
                user1.email,
                user1.password,
                user1.salt
            );
            expect(createdUser).toBeDefined();
            expect(createdUser).not.toBeNull();
            expect(createdUser._id).toBeDefined();
            expect(createdUser.firstName).toEqual(user1.firstName);
            expect(createdUser.lastName).toEqual(user1.lastName);
            expect(createdUser.email).toEqual(user1.email);
            expect(createdUser.provider).toEqual("email");

            const savedUser2 = await userDao.createUser(
                user2.firstName,
                user2.lastName,
                user2.email,
                user2.password,
                user2.salt
            );
            expect(savedUser2).toBeDefined();
            expect(savedUser2).not.toBeNull();
        });
    });
    describe("findUserByEmail", () => {
        it("should return a user object when searched by email", async () => {
            const createdUser = await userDao.createUser(
                user1.firstName,
                user1.lastName,
                user1.email,
                user1.password,
                user1.salt
            );
            expect(createdUser).toBeDefined();
            expect(createdUser).not.toBeNull();

            const foundUser = await userDao.findUserByEmail(user1.email);
            expect(foundUser).toBeDefined();
            expect(foundUser).not.toBeNull();
            expect(foundUser?.email).toEqual(user1.email);
            expect(foundUser?.firstName).toEqual(user1.firstName);
            expect(foundUser?.lastName).toEqual(user1.lastName);
            expect(foundUser?.password).toEqual(user1.password);
            expect(foundUser?.salt?.equals(user1.salt)).toBeTruthy();
        });
        it("should return null when no user is found", async () => {
            const foundUser = await userDao.findUserByEmail("not_exist@test.com");
            expect(foundUser).toBeNull();
        });
    });

    describe("findUserByID", () => {
        it("should return a user object when searched by ID", async () => {
            const savedUser2 = await userDao.createUser(
                user2.firstName,
                user2.lastName,
                user2.email,
                user2.password,
                user2.salt
            );
            expect(savedUser2).toBeDefined();
            expect(savedUser2).not.toBeNull();

            const foundUser = await userDao.findUserByID(savedUser2._id);
            expect(foundUser).toBeDefined();
            expect(foundUser).not.toBeNull();
            expect(foundUser?.email).toEqual(user2.email);
            expect(foundUser?.firstName).toEqual(user2.firstName);
            expect(foundUser?.lastName).toEqual(user2.lastName);
            expect(foundUser?.password).toEqual(user2.password);
            expect(foundUser?.salt?.equals(user2.salt)).toBeTruthy();
            expect(foundUser?._id).toEqual(savedUser2._id);
        });
        it("should return null when no user is found", async () => {
            const foundUser = await userDao.findUserByID(new Types.ObjectId());
            expect(foundUser).toBeNull();
        });
    });

    describe("updateUserGoogleID", () => {
        it("should update the user with googleID", async () => {
            const savedUser2 = await userDao.createUser(
                user2.firstName,
                user2.lastName,
                user2.email,
                user2.password,
                user2.salt
            );
            expect(savedUser2).toBeDefined();
            expect(savedUser2).not.toBeNull();

            const updatedUser = await userDao.updateUserGoogleID(
                savedUser2._id,
                "unique-google-id",
                { new: true }
            );
            expect(updatedUser).toBeDefined();
            expect(updatedUser).not.toBeNull();
            expect(updatedUser?.thirdPartyUniqueID).toEqual("unique-google-id");
        });
    });
});
