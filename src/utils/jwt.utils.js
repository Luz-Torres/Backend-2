import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const SECRET = process.env.JWT_SECRET;

export function createToken(payload) {
    return jwt.sign(payload, SECRET, {
        expiresIn: "10m"
    });
}

export function verifyToken(token) {
    return jwt.verify(token, SECRET);
};  