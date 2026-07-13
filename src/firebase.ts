import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  increment,
  orderBy,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { UserProfile, DocumentMetadata, Comment, UserRole, SubscriptionTier, DocumentStatus, Announcement, Product, Video, Order, AppNotification, Feedback, Certificate, ExamResult, AuditLog, SystemConfig, EducationalResource, HighlightAnnotation, WebsiteNews } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with force long polling and persistent local cache to ensure stable connection in sandboxed preview iframe/network environment
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, (firebaseConfig as any).firestoreDatabaseId || '(default)'); /* CRITICAL: Connects to the live default database */

// --- Firestore Error Handling (Skill Requirement) ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
// ----------------------------------------------------

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Request drive scope to view and upload files, gmail, documents, and classroom data
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.me.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.students.readonly');

// In-memory token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Custom sign in with Google that returns the user and OAuth access token
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (!token) {
      throw new Error('Hukuweza kupata Token ya Google Drive. Tafadhali hakikisha umekubali ruhusa zote.');
    }
    cachedAccessToken = token;
    
    // Auto-create or fetch user profile
    await ensureUserProfile(result.user, result.user.displayName || 'Google User');
    
    return { user: result.user, accessToken: token };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Dirisha la kuingia limefungwa kabla ya kumaliza. Tafadhali ruhusu "Popups" kwenye kivinjari chako na usifunge dirisha mapema.');
    } else if (err.code === 'auth/cancelled-popup-request') {
      throw new Error('Ombi la kuingia lilighairiwa. Tafadhali jaribu tena.');
    } else if (err.code === 'auth/popup-blocked') {
      throw new Error('Kivinjari chako kimezuia dirisha la kuingia (Popup). Tafadhali ruhusu Popups kwa tovuti hii ili uweze kuingia.');
    } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
      const hostname = window.location.hostname;
      const errorObj = {
        code: 'auth/unauthorized-domain',
        message: `Domain '${hostname}' haijaidhinishwa kwenye Firebase Console yako ya mradi wa Lupanulla.`,
        hostname,
        projectId: firebaseConfig.projectId
      };
      throw new Error(JSON.stringify(errorObj));
    }
    
    throw err;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Custom sign in anonymously as a Guest student
 */
export const signInAsGuest = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    // Set a default display name for the guest user
    await updateProfile(result.user, { displayName: 'Mgeni Lupanulla' });
    await ensureUserProfile(result.user, 'Mgeni Lupanulla');
    return result.user;
  } catch (err: any) {
    console.error('Guest Sign In Error:', err);
    throw err;
  }
};

/**
 * Sign out of Firebase and clear cached token
 */
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Retrieve the current cached access token (or prompt re-login if expired/missing)
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Setup access token manually (for debugging or direct updates)
 */
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Submits student feedback to Firestore
 */
export const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const path = 'feedback';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...feedback,
      createdAt: Date.now(),
      status: 'new'
    });
    return docRef.id;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
};

/**
 * Helper to ensure a profile exists in Firestore for the authenticated user
 */
export const ensureUserProfile = async (user: User, displayName: string, additionalFields?: Partial<UserProfile>): Promise<UserProfile> => {
  const isSuperAdmin = user.uid === 'a9wJ0DcKpkN9I9iyO2yQzcI7VlT2' || user.email?.toLowerCase() === 'lupanulla.co.tz@gmail.com';
  
  // Google sign in or anonymous guest sign in should be pre-verified. 
  // Custom email/password signups should specify emailVerified: false in additionalFields.
  const defaultVerified = user.emailVerified || user.isAnonymous || false;

  const profile: UserProfile = {
    uid: user.uid,
    name: displayName,
    email: user.email || '',
    role: isSuperAdmin ? 'super_admin' : 'student',
    subscription: 'premium',
    createdAt: Date.now(),
    emailVerified: defaultVerified,
    xp: 0,
    studyTime: 0,
    ...additionalFields
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      // If super_admin, always ensure they are super_admin
      if (isSuperAdmin && existing.role !== 'super_admin') {
        await updateDoc(userRef, { role: 'super_admin' });
        existing.role = 'super_admin';
      }
      return existing;
    }
    
    await setDoc(userRef, profile);
  } catch (err: any) {
    console.warn('ensureUserProfile offline/network fallback triggered:', err.message || err);
  }
  
  return profile;
};

