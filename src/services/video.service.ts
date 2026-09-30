import Video from '../models/Video';
import { IVideoItem } from '../types';

export class VideoService {
  async getAllVideos(filters: { category?: string; featuredOnHome?: boolean; search?: string }) {
    const query: any = { isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.featuredOnHome !== undefined) {
      query.featuredOnHome = filters.featuredOnHome;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { taggedProductName: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const videos = await Video.find(query).sort('-createdAt');
    return videos;
  }

  async getVideoById(id: string) {
    const video = await Video.findById(id);
    if (!video) {
      throw new Error('Video reel not found');
    }
    return video;
  }

  async incrementViews(id: string) {
    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) {
      throw new Error('Video reel not found');
    }
    return video;
  }

  async createVideo(data: Partial<IVideoItem>) {
    if (!data.title || !data.videoUrl || !data.thumbnailUrl) {
      throw new Error('Title, video URL, and thumbnail URL are required');
    }

    const video = await Video.create(data);
    return video;
  }

  async updateVideo(id: string, data: Partial<IVideoItem>) {
    const video = await Video.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!video) {
      throw new Error('Video reel not found to update');
    }
    return video;
  }

  async deleteVideo(id: string) {
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      throw new Error('Video reel not found to delete');
    }
    return video;
  }
}

export const videoService = new VideoService();
export default videoService;
