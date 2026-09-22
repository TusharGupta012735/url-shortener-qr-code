import type { Prisma, Url } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/db.js";

export class UrlShortener {

    // UrlUncheckedCreateInput helps to input data to a model which is also linked to a different model
  async create(data: Prisma.UrlUncheckedCreateInput) : Promise<Url> {
    return await prisma.url.create({
      data,
    });
  }

  async findByShortCode(shortCode : string) : Promise<Url | null>{
    return await prisma.url.findUnique({
        where : {shortCode}
    })
  }
}

export const urlRepository = new UrlShortener()