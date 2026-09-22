import express from "express";
import { fetchUrl, generateShortUrl } from "./urlShortener.controller.js";

const router = express.Router();

router.post("/generate", generateShortUrl)
router.get("/:shortCode", fetchUrl)

export default router;