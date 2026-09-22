import type { NextFunction, Request, Response } from "express";
import { generateQR } from "./qrCode.service.js";

const baseUrl = process.env.BASE_URL

export const generateQRController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({ message: "Short code is required" });
    }

    const sanitizedShortCode = Array.isArray(shortCode)
      ? shortCode[0]
      : shortCode;

    const url = `${baseUrl}/${sanitizedShortCode}` 

    const qrUrl = await generateQR(url);

    console.log(qrUrl);

    res.status(200).json(qrUrl);
  } catch (error) {
    next(error);
  }
};
