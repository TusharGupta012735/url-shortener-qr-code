import type { NextFunction, Request, Response } from "express";
import { urlFetch, urlShortener } from "./urlShortener.service.js";
import { randomUUID } from "node:crypto";
import { kafkaProducer } from "../../kafka/producer.js";

export const generateShortUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { originalUrl, userId = null, guestId = null } = req.body;
    const result = await urlShortener({ originalUrl, userId, guestId });
    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const fetchUrl = async (
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

    const url = await urlFetch(sanitizedShortCode!);

    const event = {
      eventId: randomUUID(),
      eventType: "link.visited",
      eventVersion: 1,
      occurredAt: new Date().toISOString(),
      sanitizedShortCode,
      urlId: url.id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    await kafkaProducer.send("link.visited", event);

    res.redirect(url.originalUrl);
    
  } catch (error: any) {
    if (error.message === "NOT_FOUND") return res.sendStatus(404);
    if (error.message === "EXPIRED") return res.sendStatus(410);
    next(error);
  }
};
