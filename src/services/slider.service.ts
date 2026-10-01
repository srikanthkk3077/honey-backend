import { Slider } from '../models/Slider';
import { ISlider } from '../types';

const initialSliders = [
  {
    title: 'Untamed Wild Forest Honey from Himalayan Foothills',
    subtitle: 'Harvested from deep Himalayan flora at 4,000 ft altitude. Unpasteurized, single-origin raw nectar packed with natural enzymes and pollen.',
    badge: '100% RAW & UNHEATED',
    imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1600&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-honey-dripping-from-a-wooden-spoon-41551-large.mp4',
    mediaType: 'video',
    linkUrl: '/shop',
    ctaText: 'Explore Pure Honey',
    secondaryCtaText: 'Watch Harvest Stories',
    secondaryCtaLink: '/videos',
    order: 1,
    isActive: true,
  },
  {
    title: 'Kashmir Acacia & Sunderbans Wild Mangrove Harvest',
    subtitle: 'Crystal-clear Kashmir Acacia with delicate notes, and rare antioxidant-rich dark mangrove honey collected with traditional forest harvesters.',
    badge: 'LAB TESTED & NMR VERIFIED',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1600&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-honey-on-a-pancake-41552-large.mp4',
    mediaType: 'video',
    linkUrl: '/shop',
    ctaText: 'Shop Special Reserves',
    secondaryCtaText: 'Learn Purity Process',
    secondaryCtaLink: '/about',
    order: 2,
    isActive: true,
  },
  {
    title: 'Immunity Boosting Infusions with Organic Herbs',
    subtitle: 'Pure forest honey cold-infused with organic turmeric, Ceylon cinnamon, ginger, and Ashwagandha for daily wellness and vitality.',
    badge: 'AYURVEDIC BLENDS',
    imageUrl: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?auto=format&fit=crop&w=1600&q=80',
    videoUrl: '',
    mediaType: 'image',
    linkUrl: '/shop',
    ctaText: 'Discover Infusions',
    secondaryCtaText: 'View Honey Lab Test',
    secondaryCtaLink: '/about',
    order: 3,
    isActive: true,
  },
];

export class SliderService {
  async getAllSliders(onlyActive = true) {
    let count = await Slider.countDocuments();
    if (count === 0) {
      await Slider.insertMany(initialSliders);
    }
    const query: any = {};
    if (onlyActive) {
      query.isActive = true;
    }
    return Slider.find(query).sort({ order: 1, createdAt: -1 });
  }

  async getSliderById(id: string) {
    const slider = await Slider.findById(id);
    if (!slider) {
      throw new Error('Slider not found');
    }
    return slider;
  }

  async createSlider(data: Partial<ISlider>) {
    return Slider.create(data);
  }

  async updateSlider(id: string, data: Partial<ISlider>) {
    const slider = await Slider.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!slider) {
      throw new Error('Slider not found');
    }
    return slider;
  }

  async deleteSlider(id: string) {
    const slider = await Slider.findByIdAndDelete(id);
    if (!slider) {
      throw new Error('Slider not found');
    }
    return slider;
  }
}

export default new SliderService();
