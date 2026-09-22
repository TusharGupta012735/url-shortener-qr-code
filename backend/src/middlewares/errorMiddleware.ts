// src/middleware/errorMiddleware.ts
import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
