import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    /\.(jpe?g|png|webp|gif|svg|avif|bmp|mp4|webm|ogg|mov|m4v)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files (JPEG, PNG, WEBP, MP4, WebM, MOV) are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter,
});

// Helper to format full public URL
const getFileUrl = (req: Request, filename: string): string => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host') || 'localhost:5000';
  return `${protocol}://${host}/uploads/${filename}`;
};

// 1. Single or Multiple files via flexible field name (file, files, image, images)
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
        const b64List = Array.isArray(images) ? images : image ? [image] : base64 ? [base64] : [];

        if (b64List.length > 0) {
          const generatedUrls: string[] = [];
          for (let i = 0; i < b64List.length; i++) {
            const item = b64List[i];
            if (typeof item === 'string' && item.startsWith('data:image/')) {
              const matches = item.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
              if (matches) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const data = matches[2];
                const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
                generatedUrls.push(getFileUrl(req, filename));
              }
            } else if (typeof item === 'string' && (item.startsWith('http://') || item.startsWith('https://'))) {
              generatedUrls.push(item);
            }
          }

          if (generatedUrls.length > 0) {
            res.status(200).json({
              success: true,
              message: 'Images uploaded successfully',
              url: generatedUrls[0],
              urls: generatedUrls,
              data: {
                urls: generatedUrls,
                primaryUrl: generatedUrls[0],
              },
            });
            return;
          }
        }
      }

      if (uploadedFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No image file uploaded. Please provide an image file.',
        });
        return;
      }

      const urls = uploadedFiles.map((file) => getFileUrl(req, file.filename));

      res.status(200).json({
        success: true,
        message: `${uploadedFiles.length} image(s) uploaded successfully`,
        url: urls[0],
        urls,
        data: {
          urls,
          primaryUrl: urls[0],
          files: uploadedFiles.map((f, i) => ({
            filename: f.filename,
            originalName: f.originalname,
            size: f.size,
            mimetype: f.mimetype,
            url: urls[i],
          })),
        },
      });
    } catch (error: any) {
      console.error('[Upload Error]:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  }
);

// 2. Base64 Dedicated Endpoint
router.post('/base64', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, images, filename: customName } = req.body;
    const b64List: string[] = Array.isArray(images) ? images : image ? [image] : [];

    if (b64List.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No base64 image data provided',
      });
      return;
    }

    const generatedUrls: string[] = [];
    for (let i = 0; i < b64List.length; i++) {
      const item = b64List[i];
      if (typeof item === 'string' && item.startsWith('data:image/')) {
        const matches = item.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const data = matches[2];
          const filename = `${customName ? customName.replace(/[^a-zA-Z0-9]/g, '-') : 'img'}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
          generatedUrls.push(getFileUrl(req, filename));
        }
      } else if (typeof item === 'string') {
        generatedUrls.push(item);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Base64 image(s) processed successfully',
      url: generatedUrls[0],
      urls: generatedUrls,
      data: {
        urls: generatedUrls,
        primaryUrl: generatedUrls[0],
      },
    });
  } catch (error: any) {
    console.error('[Base64 Upload Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process base64 image',
    });
  }
});

export default router;
