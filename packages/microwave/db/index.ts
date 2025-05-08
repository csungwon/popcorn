import mongoose from "mongoose";

export const connectMongoDB = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/");

    // IF USERNAME/PASSWORD IS ENABLED
    // await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');
};

export const connectMongoDBForTest = async () => {
    return await mongoose.connect("mongodb://localhost:27017/test");
};

export const destroyTestbedDB = async () => {
    await clearMongoDBCollectionsForTest();
    await disconnectMongoDBForTest();
};

const disconnectMongoDBForTest = async () => {
    await mongoose.disconnect();
};

const clearMongoDBCollectionsForTest = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};
