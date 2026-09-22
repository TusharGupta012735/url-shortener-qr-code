import qrCode from "qrcode";

export const generateQrcode = async (shortUrl: string) => {
  return await qrCode.toDataURL(shortUrl, {
    width: 300,
    margin: 2,
  });
};