/**
 * Update user's profile metadata in Firestore
 */
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (err: any) {
    console.warn('updateUserProfile failed (likely offline):', err.message || err);
  }
};

/**
 * Award study points and track study time
 */
export const awardStudyPoints = async (uid: string, points: number, durationMinutes: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      xp: increment(points),
      studyTime: increment(durationMinutes)
    });
  } catch (err: any) {
    console.warn('awardStudyPoints offline/network fallback triggered:', err.message || err);
  }
};

/**
 * Fetch a user's profile from Firestore
 */
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err: any) {
    console.warn('fetchUserProfile offline/network fallback triggered:', err.message || err);
    return null;
  }
};

/**
 * Get all users (Admin only)
 */
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  const colRef = collection(db, 'users');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as UserProfile);
};

/**
 * Upload a document record to Firestore
 */
export const saveDocumentMetadata = async (
  docData: Omit<DocumentMetadata, 'id' | 'createdAt' | 'views' | 'status'> & { 
    status?: DocumentStatus,
    createdAt?: number,
    views?: number
  }
): Promise<string> => {
  const docRef = doc(collection(db, 'documents'));
  const fullDoc: DocumentMetadata = {
    ...docData,
    id: docRef.id,
    createdAt: docData.createdAt || Date.now(),
    views: docData.views || 0,
    status: docData.status || 'pending', // Requires admin approval by default
    rating: 5,
    downloadsCount: 0
  };
  await setDoc(docRef, fullDoc);
  return docRef.id;
};

/**
 * Get a specific document by its Firestore ID
 */
export const fetchDocumentById = async (id: string): Promise<DocumentMetadata | null> => {
  try {
    const docRef = doc(db, 'documents', id);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as DocumentMetadata) : null;
  } catch (err: any) {
    console.warn(`fetchDocumentById error for ${id} (likely offline):`, err.message || err);
    return null;
  }
};

/**
 * Increment views on a document
 */
export const incrementDocumentViews = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, { views: increment(1) });
  } catch (err: any) {
    console.warn(`incrementDocumentViews error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Increment downloads on a document
 */
export const incrementDocumentDownloads = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, { downloadsCount: increment(1) });
  } catch (err: any) {
    console.warn(`incrementDocumentDownloads error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Update document status or info
 */
export const updateDocument = async (id: string, updates: Partial<DocumentMetadata>): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn(`updateDocument error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Delete a document from Firestore
 */
export const deleteDocumentMetadata = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn(`deleteDocumentMetadata error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Fetch list of documents with filters
 */
export const fetchDocuments = async (filters?: {
  category?: string;
  uploadedBy?: string;
  status?: DocumentStatus;
}): Promise<DocumentMetadata[]> => {
  const path = 'documents';
  try {
    const colRef = collection(db, path);
    let q = query(colRef);
    
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.uploadedBy) {
      q = query(q, where('uploadedBy', '==', filters.uploadedBy));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    // Note: We avoid adding orderBy('createdAt', 'desc') here to prevent "missing index" errors
    // unless the developer has specifically created the composite indexes in Firebase Console.
    // Sorting is handled in-memory in the components for better reliability.
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentMetadata));
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.warn('fetchDocuments: Permission denied. Access restricted or user not signed in.');
      return [];
    }
    
    // If it's a missing index error, don't throw, just log and return empty to trigger local seeds
    if (err.code === 'failed-precondition' || (err.message && err.message.includes('index'))) {
      console.warn('Firestore index missing for complex query, falling back to simple query or memory sort.');
      // Simple fallback query
      try {
        const simpleQ = query(collection(db, path), where('status', '==', 'approved'));
        const snap = await getDocs(simpleQ);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentMetadata));
      } catch (innerErr) {
        return [];
      }
    }

    try {
      handleFirestoreError(err, OperationType.LIST, path);
    } catch (e) {
      // Just log and return empty to avoid crashing UI
    }
    return [];
  }
};

/**
 * Fetch and post comments/reviews for a document
 */
