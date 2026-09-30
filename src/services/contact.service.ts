import ContactInquiry from '../models/ContactInquiry';
import NewsletterSubscriber from '../models/Newsletter';
import { IContactInquiry } from '../types';

export class ContactService {
  async submitInquiry(data: Partial<IContactInquiry>) {
    if (!data.name || !data.email || !data.message) {
      throw new Error('Name, email, and message are required');
    }

    const inquiry = await ContactInquiry.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || '',
      subject: data.subject?.trim() || 'General Question',
      message: data.message.trim(),
    });

    return inquiry;
  }

  async getAllInquiries(status?: string) {
    const query: any = {};
    if (status) query.status = status;
    return ContactInquiry.find(query).sort('-createdAt');
  }

  async updateInquiryStatus(id: string, status: 'unread' | 'read' | 'replied') {
    const inquiry = await ContactInquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }
    return inquiry;
  }

  async subscribeNewsletter(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Valid email address is required');
    }

    const existing = await NewsletterSubscriber.findOne({ email: cleanEmail });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return existing;
    }

    const subscriber = await NewsletterSubscriber.create({
      email: cleanEmail,
      isActive: true,
      subscribedAt: new Date(),
    });

    return subscriber;
  }

  async getAllSubscribers() {
    return NewsletterSubscriber.find({ isActive: true }).sort('-subscribedAt');
  }
}

export const contactService = new ContactService();
export default contactService;
