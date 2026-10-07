import Settings from '../models/Settings';
import { IStoreSettings } from '../types';

export class SettingsService {
  async getSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        storeName: 'Madhuvan Honey',
        brandTagline: '100% Pure, Raw & Forest Harvested Honey',
        phone: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        email: 'support@madhuvanhoney.com',
        salesEmail: 'orders@madhuvanhoney.com',
        address: 'Madhuvan Apiaries, Foothills of Jim Corbett & Sunderbans, Uttarakhand 244715, India',
        hours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
        freeShippingThreshold: 999,
        shippingFee: 79,
        gstPercentage: 5,
        socialLinks: {
          instagram: 'https://instagram.com/madhuvanhoney',
          facebook: 'https://facebook.com/madhuvanhoney',
          youtube: 'https://youtube.com/@madhuvanhoney',
          twitter: 'https://twitter.com/madhuvanhoney',
        },
      });
    }
    return settings;
  }

  async updateSettings(data: Partial<IStoreSettings>) {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(data);
      return settings;
    }

    if (data.heroConfig) {
      const existingHero = (settings.heroConfig && typeof (settings.heroConfig as any).toObject === 'function')
        ? (settings.heroConfig as any).toObject()
        : (settings.heroConfig || {});
      settings.heroConfig = {
        ...existingHero,
        ...data.heroConfig,
      };
      settings.markModified('heroConfig');
      delete (data as any).heroConfig;
    }

    if (data.paymentConfig) {
      const existingPayment = (settings.paymentConfig && typeof (settings.paymentConfig as any).toObject === 'function')
        ? (settings.paymentConfig as any).toObject()
        : (settings.paymentConfig || {});
      settings.paymentConfig = {
        ...existingPayment,
        ...data.paymentConfig,
      };
      settings.markModified('paymentConfig');
      delete (data as any).paymentConfig;
    }

    Object.assign(settings, data);
    await settings.save();
    return settings;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
