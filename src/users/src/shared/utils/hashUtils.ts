/* eslint-disable @typescript-eslint/require-await */
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_SALT_ROUNDS = 12;

const hashPasswordSync = (password: string): string => {
    return bcrypt.hashSync(password, TOKEN_SALT_ROUNDS);
};

const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, TOKEN_SALT_ROUNDS);
};

const doPasswordsMatch = async (password: string, hashedUserPassword): Promise<boolean> => {
    return bcrypt.compare(password, hashedUserPassword);
};

const generateRandomToken = async (): Promise<string> => {
    const BYTES_TO_GENERATE = 32;

    return new Promise((resolve, reject) => {
        crypto.randomBytes(BYTES_TO_GENERATE, (error, buffer) => {
            if (error) {
                reject();
                return;
            }

            const token = buffer.toString("hex");
            resolve(token);
        });
    });
};

const TOKEN_TYPE = "Bearer";
const TOKEN_EXPIRATION_TIME = "1h";

const generateJWTToken = async (email: string, userId: string): Promise<string> => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = await jwt.sign({ email, userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION_TIME });
    return token;
};

export { hashPasswordSync, hashPassword, doPasswordsMatch, generateRandomToken, generateJWTToken, TOKEN_TYPE };