export const fetchComments = async (documentId: string): Promise<Comment[]> => {
  const colRef = collection(db, 'comments');
  try {
    const q = query(colRef, where('documentId', '==', documentId), orderBy('createdAt', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
    } catch (e) {
      // If indexing is building or missing order by index, fallback to sorting in memory
      const simpleQ = query(colRef, where('documentId', '==', documentId));
      const simpleSnap = await getDocs(simpleQ);
      return simpleSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Comment))
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (err: any) {
    console.warn('fetchComments offline/network error:', err.message || err);
    return [];
  }
};

export const addComment = async (documentId: string, userId: string, userName: string, text: string): Promise<Comment> => {
  const commentData = {
    documentId,
    userId,
    userName,
    text,
    createdAt: Date.now()
  };
  try {
    const colRef = collection(db, 'comments');
    const docRef = await addDoc(colRef, commentData);
    return {
      id: docRef.id,
      ...commentData
    };
  } catch (err: any) {
    console.warn('addComment error (offline):', err.message || err);
    return {
      id: 'local_temp_' + Date.now(),
      ...commentData
    };
  }
};

/**
 * Lupanulla Announcements (Matangazo)
 */
export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const colRef = collection(db, 'matangazo');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
  } catch (error) {
    console.error('fetchAnnouncements error:', error);
    return [];
  }
};

