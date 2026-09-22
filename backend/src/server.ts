import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { globalErrorHandler } from './middlewares/errorMiddleware.js';

import urlShortenerRoute from "./modules/url-shortener/urlShortener.route.js";
import qrCodeRoute from "./modules/qr-code/qrCode.route.js";
import { kafkaProducer } from './kafka/producer.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'URL Shortener API' });
});

app.use("/shortUrl", urlShortenerRoute);
app.use("/qrCode", qrCodeRoute);

app.use(globalErrorHandler);

const startServer = async () => {
  try {
    console.log("Connecting to Kafka...");
    await kafkaProducer.connect();
    console.log("Kafka Connected");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with failure
  }
};

startServer();

export default app;