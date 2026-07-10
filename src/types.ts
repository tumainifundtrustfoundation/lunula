export type UserRole = 'student' | 'author' | 'admin' | 'super_admin';
export type SubscriptionTier = 'free' | 'premium';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  subscription: SubscriptionTier;
  createdAt?: number;
  isSuspended?: boolean;
  suspendedAt?: number;
  suspensionReason?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetId: string;
  targetName: string;
  details?: string;
  timestamp: number;
}

export interface SystemConfig {
  id: string;
  oauthGoogleClientId?: string;
  oauthGoogleClientSecret?: string;
  mfaEnabled?: boolean;
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaPasskey?: string;
  airtelMoneyClientId?: string;
  airtelMoneyClientSecret?: string;
  mixByYasApiKey?: string;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalSecretKey?: string;
  geminiApiKey?: string;
  googleMeetClientId?: string;
  zoomClientId?: string;
  zoomClientSecret?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  cloudflareR2Bucket?: string;
  cloudflareR2AccessKey?: string;
  cloudflareR2SecretKey?: string;
  emailSmtpHost?: string;
  emailSmtpPort?: number;
  emailSmtpUser?: string;
  emailSmtpPass?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  clarityId?: string;
  cloudflareWafZoneId?: string;
  updatedAt?: number;
  updatedBy?: string;
}

export interface Feedback {
  id?: string;
  userId: string;
  userName: string;
  email: string;
  type: 'missing_notes' | 'improvement' | 'bug' | 'other';
  message: string;
  createdAt: number;
  status: 'new' | 'reviewed' | 'resolved';
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

export type AppTheme = 'theme-tanzania-forest' | 'theme-night-mode' | 'theme-high-contrast';

export interface WorkspaceCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  alternateLink?: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
}

export interface WorkspaceForm {
  id: string;
  name: string;
  webViewLink: string;
}

export interface WorkspaceAssignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  alternateLink: string;
  courseName?: string;
}

export interface WorkspaceEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  labelIds?: string[];
}

export interface WorkspaceDoc {
  id: string;
  name: string;
  webViewLink: string;
  createdTime?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
}

export interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  subject: string;
  grade: string;
  score: number;
  dateAwarded: string;
  verificationCode: string;
  issuedBy: string;
  studentEmail?: string;
}

export interface ExamResult {
  id: string;
  studentName: string;
  candidateCode: string; // e.g. S0101/0001/2026
  examType: string; // Mock, Terminal, NECTA Mock, Monthly
  level: string; // Form 1, Form 2, Form 3, Form 4, Form 5, Form 6
  year: number;
  division: string; // Division I, Division II, Division III, Division IV, Division 0
  gpa: number; // e.g. 1.25
  subjects: {
    subject: string;
    grade: string;
    score: number;
  }[];
  publishedAt: number;
  status: 'draft' | 'published';
}

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  isVerified: boolean;
  clicksCount: number;
  recommendationsCount: number;
  recommendedByUsers: string[]; // array of user UIDs who recommended this
  createdAt: number;
  createdBy: string;
  createdByName: string;
  institution?: string; // e.g. "NECTA", "UDOM", "MIT", etc.
  region?: 'Tanzania' | 'International' | 'Both';
  tags?: string[];
}

export interface HighlightAnnotation {
  id: string;
  userId: string;
  documentId: string;
  documentTitle: string;
  text: string;
  note?: string;
  color: string;
  createdAt: number;
}




