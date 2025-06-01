export const checkEnvVariables = () => {
    const requiredEnvVars = [
        "JWT_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_CALLBACK_URL",
        "PORT",
    ];

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
    }
    console.log("All required environment variables are set.");
};
