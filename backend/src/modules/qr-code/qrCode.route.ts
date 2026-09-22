import express from "express";
import { generateQRController } from "./qrCode.controller.js";
const router = express.Router();

router.get("/:shortCode", generateQRController);

export default router;