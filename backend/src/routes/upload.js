import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authenticate from '../middleware/auth.js';
import { uploadImageMiddleware } from '../middleware/upload.js';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../config/cloudinary.js';
import { success, error as sendError } from '../utils/apiResponse.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * POST /api/upload/image
 * Uploads an image either to Cloudinary (if configured) or local storage
 */
router.post('/image', authenticate, uploadImageMiddleware.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file was provided for upload.', 400);
    }

    const folder = req.body.folder || 'guridhis/houses';

    // 1. Try Cloudinary if credentials are configured
    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, folder);
        return success(res, {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          provider: 'cloudinary'
        }, 'Image successfully uploaded to Cloudinary.', 201);
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, falling back to local storage:', cloudErr.message);
      }
    }

    // 2. Local fallback if Cloudinary credentials are not yet set
    const ext = path.extname(req.file.originalname) || '.jpg';
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const targetFilePath = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(targetFilePath, req.file.buffer);

    const protocol = req.protocol;
    const host = req.get('host');
    const localUrl = `${protocol}://${host}/uploads/${uniqueFileName}`;

    return success(res, {
      url: localUrl,
      public_id: uniqueFileName,
      provider: 'local',
      notice: 'Saved to local server. Add your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env for Cloudinary cloud hosting.'
    }, 'Image saved successfully.', 201);

  } catch (err) {
    next(err);
  }
});

export default router;
