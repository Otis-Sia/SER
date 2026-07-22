import express from "express";
import multer from "multer";
import { uploadToS3 } from "../utils/s3.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// POST /api/upload - Admin only image upload
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const result = await uploadToS3(req.file);
    return res.status(200).json({
      message: "Image uploaded successfully",
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return res.status(500).json({ error: error.message || "Failed to upload image to S3" });
  }
});

export default router;
