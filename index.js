import express from "express";
import bodyParser from "body-parser";
import qr from "qr-image";
import fs from "fs";
import cors from "cors"; // Import the cors middleware
import 'dotenv/config';

const app = express();

app.use(cors({
  origin: 'https://qr-code-frontend-drab.vercel.app'
})); // Enable CORS for all routes
app.use(bodyParser.json());

// Define the base URL and port
const baseURL = process.env.BASE_URL;
const port = process.env.PORT;

// API endpoint to generate QR code and return image URL
app.post("/generate-qr-code", (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Generate QR code image
  const qr_svg = qr.image(url, { type: 'svg' }); // Use SVG format
  const qrImagePath = `qr_image_${Date.now()}.svg`; // Use SVG file extension

  // Pipe the QR code SVG image to a writable stream
  const qrSVGStream = qr_svg.pipe(fs.createWriteStream(`public/qr-codes/${qrImagePath}`));

  // Handle stream finish event to send response with image URL
  qrSVGStream.on('finish', () => {
    // Construct the complete image URL by concatenating base URL and image path
    const imageURL = `${baseURL}/qr-codes/${qrImagePath}`;
    res.status(200).json({ imageUrl: imageURL });
  });
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
