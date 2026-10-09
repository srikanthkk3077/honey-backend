import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadBufferToCloudinary,
  uploadBase64ToCloudinary,
  CloudinaryUploadResult,
} from '../config/cloudinary';

const router = Router();

// Store files in memory buffer for fast direct streaming to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      /\.(jpe?g|png|webp|gif|svg|avif|bmp|mp4|webm|ogg|mov|m4v)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files (JPEG, PNG, WEBP, MP4, WebM, MOV) are allowed!'));
    }
  },
});

// Helper to determine media type and target Cloudinary folder
const getMediaDetails = (file: Express.Multer.File) => {
  const isVideo =
    file.mimetype.startsWith('video/') ||
    /\.(mp4|webm|ogg|mov|m4v)$/i.test(file.originalname);

  const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';
  const folder = isVideo ? 'madhuvan_honey/videos' : 'madhuvan_honey/media';

  const ext = path.extname(file.originalname) || '';
  const cleanName = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .slice(0, 30);
  const fileName = `${cleanName}-${Date.now()}`;

  return { isVideo, resourceType, folder, fileName };
};

// 1. Single or Multiple files via flexible field names (image, images, video, videos, file, files)
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 10 },
    { name: 'video', maxCount: 5 },
    { name: 'videos', maxCount: 5 },
    { name: 'images', maxCount: 10 },
    { name: 'file', maxCount: 10 },
    { name: 'files', maxCount: 10 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedFiles: Express.Multer.File[] = [];

      if (filesMap) {
        Object.values(filesMap).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            uploadedFiles.push(...fileArray);
          }
        });
      }

      // Handle base64 fallback if sent via JSON body instead of multipart
      if (uploadedFiles.length === 0 && req.body) {
        const { image, images, base64 } = req.body;
        const b64List: string[] = Array.isArray(images)
          ? images
          : image
          ? [image]
          : base64
          ? [base64]
          : [];

        if (b64List.length > 0) {
          const results: CloudinaryUploadResult[] = [];
          for (let i = 0; i < b64List.length; i++) {
            const item = b64List[i];
            if (typeof item === 'string' && (item.startsWith('data:') || item.startsWith('http'))) {
              const isVideo = item.startsWith('data:video/');
              const res = await uploadBase64ToCloudinary(
                item,
                isVideo ? 'madhuvan_honey/videos' : 'madhuvan_honey/media',
                isVideo ? 'video' : 'image'
              );
              results.push(res);
            }
          }

          if (results.length > 0) {
            const urls = results.map((r) => r.optimizedUrl);
            res.status(200).json({
              success: true,
              message: 'Media uploaded and optimized successfully via Cloudinary',
              url: urls[0],
              urls,
              data: {
                urls,
                primaryUrl: urls[0],
                files: results,
              },
            });
            return;
          }
        }
      }

      if (uploadedFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No image or video file uploaded. Please provide a file.',
        });
        return;
      }

      // Parallel upload to Cloudinary directly from memory
      const uploadResults = await Promise.all(
        uploadedFiles.map(async (file) => {
          const { resourceType, folder, fileName } = getMediaDetails(file);
          const result = await uploadBufferToCloudinary(
            file.buffer,
            folder,
            resourceType,
            fileName
          );
          return {
            filename: file.originalname,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: result.optimizedUrl, // Ultra-fast CDN URL with f_auto,q_auto
            secureUrl: result.secureUrl,
            optimizedUrl: result.optimizedUrl,
            thumbnailUrl: result.thumbnailUrl,
            posterUrl: result.posterUrl,
            publicId: result.publicId,
            resourceType: result.resourceType,
          };
        })
      );

      const urls = uploadResults.map((f) => f.optimizedUrl);

      res.status(200).json({
        success: true,
        message: `${uploadResults.length} file(s) uploaded and optimized successfully`,
        url: urls[0],
        urls,
        data: {
          urls,
          primaryUrl: urls[0],
          files: uploadResults,
        },
      });
    } catch (error: any) {
      console.error('[Cloudinary Upload Error]:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload media to Cloudinary',
      });
    }
  }
);

// 2. Base64 Dedicated Endpoint
router.post('/base64', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, images } = req.body;
    const b64List: string[] = Array.isArray(images) ? images : image ? [image] : [];

    if (b64List.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No base64 data provided',
      });
      return;
    }

    const uploadResults: CloudinaryUploadResult[] = [];
    for (const item of b64List) {
      if (typeof item === 'string') {
        const isVideo = item.startsWith('data:video/');
        const result = await uploadBase64ToCloudinary(
          item,
          isVideo ? 'madhuvan_honey/videos' : 'madhuvan_honey/media',
          isVideo ? 'video' : 'image'
        );
        uploadResults.push(result);
      }
    }

    const urls = uploadResults.map((r) => r.optimizedUrl);

    res.status(200).json({
      success: true,
      message: 'Base64 media processed and optimized successfully',
      url: urls[0],
      urls,
      data: {
        urls,
        primaryUrl: urls[0],
        files: uploadResults,
      },
    });
  } catch (error: any) {
    console.error('[Base64 Cloudinary Upload Error]:', error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || (typeof error === 'string' ? error : JSON.stringify(error)) || 'Failed to process base64 media',
      detail: error?.message || String(error),
    });
  }
});

export default router;
