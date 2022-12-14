import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";

import { ErrorHandler } from "@shared/error/ErrorHandler";

const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new ErrorHandler(httpStatus.UNAUTHORIZED, "error.not_authenticated");
    }

    // Token example: "Bearer foo"
    const tokenWithType = authHeader.split(" ");
    if (tokenWithType.length <= 1) {
        throw new ErrorHandler(httpStatus.UNAUTHORIZED, "error.not_authenticated");
    }

    const token = tokenWithType[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        if (!decodedToken) {
            throw new ErrorHandler(httpStatus.UNAUTHORIZED, "error.not_authenticated");
        }

        req.userId = decodedToken.userId;
        req.email = decodedToken.email;
    } catch (error: any) {
        throw new ErrorHandler(httpStatus.UNAUTHORIZED, "error.not_authenticated");
    }

    next();
};

export default isAuth;
