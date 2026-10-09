import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  resourceType: 'image' | 'video';
  optimizedUrl: string;
  thumbnailUrl: string;
  posterUrl?: string;
  bytes: number;
}

/**
 * Generate an ultra-fast optimized delivery URL with next-gen formats (AVIF/WebP) and smart compression
 */
export const getOptimizedMediaUrl = (
  publicId: string,
  resourceType: 'image' | 'video' = 'image',
  options: { width?: number; height?: number; crop?: string } = {}
): string => {
  if (resourceType === 'video') {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      fetch_format: 'auto',
      quality: 'auto',
      secure: true,
      ...(options.width ? { width: options.width, crop: options.crop || 'limit' } : {}),
    });
  }

  return cloudinary.url(publicId, {
    resource_type: 'image',
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
    ...(options.width ? { width: options.width } : {}),
    ...(options.height ? { height: options.height } : {}),
    ...(options.crop ? { crop: options.crop } : {}),
  });
};

/**
 * Generate a poster/thumbnail image frame from a video
 */
export const getVideoPosterUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    fetch_format: 'auto',
    quality: 'auto',
    start_offset: 'auto',
    secure: true,
  });
};

/**
 * Upload a file Buffer directly to Cloudinary using streams (No disk I/O, fastest backend response)
 */
export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'madhuvan_honey',
  resourceType: 'image' | 'video' | 'auto' = 'auto',
  fileName?: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: fileName,
        unique_filename: true,
        overwrite: false,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }

        const resType = (result.resource_type === 'video' ? 'video' : 'image') as 'image' | 'video';
        const isVideo = resType === 'video';

        // 1. Optimized CDN Delivery URL (f_auto, q_auto)
        const optimizedUrl = getOptimizedMediaUrl(result.public_id, resType);

        // 2. Thumbnail URL (400x400 smart crop for cards / grids)
        const thumbnailUrl = isVideo
          ? getVideoPosterUrl(result.public_id)
          : cloudinary.url(result.public_id, {
              resource_type: 'image',
              fetch_format: 'auto',
              quality: 'auto',
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'auto',
              secure: true,
            });

        // 3. Poster image specifically for video playback previews
        const posterUrl = isVideo ? getVideoPosterUrl(result.public_id) : undefined;

        resolve({
          url: optimizedUrl,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: resType,
          optimizedUrl,
          thumbnailUrl,
          posterUrl,
          bytes: result.bytes,
        });
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Upload base64 string or remote URL directly to Cloudinary
 */
export const uploadBase64ToCloudinary = async (
  base64OrUrl: string,
  folder: string = 'madhuvan_honey',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<CloudinaryUploadResult> => {
  // If base64 data URL, decode to Buffer and stream directly to prevent decoding/timeout errors
  if (base64OrUrl.startsWith('data:')) {
    const commaIndex = base64OrUrl.indexOf(',');
    if (commaIndex !== -1) {
      const header = base64OrUrl.slice(0, commaIndex);
      const rawData = base64OrUrl.slice(commaIndex + 1).replace(/\s+/g, '');
      const isVideo = header.includes('video/');
      const effectiveType: 'image' | 'video' = isVideo ? 'video' : 'image';
      
      const buffer = Buffer.from(rawData, 'base64');
      if (buffer.length < 32) {
        throw new Error('Image data is corrupted or incomplete (data too small to be a valid image). Please re-select the image.');
      }

      const fileName = 'upload-' + Date.now();
      return uploadBufferToCloudinary(buffer, folder, effectiveType, fileName);
    }
  }

  const result: UploadApiResponse = await cloudinary.uploader.upload(base64OrUrl, {
    folder,
    resource_type: resourceType,
  });

  const resType = (result.resource_type === 'video' ? 'video' : 'image') as 'image' | 'video';
  const isVideo = resType === 'video';

  const optimizedUrl = getOptimizedMediaUrl(result.public_id, resType);
  const thumbnailUrl = isVideo
    ? getVideoPosterUrl(result.public_id)
    : cloudinary.url(result.public_id, {
        resource_type: 'image',
        fetch_format: 'auto',
        quality: 'auto',
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'auto',
        secure: true,
      });

  const posterUrl = isVideo ? getVideoPosterUrl(result.public_id) : undefined;

  return {
    url: optimizedUrl,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    resourceType: resType,
    optimizedUrl,
    thumbnailUrl,
    posterUrl,
    bytes: result.bytes,
  };
};

export default cloudinary;
