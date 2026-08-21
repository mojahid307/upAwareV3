import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";

// Configure Cloudinary if credentials exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Memory storage for fast processing
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 4, // Max 4 images
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * Helper to upload a buffer to Cloudinary or return a base64 Data URL fallback.
 */
export async function uploadImageBuffer(buffer: Buffer, mimetype: string): Promise<string> {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "upaware/posts",
          transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url || "");
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Fallback: return data URL
  const base64 = buffer.toString("base64");
  return `data:${mimetype};base64,${base64}`;
}
