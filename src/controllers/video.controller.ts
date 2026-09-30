import { Request, Response, NextFunction } from 'express';
import videoService from '../services/video.service';
import { sendSuccess, sendError } from '../utils/response';

export const getVideos = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { category, featuredOnHome, search } = req.query;

    const videos = await videoService.getAllVideos({
      category: category as string,
      featuredOnHome: featuredOnHome !== undefined ? featuredOnHome === 'true' : undefined,
      search: search as string,
    });

    return sendSuccess(res, 'Video reels retrieved successfully', videos);
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const video = await videoService.getVideoById(id);
    return sendSuccess(res, 'Video reel retrieved successfully', video);
  } catch (error) {
    next(error);
  }
};

export const incrementVideoViews = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const video = await videoService.incrementViews(id);
    return sendSuccess(res, 'View count updated', { views: video.views });
  } catch (error) {
    next(error);
  }
};

export const createVideo = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { title, videoUrl, thumbnailUrl } = req.body;
    if (!title || !videoUrl || !thumbnailUrl) {
      return sendError(res, 'Title, video URL, and thumbnail URL are required', 400);
    }

    const video = await videoService.createVideo(req.body);
    return sendSuccess(res, 'Video published successfully', video, 201);
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const video = await videoService.updateVideo(id, req.body);
    return sendSuccess(res, 'Video reel updated successfully', video);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    await videoService.deleteVideo(id);
    return sendSuccess(res, 'Video reel deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export default {
  getVideos,
  getVideoById,
  incrementVideoViews,
  createVideo,
  updateVideo,
  deleteVideo,
};
