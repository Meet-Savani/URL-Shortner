import express from 'express';
import mongoose, { Schema, model } from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import isURL from 'validator/lib/isURL.js'; 
import dotenv from 'dotenv';
import QRCode from 'qrcode';
dotenv.config();

const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Connect to MongoDB 
mongoose.connect(process.env.DATABASE_URL, {
    serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
    socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
})
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });

const urlSchema = new Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortCode: {
        type: String,
        required: true, 
        unique: true,
        sparse: true, 
    },
    clicks: {
        type: Number,
        default: 0,
    }
});

const Url = model('Url', urlSchema);

app.post('/api/short', async (req, res) => {
    try {
        console.log("📩 Received POST /api/short:", req.body);

        const { originalUrl } = req.body;
        if(!originalUrl) {
            return res.status(400).json({ message: "Original URL is required" });
        }

        if (!isURL(originalUrl, { require_protocol: true })) {
            return res.status(400).json({
                message: "URL must include http:// or https://"
            });
        }

        if (!process.env.BASE_URL) {
            return res.status(500).json({ message: "BASE_URL is not configured on the server" });
        }

        const shortCode = nanoid(7);

        const url = new Url({ originalUrl, shortCode });
        await url.save();

        const myUrl = `${process.env.BASE_URL}/${shortCode}`;
        const qrCodeImg = await QRCode.toDataURL(myUrl);

        res.status(200).json({ message: "URL shortened successfully",  shortUrl: myUrl, qrCodeImg });
    } catch (error) {
        console.error("🔥Error in /api/short:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await Url.findOne({ shortCode });
        console.log("URL found: ", url);

        if(url) {
            url.clicks++;
            await url.save();

            return res.redirect(url.originalUrl);
        } else {
            return res.status(404).json({ message: "URL not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
