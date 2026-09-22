import { generateQrcode } from "../../utils/qr.js";

export const generateQR = async (shortCode : string) : Promise<string> => {
    return await generateQrcode(shortCode);
}