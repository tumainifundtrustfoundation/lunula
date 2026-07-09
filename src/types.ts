export type UserRole = 'student' | 'author' | 'admin';
export type SubscriptionTier = 'free' | 'premium';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  subscription: SubscriptionTier;
  createdAt?: number;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileId: string;
  driveUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: number;
  views: number;
  status: DocumentStatus;
  rating?: number;
  downloadsCount?: number;
  sizeBytes?: number;
  mimeType?: string;
  paperNo?: string;
  year?: number;
  type?: string;
  sizeKB?: number;
  accent?: string;
}

export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  title: string;
  desc: string;
  link?: string;
  imageUrl?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  subject?: string;
  level?: string;
  teacher?: string;
  duration?: string;
  youtubeId: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  views?: number;
  createdAt?: number;
}

export interface Order {
  id?: string;
  name: string;
  phone: string;
  region: string;
  district?: string;
  address?: string;
  payMethod: string;
  notes?: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: string;
  createdAt?: any;
}

export const CATEGORIES = [
  'Mathematics',
  'Science & Technology',
  'Business & Finance',
  'History & Humanities',
  'Language & Literature',
  'Self-Improvement',
  'Health & Wellness',
  'Other'
];

export interface AppNotification {
  id: string;
  userId: string; // Target user's UID or 'all' for system broadcast
  title: string;
  message: string;
  type: 'approval' | 'update' | 'ai_response' | 'general';
  read: boolean;
  createdAt: number;
  link?: string;
}
