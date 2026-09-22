import { AppError } from "../../utils/AppError.js";
import { encodeBase62 } from "../../utils/base62.js";
import { Snowflake } from "../../utils/snowflakeId.js";
import type { UrlShortenerRequest } from "./dto/urlShortener.request.js";
import type { UrlShortenerResponse } from "./dto/urlShortener.response.js";
import { urlRepository } from "./urlShortener.repository.js";

const sf = new Snowflake(1);

export const urlShortener = async (
  data: UrlShortenerRequest,
): Promise<UrlShortenerResponse> => {
  try {
    const { originalUrl, userId, guestId } = data;

    if (!userId && !guestId) {
      throw new AppError("User must be registered as guest or visitor", 400);
    }

    const longcode = sf.generate();
    const code = encodeBase62(longcode);

    const url = await urlRepository.create({
      originalUrl: data.originalUrl,
      shortCode: code,
      snowflakeId: longcode.toString(), // Convert BigInt to String
      userId: data.userId ?? null,
      guestId: data.guestId ?? null,
    });

    const res = {
      url: originalUrl,
      shortUrl: code,
    };

    return res;
  } catch (error: any) {
    if (error instanceof AppError) throw error;

    if (error.code === "P2002") {
      throw new AppError("Short code collision", 409);
    }

    throw new AppError(error.message || "Internal Server Error", 500);
  }
};

export const urlFetch = async (shortCode: string) => {
  try {
    const url = await urlRepository.findByShortCode(shortCode);

    if (!url) throw new AppError("URL not found for the shortCode", 300);

    return url;
  } catch (error: any) {
    if (error instanceof AppError) throw error;

    if (error.code === "P2002") {
      throw new AppError("Short code collision", 409);
    }

    throw new AppError(error.message || "Internal Server Error", 500);
  }
};