export const saveAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const colRef = collection(db, 'matangazo');
    const payload = {
      ...annData,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    
    // Broadcast notification to ALL users
    await addNotification({
      userId: 'all',
      title: 'Tangazo Jipya! 📢',
      message: `${annData.title} - ${annData.desc.substring(0, 80)}${annData.desc.length > 80 ? '...' : ''}`,
      type: 'update',
      link: 'matangazo'
    });
    
    return docRef.id;
  } catch (err: any) {
    console.warn('saveAnnouncement error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<void> => {
  try {
    const docRef = doc(db, 'matangazo', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn('updateAnnouncement error:', err.message || err);
  }
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'matangazo', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('deleteAnnouncement error:', err.message || err);
  }
};

/**
 * Lupanulla Products (Duka)
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const colRef = collection(db, 'products');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error('fetchProducts error:', error);
    return [];
  }
};

export const saveProduct = async (prodData: Omit<Product, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, 'products');
    const docRef = await addDoc(colRef, prodData);
    
    // Broadcast notification to ALL users
    await addNotification({
      userId: 'all',
      title: 'Bidhaa Mpya Dukani! 🛒',
      message: `Tumeongeza "${prodData.name}" kwenye duka letu la Lupanulla Elimu Hub. Bonyeza hapa kuagiza sasa!`,
      type: 'update',
      link: 'duka'
    });
    
    return docRef.id;
  } catch (err: any) {
    console.warn('saveProduct error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn('updateProduct error:', err.message || err);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('deleteProduct error:', err.message || err);
  }
};

/**
 * Lupanulla Videos (Lupa+ Video Class)
 */
export const fetchVideos = async (): Promise<Video[]> => {
  try {
    const colRef = collection(db, 'videos');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
  } catch (error) {
    console.error('fetchVideos error:', error);
    return [];
  }
};

export const saveVideo = async (vidData: Omit<Video, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, 'videos');
    const payload = {
      ...vidData,
      views: 0,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    
    // Broadcast notification to ALL users
    await addNotification({
      userId: 'all',
      title: 'Darasani Video Mpya! 🎥',
      message: `Darasa jipya la video "${vidData.title}" limeongezwa chini ya somo la ${vidData.subject || 'Lupanulla'}. Jifunze sasa hapa!`,
      type: 'update',
      link: 'videos'
    });
    
    return docRef.id;
  } catch (err: any) {
    console.warn('saveVideo error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const updateVideo = async (id: string, updates: Partial<Video>): Promise<void> => {
  try {
    const docRef = doc(db, 'videos', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn('updateVideo error:', err.message || err);
  }
};

export const deleteVideo = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'videos', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('deleteVideo error:', err.message || err);
  }
};

/**
 * Lupanulla Orders (Agiza Checkout)
 */
export const saveOrder = async (orderData: Order): Promise<string> => {
  try {
    const colRef = collection(db, 'orders');
    const payload = {
      ...orderData,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (err: any) {
    console.warn('saveOrder error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const colRef = collection(db, 'orders');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  } catch (error) {
    console.error('fetchOrders error:', error);
    return [];
  }
};

/**
 * Lupanulla Notifications system using Firestore Subscriptions
 */
export const addNotification = async (notifData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<string> => {
  try {
    const colRef = collection(db, 'notifications');
    const payload = {
      ...notifData,
      read: false,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (err: any) {
    console.warn('addNotification error (likely offline):', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const subscribeNotifications = (
  userId: string,
  callback: (notifications: AppNotification[]) => void
): (() => void) => {
  try {
    const colRef = collection(db, 'notifications');
    // Query notifications for this user or for 'all' (system wide)
    const q = query(colRef, where('userId', 'in', [userId, 'all']));
    
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppNotification));
      
      // Sort in memory by createdAt desc to avoid missing index errors
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    }, (error) => {
      console.warn('subscribeNotifications error (likely offline or rules):', error);
      callback([]);
    });
  } catch (err) {
    console.warn('subscribeNotifications setup failed:', err);
    callback([]);
    return () => {};
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'notifications', id);
    await updateDoc(docRef, { read: true });
  } catch (err: any) {
    console.warn(`markNotificationAsRead error for ${id}:`, err.message || err);
  }
};

export const markAllNotificationsAsRead = async (userId: string, notifications: AppNotification[]): Promise<void> => {
  try {
    for (const notif of notifications) {
      if (!notif.read && (notif.userId === userId || notif.userId === 'all')) {
        const docRef = doc(db, 'notifications', notif.id);
        await updateDoc(docRef, { read: true });
      }
    }
  } catch (err: any) {
    console.warn('markAllNotificationsAsRead error:', err.message || err);
  }
};

// --- Certificates and Exam Results Core Database Helpers ---

export const addCertificate = async (cert: Omit<Certificate, 'id'>): Promise<string> => {
  const path = 'certificates';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, cert);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const fetchCertificates = async (): Promise<Certificate[]> => {
  const path = 'certificates';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const fetchCertificateByCode = async (code: string): Promise<Certificate | null> => {
  const path = 'certificates';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('verificationCode', '==', code.trim().toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Certificate;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const deleteCertificate = async (id: string): Promise<void> => {
  const path = `certificates/${id}`;
  try {
    const docRef = doc(db, 'certificates', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addExamResult = async (result: Omit<ExamResult, 'id'>): Promise<string> => {
  const path = 'exam_results';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, result);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const fetchExamResults = async (): Promise<ExamResult[]> => {
  const path = 'exam_results';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamResult));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const fetchExamResultByCode = async (candidateCode: string): Promise<ExamResult | null> => {
  const path = 'exam_results';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('candidateCode', '==', candidateCode.trim().toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as ExamResult;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const deleteExamResult = async (id: string): Promise<void> => {
  const path = `exam_results/${id}`;
  try {
    const docRef = doc(db, 'exam_results', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const updateExamResult = async (id: string, updates: Partial<ExamResult>): Promise<void> => {
  const path = `exam_results/${id}`;
  try {
    const docRef = doc(db, 'exam_results', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const fetchFeedbacks = async (): Promise<Feedback[]> => {
  const path = 'feedback';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateFeedbackStatus = async (id: string, status: 'new' | 'reviewed' | 'resolved'): Promise<void> => {
  const path = `feedback/${id}`;
  try {
    const docRef = doc(db, 'feedback', id);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string> => {
  const path = 'audit_logs';
  try {
    const colRef = collection(db, path);
    const docRef = doc(colRef);
    const fullLog: AuditLog = {
      ...log,
      id: docRef.id,
      timestamp: Date.now()
    };
    await setDoc(docRef, fullLog);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const path = 'audit_logs';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as AuditLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const fetchSystemConfig = async (): Promise<SystemConfig | null> => {
  const path = 'system_configs/integrations';
  try {
    const docRef = doc(db, 'system_configs', 'integrations');
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as SystemConfig;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateSystemConfig = async (config: Partial<SystemConfig>): Promise<void> => {
  const path = 'system_configs/integrations';
  try {
    const docRef = doc(db, 'system_configs', 'integrations');
    await setDoc(docRef, { ...config, id: 'integrations' }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const fetchEducationalResources = async (): Promise<EducationalResource[]> => {
  const path = 'educational_resources';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        description: data.description || '',
        url: data.url || '',
        category: data.category || '',
        isVerified: data.isVerified ?? false,
        clicksCount: data.clicksCount || 0,
        recommendationsCount: data.recommendationsCount || 0,
        recommendedByUsers: data.recommendedByUsers || [],
        createdAt: data.createdAt || Date.now(),
        createdBy: data.createdBy || '',
        createdByName: data.createdByName || '',
        institution: data.institution || '',
        region: data.region || 'Both',
        tags: data.tags || []
      } as EducationalResource;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addEducationalResource = async (resource: Omit<EducationalResource, 'id' | 'clicksCount' | 'recommendationsCount' | 'recommendedByUsers' | 'createdAt'>): Promise<string> => {
  const path = 'educational_resources';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...resource,
      clicksCount: 0,
      recommendationsCount: 0,
      recommendedByUsers: [],
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const updateEducationalResource = async (id: string, resource: Partial<EducationalResource>): Promise<void> => {
  const path = `educational_resources/${id}`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    await updateDoc(docRef, resource);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const deleteEducationalResource = async (id: string): Promise<void> => {
  const path = `educational_resources/${id}`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

export const trackResourceClick = async (id: string): Promise<void> => {
  const path = `educational_resources/${id}/click`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    await updateDoc(docRef, {
      clicksCount: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const toggleRecommendResource = async (id: string, userId: string): Promise<void> => {
  const path = `educational_resources/${id}/recommend`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const recommendedByUsers: string[] = data.recommendedByUsers || [];
    let updatedUsers = [...recommendedByUsers];
    let recCount = data.recommendationsCount || 0;

    if (updatedUsers.includes(userId)) {
      updatedUsers = updatedUsers.filter(uid => uid !== userId);
      recCount = Math.max(0, recCount - 1);
    } else {
      updatedUsers.push(userId);
      recCount += 1;
    }

    await updateDoc(docRef, {
      recommendedByUsers: updatedUsers,
      recommendationsCount: recCount
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

/**
 * Save an annotation/highlight to Firestore (or fallback locally if offline)
 */
export const saveHighlight = async (highlight: Omit<HighlightAnnotation, 'id' | 'createdAt'>): Promise<string> => {
  const path = 'highlights';
  try {
    const docRef = doc(collection(db, path));
    const fullHighlight: HighlightAnnotation = {
      ...highlight,
      id: docRef.id,
      createdAt: Date.now()
    };
    await setDoc(docRef, fullHighlight);
    return docRef.id;
  } catch (err: any) {
    console.warn('saveHighlight offline fallback triggered:', err.message || err);
    const localHighlights = localStorage.getItem('local_highlights');
    const list = localHighlights ? JSON.parse(localHighlights) : [];
    const id = 'local_' + Math.random().toString(36).substring(2, 9);
    const fullHighlight: HighlightAnnotation = {
      ...highlight,
      id,
      createdAt: Date.now()
    };
    list.push(fullHighlight);
    localStorage.setItem('local_highlights', JSON.stringify(list));
    return id;
  }
};

/**
 * Fetch highlights for a user and optional documentId
 */
export const fetchHighlights = async (userId: string, documentId?: string): Promise<HighlightAnnotation[]> => {
  const path = 'highlights';
  try {
    const colRef = collection(db, path);
    let q = query(colRef, where('userId', '==', userId));
    if (documentId) {
      q = query(colRef, where('userId', '==', userId), where('documentId', '==', documentId));
    }
    const snap = await getDocs(q);
    const onlineList = snap.docs.map(d => d.data() as HighlightAnnotation);
    
    // Merge with local storage highlights
    const localHighlights = localStorage.getItem('local_highlights');
    const localList: HighlightAnnotation[] = localHighlights ? JSON.parse(localHighlights) : [];
    const filteredLocal = localList.filter(h => h.userId === userId && (!documentId || h.documentId === documentId));
    
    return [...onlineList, ...filteredLocal].sort((a, b) => b.createdAt - a.createdAt);
  } catch (err: any) {
    console.warn('fetchHighlights offline fallback triggered:', err.message || err);
    const localHighlights = localStorage.getItem('local_highlights');
    const localList: HighlightAnnotation[] = localHighlights ? JSON.parse(localHighlights) : [];
    return localList
      .filter(h => h.userId === userId && (!documentId || h.documentId === documentId))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
};

/**
 * Delete a highlight from Firestore/local storage
 */
export const deleteHighlight = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('local_')) {
      const localHighlights = localStorage.getItem('local_highlights');
      if (localHighlights) {
        let list: HighlightAnnotation[] = JSON.parse(localHighlights);
        list = list.filter(h => h.id !== id);
        localStorage.setItem('local_highlights', JSON.stringify(list));
      }
      return;
    }
    const docRef = doc(db, 'highlights', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn(`deleteHighlight error for ${id}:`, err.message || err);
    const localHighlights = localStorage.getItem('local_highlights');
    if (localHighlights) {
      let list: HighlightAnnotation[] = JSON.parse(localHighlights);
      list = list.filter(h => h.id !== id);
      localStorage.setItem('local_highlights', JSON.stringify(list));
    }
  }
};

export interface LibraryConfig {
  subjects: string[];
  classes: string[];
  categories: string[];
  educationLevels: string[];
}

export const DEFAULT_LIBRARY_CONFIG: LibraryConfig = {
  educationLevels: ['Primary', 'O-Level', 'A-Level', 'Teachers'],
  classes: [
    'Darasa la 1', 'Darasa la 2', 'Darasa la 3', 'Darasa la 4', 'Darasa la 5', 'Darasa la 6', 'Darasa la 7',
    'Form 1', 'Form 2', 'Form 3', 'Form 4',
    'Form 5', 'Form 6',
    'Grade A Diploma', 'Diploma in Education', 'Bachelor of Education'
  ],
  subjects: [
    'Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'Geography', 'History', 'Civics',
    'General Studies', 'Basic Applied Mathematics', 'Advanced Mathematics', 'Literature in English',
    'Commerce', 'Bookkeeping', 'Bible Knowledge', 'Islamic Knowledge', 'ICT', 'Lesson Planning', 'Child Development'
  ],
  categories: [
    'Notes', 'Books', 'Past Papers', 'Mock Exams', 'Pre-Necta', 'Necta', 'Marking Schemes', 'Practicals', 'Syllabus', 'Lesson Notes', 'Revision Questions'
  ]
};

/**
 * Fetch Library Config from Firestore with a robust fallback
 */
export const fetchLibraryConfig = async (): Promise<LibraryConfig> => {
  try {
    const docRef = doc(db, 'system_configs', 'library_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        educationLevels: data.educationLevels || DEFAULT_LIBRARY_CONFIG.educationLevels,
        classes: data.classes || DEFAULT_LIBRARY_CONFIG.classes,
        subjects: data.subjects || DEFAULT_LIBRARY_CONFIG.subjects,
        categories: data.categories || DEFAULT_LIBRARY_CONFIG.categories
      };
    }
    return DEFAULT_LIBRARY_CONFIG;
  } catch (err) {
    console.warn('fetchLibraryConfig offline fallback:', err);
    return DEFAULT_LIBRARY_CONFIG;
  }
};

/**
 * Save Library Config to Firestore
 */
export const saveLibraryConfig = async (config: LibraryConfig): Promise<void> => {
  try {
    const docRef = doc(db, 'system_configs', 'library_settings');
    await setDoc(docRef, config);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, 'system_configs/library_settings');
  }
};

/**
 * Website News Helpers (Kukusanya Habari & Idhini ya Admin)
 */
export const fetchWebsiteNews = async (filters?: { status?: 'pending' | 'approved' | 'rejected' }): Promise<WebsiteNews[]> => {
  const path = 'website_news';
  try {
    const colRef = collection(db, path);
    let q = query(colRef);
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as WebsiteNews));
    // Sort by createdAt desc in-memory to prevent "missing index" Firestore errors
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error fetching website news:', error);
    return [];
  }
};

export const saveWebsiteNews = async (newsData: Omit<WebsiteNews, 'id' | 'createdAt'>): Promise<string> => {
  const path = 'website_news';
  try {
    const colRef = collection(db, path);
    const payload = {
      ...newsData,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const updateWebsiteNews = async (id: string, updates: Partial<WebsiteNews>): Promise<void> => {
  const path = `website_news/${id}`;
  try {
    const docRef = doc(db, 'website_news', id);
    await updateDoc(docRef, updates);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const deleteWebsiteNews = async (id: string): Promise<void> => {
  const path = `website_news/${id}`;
  try {
    const docRef = doc(db, 'website_news', id);
    await deleteDoc(docRef);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};





