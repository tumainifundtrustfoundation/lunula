import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Users, 
  FileCheck, 
  BarChart3, 
  Clock, 
  Eye, 
  Download, 
  UserPlus, 
  ArrowUpRight,
  User,
  Crown,
  Award,
  GraduationCap,
  QrCode,
  PlusCircle,
  Settings,
  DollarSign,
  Plus,
  TrendingUp,
  HelpCircle,
  Megaphone,
  Search,
  Cpu,
  Database,
  Key,
  Mail,
  Link,
  Lock,
  Shield,
  Pencil,
  Sliders,
  X,
  Newspaper,
  Library,
  Tv,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DocumentMetadata, UserProfile, Certificate, ExamResult, AuditLog, SystemConfig, WebsiteNews, EducationalResource, Video, Product, Feedback } from '../types';
import UploadGuideWidget from './UploadGuideWidget';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { 
  auth,
  fetchDocuments, 
  updateDocument, 
  deleteDocumentMetadata, 
  fetchAllUsers, 
  updateUserProfile,
  getAccessToken,
  addNotification,
  addCertificate,
  fetchCertificates,
  deleteCertificate,
  addExamResult,
  fetchExamResults,
  deleteExamResult,
  fetchUserProfile,
  createAuditLog,
  fetchAuditLogs,
  fetchSystemConfig,
  updateSystemConfig,
  saveDocumentMetadata,
  fetchLibraryConfig,
  saveLibraryConfig,
  LibraryConfig,
  DEFAULT_LIBRARY_CONFIG,
  fetchWebsiteNews,
  updateWebsiteNews,
  deleteWebsiteNews,
  saveWebsiteNews,
  fetchEducationalResources,
  updateEducationalResource,
  deleteEducationalResource,
  fetchVideos,
  saveVideo,
  updateVideo,
  deleteVideo,
  fetchProducts,
  saveProduct,
  updateProduct,
  deleteProduct,
  fetchFeedbacks,
  updateFeedbackStatus,
  updateExamResult
} from '../firebase';

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1">
        <p className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
        {payload.map((item: any, idx: number) => (
          <p key={idx} className="font-bold flex items-center gap-1.5 text-slate-200">
            <span style={{ backgroundColor: item.color || item.fill }} className="inline-block w-2.5 h-2.5 rounded-full" />
            <span>{item.name}:</span>
            <span className="font-mono font-black text-white">{item.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface AdminViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function AdminView({
  onNavigate,
  userProfile
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<string>('approvals');
  
  // Standalone Admin Login states
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState<boolean>(false);
  
  // Data states
  const [pendingDocs, setPendingDocs] = useState<DocumentMetadata[]>([]);
  const [allDocs, setAllDocs] = useState<DocumentMetadata[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // --- NEW: Verification & AdSense states ---
  const [dbCerts, setDbCerts] = useState<Certificate[]>([]);
  const [dbResults, setDbResults] = useState<ExamResult[]>([]);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  
  // Issue Certificate Form states
  const [certStudentName, setCertStudentName] = useState<string>('');
  const [certStudentEmail, setCertStudentEmail] = useState<string>('');
  const [certCourse, setCertCourse] = useState<string>('');
  const [certSubject, setCertSubject] = useState<string>('Mathematics');
  const [certScore, setCertScore] = useState<number>(85);
  const [certGrade, setCertGrade] = useState<string>('Division I (A)');
  const [certCode, setCertCode] = useState<string>('');
  const [certIsSubmitting, setCertIsSubmitting] = useState<boolean>(false);

  // Issue Exam Result Form states
  const [resCandidateCode, setResCandidateCode] = useState<string>('');
  const [resStudentName, setResStudentName] = useState<string>('');
  const [resExamType, setResExamType] = useState<string>('Mock');
  const [resLevel, setResLevel] = useState<string>('Form 4');
  const [resYear, setResYear] = useState<number>(2026);
  const [resDivision, setResDivision] = useState<string>('Division I');
  const [resGpa, setResGpa] = useState<number>(1.5);
  const [resSubjects, setResSubjects] = useState<{subject: string, grade: string, score: number}[]>([
    { subject: 'Mathematics', grade: 'A', score: 88 }
  ]);
  const [resSubjectName, setResSubjectName] = useState<string>('');
  const [resSubjectGrade, setResSubjectGrade] = useState<string>('A');
  const [resSubjectScore, setResSubjectScore] = useState<number>(80);
  const [resIsSubmitting, setResIsSubmitting] = useState<boolean>(false);

  // Search states for registry
  const [certSearch, setCertSearch] = useState<string>('');
  const [resultSearch, setResultSearch] = useState<string>('');

  // AdSense simulation states (saved to localStorage for global toggle persistence)
  const [adsensePubId, setAdsensePubId] = useState<string>(() => localStorage.getItem('lup_adsense_pub_id') || 'ca-pub-mock-lupanulla');
  const [adsenseActive, setAdsenseActive] = useState<boolean>(() => localStorage.getItem('lup_adsense_active') !== 'false');
  const [adsenseFormat, setAdsenseFormat] = useState<string>('auto');
  const [adsenseEarnings, setAdsenseEarnings] = useState<number>(() => parseFloat(localStorage.getItem('lup_adsense_earnings') || '124.50'));
  const [adsenseImpressions, setAdsenseImpressions] = useState<number>(() => parseInt(localStorage.getItem('lup_adsense_impressions') || '25480'));
  const [adsenseClicks, setAdsenseClicks] = useState<number>(() => parseInt(localStorage.getItem('lup_adsense_clicks') || '596'));

  const [freshRole, setFreshRole] = useState<string | null>(null);
  const [loadingFreshRole, setLoadingFreshRole] = useState<boolean>(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // --- NEW: Digital Library admin management states ---
  const [libConfig, setLibConfig] = useState<LibraryConfig>(DEFAULT_LIBRARY_CONFIG);
  const [isLibraryConfigLoading, setIsLibraryConfigLoading] = useState<boolean>(false);
  const [showConfigManager, setShowConfigManager] = useState<boolean>(false);
  
  // Library management modes
  const [isDocFormOpen, setIsDocFormOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<DocumentMetadata | null>(null);
  
  // Document Form fields
  const [docTitle, setDocTitle] = useState<string>('');
  const [docDescription, setDocDescription] = useState<string>('');
  const [docCategory, setDocCategory] = useState<string>('Notes');
  const [docTagsInput, setDocTagsInput] = useState<string>('');
  const [docDriveUrl, setDocDriveUrl] = useState<string>('');
  const [docFileId, setDocFileId] = useState<string>('');
  const [docThumbnailUrl, setDocThumbnailUrl] = useState<string>('');
  const [docSubject, setDocSubject] = useState<string>('Mathematics');
  const [docEducationLevel, setDocEducationLevel] = useState<string>('O-Level');
  const [docClassLevel, setDocClassLevel] = useState<string>('Form 1');
  const [docYear, setDocYear] = useState<number>(2026);
  const [docRegion, setDocRegion] = useState<string>('');
  const [docStatus, setDocStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [isDocSaving, setIsDocSaving] = useState<boolean>(false);
  const [adminDocSearch, setAdminDocSearch] = useState<string>('');

  // --- NEW: News states ---
  const [dbNews, setDbNews] = useState<WebsiteNews[]>([]);
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [crawledNews, setCrawledNews] = useState<any[]>([]);
  const [isNewsFormOpen, setIsNewsFormOpen] = useState<boolean>(false);
  const [editingNews, setEditingNews] = useState<WebsiteNews | null>(null);
  const [newsSearch, setNewsSearch] = useState<string>('');

  // --- NEW: Educational Resources states ---
  const [dbResources, setDbResources] = useState<EducationalResource[]>([]);
  const [resourcesSearch, setResourcesSearch] = useState<string>('');
  const [resourcesLoading, setResourcesLoading] = useState<boolean>(false);

  // News Form states
  const [newsTitle, setNewsTitle] = useState<string>('');
  const [newsSource, setNewsSource] = useState<string>('');
  const [newsContent, setNewsContent] = useState<string>('');
  const [newsUrl, setNewsUrl] = useState<string>('');
  const [newsRelevance, setNewsRelevance] = useState<string>('');

  // Configuration adding helpers
  const [newSubject, setNewSubject] = useState<string>('');
  const [newClass, setNewClass] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');

  // --- NEW: Video class management states ---
  const [dbVideos, setDbVideos] = useState<Video[]>([]);
  const [videoSearch, setVideoSearch] = useState<string>('');
  const [isVideoFormOpen, setIsVideoFormOpen] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoSubject, setVideoSubject] = useState<string>('Physics');
  const [videoLevel, setVideoLevel] = useState<string>('O-Level');
  const [videoTeacher, setVideoTeacher] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<string>('15:00');
  const [isVideoSaving, setIsVideoSaving] = useState<boolean>(false);

  // --- NEW: Bookstore products management states ---
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number>(5000);
  const [productStockQuantity, setProductStockQuantity] = useState<number>(100);
  const [productCategory, setProductCategory] = useState<string>('Notes');
  const [productImageUrl, setProductImageUrl] = useState<string>('');
  const [isProductSaving, setIsProductSaving] = useState<boolean>(false);

  // --- NEW: User Feedbacks states ---
  const [dbFeedbacks, setDbFeedbacks] = useState<Feedback[]>([]);
  const [feedbackSearch, setFeedbackSearch] = useState<string>('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('all');

  useEffect(() => {
    const verifyUserRoleAndLoad = async () => {
      if (!userProfile?.uid) {
        setLoadingFreshRole(false);
        return;
      }
      try {
        setLoadingFreshRole(true);
        const freshProfile = await fetchUserProfile(userProfile.uid);
        if (freshProfile) {
          setFreshRole(freshProfile.role);
        } else {
          setFreshRole(userProfile.role || 'student');
        }
      } catch (err) {
        console.error('Failed to verify user role directly from Firestore:', err);
        setFreshRole(userProfile.role || 'student');
      } finally {
        setLoadingFreshRole(false);
      }
    };

    verifyUserRoleAndLoad();
  }, [userProfile?.uid]);

  useEffect(() => {
    if (freshRole === 'admin' || freshRole === 'super_admin') {
      loadAdminData();
    }
  }, [freshRole, activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load educational resources for badge or management
      if (activeTab === 'approvals' || activeTab === 'resources') {
        try {
          const resList = await fetchEducationalResources();
          setDbResources(resList);
        } catch (err) {
          console.error('Error fetching educational resources in admin panel:', err);
        }
      }

      if (activeTab === 'approvals') {
        const pDocs = await fetchDocuments({ status: 'pending' });
        pDocs.sort((a, b) => b.createdAt - a.createdAt);
        setPendingDocs(pDocs);
      } else if (activeTab === 'documents') {
        const aDocs = await fetchDocuments();
        aDocs.sort((a, b) => b.createdAt - a.createdAt);
        setAllDocs(aDocs);
        try {
          const config = await fetchLibraryConfig();
          setLibConfig(config);
        } catch (e) {
          console.warn('Failed to fetch library config in admin panel', e);
        }
      } else if (activeTab === 'users') {
        const users = await fetchAllUsers();
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAllUsers(users);
      } else if (activeTab === 'analytics') {
        const users = await fetchAllUsers();
        const docs = await fetchDocuments();
        setAllUsers(users);
        setAllDocs(docs);
      } else if (activeTab === 'verification') {
        const certsList = await fetchCertificates();
        const resultsList = await fetchExamResults();
        const users = await fetchAllUsers();
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAllUsers(users);
        setDbCerts(certsList);
        setDbResults(resultsList);
      } else if (activeTab === 'activity_logs') {
        if (freshRole === 'super_admin') {
          const logs = await fetchAuditLogs();
          setAuditLogs(logs);
        }
      } else if (activeTab === 'integrations') {
        if (freshRole === 'super_admin') {
          const config = await fetchSystemConfig();
          setSystemConfig(config || {
            id: 'integrations',
            oauthGoogleClientId: '',
            oauthGoogleClientSecret: '',
            mfaEnabled: false,
            mpesaConsumerKey: '',
            mpesaConsumerSecret: '',
            mpesaPasskey: '',
            airtelMoneyClientId: '',
            airtelMoneyClientSecret: '',
            mixByYasApiKey: '',
            stripePublicKey: '',
            stripeSecretKey: '',
            paypalClientId: '',
            paypalSecretKey: '',
            geminiApiKey: '',
            googleMeetClientId: '',
            zoomClientId: '',
            zoomClientSecret: '',
            supabaseUrl: '',
            supabaseServiceKey: '',
            cloudflareR2Bucket: '',
            cloudflareR2AccessKey: '',
            cloudflareR2SecretKey: '',
            emailSmtpHost: '',
            emailSmtpPort: 587,
            emailSmtpUser: '',
            emailSmtpPass: '',
            googleAnalyticsId: '',
            googleSearchConsoleId: '',
            clarityId: '',
            cloudflareWafZoneId: '',
          });
        }
      } else if (activeTab === 'news') {
        const news = await fetchWebsiteNews();
        setDbNews(news);
      } else if (activeTab === 'videos') {
        const vList = await fetchVideos();
        setDbVideos(vList);
      } else if (activeTab === 'products') {
        const prodList = await fetchProducts();
        prodList.sort((a, b) => b.price - a.price);
        setDbProducts(prodList);
      } else if (activeTab === 'feedback') {
        const feedbackList = await fetchFeedbacks();
        feedbackList.sort((a, b) => b.createdAt - a.createdAt);
        setDbFeedbacks(feedbackList);
      }
    } catch (err) {
      console.error('Error loading admin dashboard datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handlers for Certificates and Exam Results ---

  const handleSelectStudentChange = (uid: string) => {
    setSelectedStudentUid(uid);
    const u = allUsers.find(usr => usr.uid === uid);
    if (u) {
      setCertStudentName(u.name);
      setCertStudentEmail(u.email);
      setResStudentName(u.name);
    }
  };

  const handleGenerateCertCode = (subject: string) => {
    const cleanSub = subject.slice(0, 4).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setCertCode(`LUP-${cleanSub}-2026-${randomSuffix}`);
  };

  const handleAddCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudentName || !certCourse || !certCode) {
      alert('Tafadhali jaza taarifa zote muhimu, ikijumuisha jina la mwanafunzi na mada ya cheti.');
      return;
    }
    setCertIsSubmitting(true);
    try {
      const payload = {
        studentName: certStudentName,
        studentEmail: certStudentEmail || '',
        courseName: certCourse,
        subject: certSubject,
        grade: certGrade,
        score: Number(certScore),
        dateAwarded: new Date().toISOString().split('T')[0],
        verificationCode: certCode.trim().toUpperCase(),
        issuedBy: 'Lupanulla Academic Board'
      };

      await addCertificate(payload);
      await logAdminAction('create_certificate', certCode, certStudentName, `Issued academic certificate for somo "${certSubject}" under course "${certCourse}"`);
      
      // Notify student
      const matchedUser = allUsers.find(u => u.email.toLowerCase() === certStudentEmail.toLowerCase() || u.name.toLowerCase() === certStudentName.toLowerCase());
      if (matchedUser) {
        await addNotification({
          userId: matchedUser.uid,
          title: 'Cheti Kipya cha Kitaaluma! 🎓',
          message: `Hongera! Cheti chako kipya cha ufaulu wa somo "${certSubject}" kimeandaliwa. Tumia nambari ya uhakiki: ${certCode.toUpperCase()}`,
          type: 'general',
          link: 'certificates'
        });
      }

      alert('Hongera! Cheti kimesajiliwa kikamilifu kwenye mfumo wetu wa Lupanulla.');
      setCertStudentName('');
      setCertStudentEmail('');
      setCertCourse('');
      setCertCode('');
      
      const certsList = await fetchCertificates();
      setDbCerts(certsList);
    } catch (err) {
      console.error('Failed to add certificate:', err);
      alert('Imeshindwa kusajili cheti kwasababu ya hitilafu.');
    } finally {
      setCertIsSubmitting(false);
    }
  };

  const handleDeleteCertificateClick = async (id: string, code: string) => {
    const confirmed = window.confirm(`Je, una uhakika unataka kufuta cheti namba ${code}? Kitendo hiki hakirudishwi.`);
    if (!confirmed) return;
    try {
      await deleteCertificate(id);
      await logAdminAction('delete_certificate', id, code, `Deleted student certificate with verification code: ${code}`);
      setDbCerts(dbCerts.filter(c => c.id !== id));
      alert('Cheti kimefutwa kwenye mfumo.');
    } catch (err) {
      console.error('Failed to delete certificate:', err);
    }
  };

  const handleAddSubjectRow = () => {
    if (!resSubjectName) {
      alert('Tafadhali ingiza jina la somo (mfano: Basic Mathematics)');
      return;
    }
    setResSubjects([
      ...resSubjects,
      { subject: resSubjectName, grade: resSubjectGrade, score: Number(resSubjectScore) }
    ]);
    setResSubjectName('');
    setResSubjectScore(80);
    setResSubjectGrade('A');
  };

  const handleRemoveSubjectRow = (index: number) => {
    setResSubjects(resSubjects.filter((_, i) => i !== index));
  };

  const handleAddExamResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resStudentName || !resCandidateCode || resSubjects.length === 0) {
      alert('Hakikisha umejaza Jina la mwanafunzi, Nambari ya Mtihani na kuingiza masomo.');
      return;
    }
    setResIsSubmitting(true);
    try {
      const payload = {
        studentName: resStudentName,
        candidateCode: resCandidateCode.trim().toUpperCase(),
        examType: resExamType,
        level: resLevel,
        year: Number(resYear),
        division: resDivision,
        gpa: Number(resGpa),
        subjects: resSubjects,
        publishedAt: Date.now(),
        status: 'published' as const
      };

      await addExamResult(payload);
      await logAdminAction('create_exam_result', resCandidateCode, resStudentName, `Published ${resExamType} result for level ${resLevel} (${resYear})`);
      
      // Notify student
      const matchedUser = allUsers.find(u => u.name.toLowerCase() === resStudentName.toLowerCase());
      if (matchedUser) {
        await addNotification({
          userId: matchedUser.uid,
          title: 'Matokeo ya Mitihani Yametangazwa! 📝',
          message: `Habari njema! Matokeo yako ya mitihani ya mfululizo wa "${resExamType}" yametangazwa. Divisheni yako ni: ${resDivision}`,
          type: 'general',
          link: 'certificates'
        });
      }

      alert('Matokeo ya mtihani yamesajiliwa kikamilifu kwenye maktaba yetu.');
      setResCandidateCode('');
      setResStudentName('');
      setResSubjects([{ subject: 'Mathematics', grade: 'A', score: 88 }]);
      
      const resultsList = await fetchExamResults();
      setDbResults(resultsList);
    } catch (err) {
      console.error('Failed to add exam result:', err);
      alert('Hitilafu imetokea wakati wa kusajili matokeo.');
    } finally {
      setResIsSubmitting(false);
    }
  };

  const handleDeleteExamResultClick = async (id: string, cand: string) => {
    const confirmed = window.confirm(`Je, una uhakika unataka kufuta matokeo ya mtihani ya ${cand}?`);
    if (!confirmed) return;
    try {
      await deleteExamResult(id);
      await logAdminAction('delete_exam_result', id, cand, `Deleted exam result entry for candidate code: ${cand}`);
      setDbResults(dbResults.filter(r => r.id !== id));
      alert('Matokeo yamefutwa kikamilifu.');
    } catch (err) {
      console.error('Failed to delete exam result:', err);
    }
  };

  // --- NEW: News management handlers ---

  const handleCrawlNewsWithAI = async () => {
    setIsCrawling(true);
    setCrawledNews([]);
    try {
      const response = await fetch('/api/ai/crawl-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Hitilafu ya seva ilitokea.');
      }
      const data = await response.json();
      if (data.news && data.news.length > 0) {
        setCrawledNews(data.news);
        alert(`Hongera! Mfumo umekusanya habari mpya ${data.news.length} kutoka vyanzo vya elimu Tanzania kwa kutumia Gemini AI.`);
      } else {
        alert('Hakuna habari mpya zilizopatikana wakati huu. Tafadhali jaribu tena baadae.');
      }
    } catch (err: any) {
      console.error('Failed to crawl news:', err);
      alert(`Imeshindwa kukusanya habari: ${err.message || err}`);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleSaveCrawledNewsItem = async (crawledItem: any, approveImmediately = false) => {
    try {
      const payload = {
        title: crawledItem.title,
        source: crawledItem.source,
        content: crawledItem.content,
        url: crawledItem.url || '',
        relevanceExplanation: crawledItem.relevanceExplanation || '',
        status: (approveImmediately ? 'approved' : 'pending') as 'pending' | 'approved'
      };

      const docId = await saveWebsiteNews(payload);
      
      // Update UI state
      const newNews: WebsiteNews = {
        id: docId,
        ...payload,
        createdAt: Date.now()
      };
      setDbNews(prev => [newNews, ...prev]);
      
      // Remove from temporary crawled list
      setCrawledNews(prev => prev.filter(item => item.title !== crawledItem.title));

      await logAdminAction(
        approveImmediately ? 'approve_news' : 'create_news_pending', 
        docId, 
        crawledItem.title, 
        `Added crawled news item with status: ${approveImmediately ? 'approved' : 'pending'}`
      );

      alert(approveImmediately ? 'Habari imehifadhiwa na kuidhinishwa papo hapo!' : 'Habari imehifadhiwa kama pendekezo (Pending).');
    } catch (err) {
      console.error('Failed to save crawled news:', err);
      alert('Imeshindwa kuhifadhi habari.');
    }
  };

  const handleManualNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsSource || !newsContent) {
      alert('Tafadhali jaza taarifa zote muhimu (Kichwa, Chanzo, na Maelezo).');
      return;
    }

    try {
      const payload = {
        title: newsTitle,
        source: newsSource,
        content: newsContent,
        url: newsUrl,
        relevanceExplanation: newsRelevance,
        status: (editingNews ? editingNews.status : 'pending') as 'pending' | 'approved' | 'rejected'
      };

      if (editingNews) {
        await updateWebsiteNews(editingNews.id, payload);
        setDbNews(prev => prev.map(n => n.id === editingNews.id ? { ...n, ...payload } : n));
        await logAdminAction('update_news', editingNews.id, newsTitle, 'Updated manually edited news details');
        alert('Mabadiliko ya habari yamehifadhiwa kikamilifu!');
      } else {
        const id = await saveWebsiteNews(payload);
        const newNews: WebsiteNews = {
          id,
          ...payload,
          createdAt: Date.now()
        };
        setDbNews(prev => [newNews, ...prev]);
        await logAdminAction('create_news_manual', id, newsTitle, 'Created new website news manually as pending');
        alert('Habari mpya imesajiliwa kama Pendekezo (Pending)!');
      }

      // Reset form & close modal
      setNewsTitle('');
      setNewsSource('');
      setNewsContent('');
      setNewsUrl('');
      setNewsRelevance('');
      setEditingNews(null);
      setIsNewsFormOpen(false);
    } catch (err) {
      console.error('Failed to save manual news:', err);
      alert('Hitilafu ilitokea wakati wa kuhifadhi habari.');
    }
  };

  const handleUpdateNewsStatusClick = async (id: string, currentTitle: string, status: 'approved' | 'rejected') => {
    try {
      await updateWebsiteNews(id, { status });
      setDbNews(prev => prev.map(n => n.id === id ? { ...n, status } : n));
      await logAdminAction(
        status === 'approved' ? 'approve_news' : 'reject_news', 
        id, 
        currentTitle, 
        `Updated news verification status to: ${status}`
      );
      alert(status === 'approved' ? 'Habari imeidhinishwa na sasa ipo wazi kwa wasomaji!' : 'Habari imekataliwa.');
    } catch (err) {
      console.error('Failed to update news status:', err);
      alert('Imeshindwa kusasisha hali ya habari.');
    }
  };

  const handleDeleteNewsClick = async (id: string, currentTitle: string) => {
    const confirmed = window.confirm(`Je, una uhakika unataka kufuta kabisa habari hii: "${currentTitle}"?`);
    if (!confirmed) return;

    try {
      await deleteWebsiteNews(id);
      setDbNews(prev => prev.filter(n => n.id !== id));
      await logAdminAction('delete_news', id, currentTitle, 'Deleted news item from database');
      alert('Habari imefutwa kwenye mfumo yetu.');
    } catch (err) {
      console.error('Failed to delete news:', err);
      alert('Imeshindwa kufuta habari.');
    }
  };

  const handleVerifyResourceClick = async (id: string, currentTitle: string) => {
    try {
      await updateEducationalResource(id, { isVerified: true });
      setDbResources(prev => prev.map(r => r.id === id ? { ...r, isVerified: true } : r));
      await logAdminAction(
        'approve_resource', 
        id, 
        currentTitle, 
        `Verified educational resource: ${currentTitle}`
      );
      alert('Rasilimali ya elimu imehakikiwa na sasa ipo wazi kwa wanafunzi wote!');
    } catch (err) {
      console.error('Failed to verify resource:', err);
      alert('Imeshindwa kuhakiki rasilimali hii.');
    }
  };

  const handleDeleteResourceClick = async (id: string, currentTitle: string) => {
    const confirmed = window.confirm(`Je, una uhakika unataka kufuta kabisa rasilimali hii ya elimu: "${currentTitle}"?`);
    if (!confirmed) return;

    try {
      await deleteEducationalResource(id);
      setDbResources(prev => prev.filter(r => r.id !== id));
      await logAdminAction('delete_resource', id, currentTitle, `Deleted educational resource link: ${currentTitle}`);
      alert('Rasilimali imefutwa kabisa kutoka kwenye mfumo wetu.');
    } catch (err) {
      console.error('Failed to delete resource:', err);
      alert('Imeshindwa kufuta rasilimali.');
    }
  };

  // --- NEW: Video Class Management Handlers ---
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    if (url.trim().length === 11) {
      return url.trim();
    }
    return null;
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoTitle('');
    setVideoSubject('Physics');
    setVideoLevel('O-Level');
    setVideoTeacher(userProfile?.name || '');
    setVideoUrl('');
    setVideoDuration('15:00');
    setIsVideoFormOpen(true);
  };

  const handleOpenEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoTitle(video.title);
    setVideoSubject(video.subject || 'Physics');
    setVideoLevel(video.level || 'O-Level');
    setVideoTeacher(video.teacher || '');
    setVideoUrl(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setVideoDuration(video.duration || '15:00');
    setIsVideoFormOpen(true);
  };

  const handleSaveVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      alert('Tafadhali weka kichwa/mada ya video.');
      return;
    }
    const ytId = extractYouTubeId(videoUrl);
    if (!ytId) {
      alert('Kiungo cha YouTube si sahihi au umbizo lake halikutambuliwa.');
      return;
    }

    setIsVideoSaving(true);
    try {
      const thumbnail = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
      const payload = {
        title: videoTitle.trim(),
        subject: videoSubject,
        level: videoLevel,
        teacher: videoTeacher.trim() || userProfile?.name || 'Mwl. Mwema',
        duration: videoDuration || '15:00',
        youtubeId: ytId,
        thumbnailUrl: thumbnail,
        views: editingVideo ? (editingVideo.views || 0) : 0
      };

      if (editingVideo) {
        await updateVideo(editingVideo.id, payload);
        await logAdminAction('update_video', editingVideo.id, videoTitle.trim(), 'Updated video class item details');
        alert('Mabadiliko ya video yamehifadhiwa kikamilifu!');
      } else {
        const id = await saveVideo(payload);
        await logAdminAction('create_video', id, videoTitle.trim(), 'Added new video class item directly to library');
        alert('Video mpya imehifadhiwa kikamilifu!');
      }

      setIsVideoFormOpen(false);
      setEditingVideo(null);
      // reload
      const vList = await fetchVideos();
      setDbVideos(vList);
    } catch (err: any) {
      console.error(err);
      alert('Imeshindwa kuhifadhi video: ' + (err.message || err));
    } finally {
      setIsVideoSaving(false);
    }
  };

  const handleDeleteVideoClick = async (id: string, currentTitle: string) => {
    const confirmed = window.confirm(`Je, una uhakika unataka kufuta kabisa video hii: "${currentTitle}"?`);
    if (!confirmed) return;

    try {
      await deleteVideo(id);
      setDbVideos(prev => prev.filter(v => v.id !== id));
      await logAdminAction('delete_video', id, currentTitle, `Deleted video class item from library: ${currentTitle}`);
      alert('Video imefutwa kikamilifu.');
    } catch (err) {
      console.error('Failed to delete video:', err);
      alert('Imeshindwa kufuta video.');
    }
  };

  // --- NEW: Product Management Handlers ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductName('');
    setProductDescription('');
    setProductPrice(5000);
    setProductStockQuantity(100);
    setProductCategory('Notes');
    setProductImageUrl('');
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || '');
    setProductPrice(product.price);
    setProductStockQuantity(product.stockQuantity);
    setProductCategory(product.category || 'Notes');
    setProductImageUrl(product.imageUrl || '');
    setIsProductFormOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Tafadhali weka jina la bidhaa.');
      return;
    }
    if (productPrice <= 0) {
      alert('Tafadhali weka bei sahihi.');
      return;
    }

    setIsProductSaving(true);
    try {
      const payload = {
        name: productName.trim(),
        description: productDescription.trim(),
        price: Number(productPrice),
        stockQuantity: Number(productStockQuantity),
        category: productCategory,
        imageUrl: productImageUrl.trim() || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=60'
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        await logAdminAction('update_product', editingProduct.id, productName.trim(), 'Updated product details in bookstore');
        alert('Bidhaa imesasishwa kikamilifu!');
      } else {
        const id = await saveProduct(payload);
        await logAdminAction('create_product', id, productName.trim(), 'Added new product directly to bookstore catalog');
        alert('Bidhaa mpya imehifadhiwa kikamilifu!');
      }

      setIsProductFormOpen(false);
      setEditingProduct(null);
      // reload
      const prodList = await fetchProducts();
      setDbProducts(prodList);
    } catch (err: any) {
      console.error(err);
      alert('Imeshindwa kuhifadhi bidhaa: ' + (err.message || err));
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleDeleteProductClick = async (id: string, name: string) => {
    const confirmed = window.confirm(`Je, una uhakika unataka kufuta kabisa bidhaa hii: "${name}"?`);
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      setDbProducts(prev => prev.filter(p => p.id !== id));
      await logAdminAction('delete_product', id, name, `Deleted product from bookstore catalog: ${name}`);
      alert('Bidhaa imefutwa kikamilifu.');
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Imeshindwa kufuta bidhaa.');
    }
  };

  // --- NEW: Feedback Management Handlers ---
  const handleUpdateFeedbackStatus = async (id: string, currentText: string, status: 'new' | 'reviewed' | 'resolved') => {
    try {
      await updateFeedbackStatus(id, status);
      setDbFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      await logAdminAction('update_feedback_status', id, currentText.slice(0, 30), `Updated feedback status to ${status}`);
      alert('Hali ya maoni imesasishwa kikamilifu!');
    } catch (err) {
      console.error('Failed to update feedback status:', err);
      alert('Imeshindwa kusasisha hali ya maoni.');
    }
  };

  const handleOpenEditNews = (newsItem: WebsiteNews) => {
    setEditingNews(newsItem);
    setNewsTitle(newsItem.title);
    setNewsSource(newsItem.source);
    setNewsContent(newsItem.content);
    setNewsUrl(newsItem.url || '');
    setNewsRelevance(newsItem.relevanceExplanation || '');
    setIsNewsFormOpen(true);
  };

  const handleOpenAddNews = () => {
    setEditingNews(null);
    setNewsTitle('');
    setNewsSource('');
    setNewsContent('');
    setNewsUrl('');
    setNewsRelevance('');
    setIsNewsFormOpen(true);
  };

  const handleSaveAdsenseSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lup_adsense_pub_id', adsensePubId);
    localStorage.setItem('lup_adsense_active', String(adsenseActive));
    await logAdminAction('update_adsense', adsensePubId, 'AdSense Config', `Updated AdSense Publisher ID to ${adsensePubId} and Active status to ${adsenseActive}`);
    alert('Mipangilio ya Google AdSense imesajiliwa na kusasishwa kote kwenye jukwaa la Lupanulla!');
  };

  const handleSaveSystemConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (freshRole !== 'super_admin') {
      alert('Hitilafu: Ni Super Admin pekee anayeruhusiwa kuhifadhi mipangilio ya huduma za nje.');
      return;
    }
    if (!systemConfig) return;
    try {
      setIsSavingConfig(true);
      const payload: SystemConfig = {
        ...systemConfig,
        updatedAt: Date.now(),
        updatedBy: userProfile?.name || 'Unknown Super Admin'
      };
      await updateSystemConfig(payload);
      await logAdminAction('update_integrations', 'integrations', 'System Integrations Config', 'Updated sensitive credentials and API config settings for modular integrations');
      alert('Hongera! Mipangilio yote ya huduma za nje imehifadhiwa kikamilifu kwenye Firestore Database.');
    } catch (err) {
      console.error('Failed to save integration configurations:', err);
      alert('Mchakato umeshindikana: Tafadhali angalia mtandao au mamlaka ya akaunti yako.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSimulateAdClick = () => {
    const newEarnings = adsenseEarnings + 0.18;
    const newClicks = adsenseClicks + 1;
    const newImpressions = adsenseImpressions + Math.floor(Math.random() * 12 + 1);
    
    setAdsenseEarnings(newEarnings);
    setAdsenseClicks(newClicks);
    setAdsenseImpressions(newImpressions);
    
    localStorage.setItem('lup_adsense_earnings', newEarnings.toFixed(2));
    localStorage.setItem('lup_adsense_clicks', String(newClicks));
    localStorage.setItem('lup_adsense_impressions', String(newImpressions));
    
    alert('Click Simulated! Estimated Earnings increased by +$0.18. Active Slot CTR updated.');
  };

  const logAdminAction = async (action: string, targetId: string, targetName: string, details?: string) => {
    try {
      await createAuditLog({
        adminId: userProfile?.uid || 'unknown',
        adminName: userProfile?.name || 'Unknown Admin',
        adminEmail: userProfile?.email || 'unknown@lupanulla.com',
        action,
        targetId,
        targetName,
        details
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  };

  const handleToggleSuspension = async (userId: string) => {
    if (freshRole !== 'super_admin') {
      alert('Hitilafu: Ni Super Admin pekee anayeruhusiwa kusimamisha au kurudisha akaunti za watumiaji.');
      return;
    }
    const u = allUsers.find(usr => usr.uid === userId);
    if (!u) return;

    if (u.isSuspended) {
      const confirmed = window.confirm(`Je, una uhakika unataka kumrudisha mtumiaji ${u.name}?`);
      if (!confirmed) return;
      try {
        await updateUserProfile(userId, { isSuspended: false, suspensionReason: '' });
        setAllUsers(allUsers.map(usr => usr.uid === userId ? { ...usr, isSuspended: false, suspensionReason: '' } : usr));
        await logAdminAction('unsuspend_user', userId, u.name, 'Restored user account from suspension');
        alert('Mtumiaji amerudishwa kwenye mfumo kikamilifu.');
      } catch (err) {
        console.error('Failed to unsuspend user:', err);
      }
    } else {
      const reason = window.prompt(`Tafadhali ingiza sababu ya kusimamisha akaunti ya ${u.name}:`);
      if (reason === null) return;
      if (!reason.trim()) {
        alert('Ni lazima uingize sababu stahiki ya kusimamisha mtumiaji.');
        return;
      }
      try {
        await updateUserProfile(userId, { 
          isSuspended: true, 
          suspendedAt: Date.now(), 
          suspensionReason: reason.trim() 
        });
        setAllUsers(allUsers.map(usr => usr.uid === userId ? { 
          ...usr, 
          isSuspended: true, 
          suspendedAt: Date.now(), 
          suspensionReason: reason.trim() 
        } : usr));
        await logAdminAction('suspend_user', userId, u.name, `Suspended user. Reason: ${reason.trim()}`);
        alert('Akaunti ya mtumiaji imesimamishwa kikamilifu.');
      } catch (err) {
        console.error('Failed to suspend user:', err);
      }
    }
  };

  const handleApprove = async (docId: string) => {
    setActioningId(docId);
    try {
      const docToApprove = pendingDocs.find(d => d.id === docId);
      await updateDocument(docId, { status: 'approved' });
      setPendingDocs(pendingDocs.filter(d => d.id !== docId));
      
      if (docToApprove) {
        await addNotification({
          userId: docToApprove.uploadedBy,
          title: 'Nyaraka Yako Imeidhinishwa! 🎉',
          message: `Nyaraka yako "${docToApprove.title}" imethibitishwa kikamilifu na sasa inapatikana kwenye maktaba ya Lupanulla Elimu Hub.`,
          type: 'approval',
          link: 'dashboard'
        });
        await logAdminAction('approve_document', docId, docToApprove.title, `Approved document and sent approval notification.`);
      }
      
      alert('Nyaraka imeidhinishwa kikamilifu na sasa ipo wazi kwenye jukwaa la wasomaji.');
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (docId: string) => {
    setActioningId(docId);
    try {
      const docToReject = pendingDocs.find(d => d.id === docId);
      await updateDocument(docId, { status: 'rejected' });
      setPendingDocs(pendingDocs.filter(d => d.id !== docId));
      
      if (docToReject) {
        await addNotification({
          userId: docToReject.uploadedBy,
          title: 'Nyaraka Yako Imekataliwa ⚠️',
          message: `Samahani, nyaraka yako "${docToReject.title}" haikukidhi vigezo vya miongozo yetu ya kimasomo na imekataliwa.`,
          type: 'approval',
          link: 'dashboard'
        });
        await logAdminAction('reject_document', docId, docToReject.title, `Rejected pending document.`);
      }
      
      alert('Nyaraka imekataliwa.');
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (docId: string, fileId: string, title: string) => {
    const confirmed = window.confirm(`Je, una uhakika unataka kufuta kabisa nyaraka "${title}"? Hii itaondoa pia faili kule Google Drive.`);
    if (!confirmed) return;

    setActioningId(docId);
    let token = getAccessToken();

    try {
      // Step 1: Delete file from owner's Google Drive if we have permission token
      if (token && fileId) {
        await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Step 2: Delete from Firestore catalog
      await deleteDocumentMetadata(docId);
      setAllDocs(allDocs.filter(d => d.id !== docId));
      await logAdminAction('delete_document', docId, title, `Deleted document from system library catalog.`);
      alert('Nyaraka imefutwa kwenye mfumo.');
    } catch (err) {
      console.error('Failed to delete catalog item:', err);
    } finally {
      setActioningId(null);
    }
  };

  // --- NEW: DIGITAL LIBRARY AND CONFIG MANAGEMENT METHODS ---
  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setDocTitle('');
    setDocDescription('');
    setDocCategory(libConfig.categories[0] || 'Notes');
    setDocTagsInput('');
    setDocDriveUrl('');
    setDocFileId('');
    setDocThumbnailUrl('');
    setDocSubject(libConfig.subjects[0] || 'Mathematics');
    setDocEducationLevel(libConfig.educationLevels[0] || 'O-Level');
    setDocClassLevel(libConfig.classes[0] || 'Form 1');
    setDocYear(2026);
    setDocRegion('');
    setDocStatus('approved');
    setIsDocFormOpen(true);
  };

  const handleOpenEditDoc = (docItem: DocumentMetadata) => {
    setEditingDoc(docItem);
    setDocTitle(docItem.title || '');
    setDocDescription(docItem.description || '');
    setDocCategory(docItem.category || 'Notes');
    setDocTagsInput(docItem.tags?.join(', ') || '');
    setDocDriveUrl(docItem.driveUrl || '');
    setDocFileId(docItem.fileId || '');
    setDocThumbnailUrl((docItem as any).thumbnailUrl || '');
    setDocSubject((docItem as any).subject || 'Mathematics');
    setDocEducationLevel((docItem as any).educationLevel || 'O-Level');
    setDocClassLevel((docItem as any).classLevel || 'Form 1');
    setDocYear(docItem.year || 2026);
    setDocRegion((docItem as any).region || docItem.accent || '');
    setDocStatus(docItem.status || 'approved');
    setIsDocFormOpen(true);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) {
      alert('Tafadhali jaza jina la nyaraka.');
      return;
    }
    if (!docDriveUrl) {
      alert('Tafadhali jaza Drive URL au Link ya nyaraka.');
      return;
    }
    
    setIsDocSaving(true);
    try {
      const tags = docTagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const parsedYear = Number(docYear) || 2026;
      
      const payload: Partial<DocumentMetadata> = {
        title: docTitle,
        description: docDescription,
        category: docCategory,
        tags: tags,
        driveUrl: docDriveUrl,
        fileId: docFileId || `custom-${Date.now()}`,
        uploadedBy: userProfile?.uid || 'admin',
        uploadedByName: userProfile?.name || 'Msimamizi Lupanulla',
        year: parsedYear,
        status: docStatus,
        rating: 5,
        downloadsCount: editingDoc?.downloadsCount || 0,
        // New extended library parameters
        educationLevel: docEducationLevel,
        classLevel: docClassLevel,
        subject: docSubject,
        documentType: docCategory,
        region: docRegion,
        thumbnailUrl: docThumbnailUrl,
        type: docCategory
      } as any;

      if (editingDoc) {
        // Edit existing document
        await updateDocument(editingDoc.id, payload);
        alert('Nyaraka imerekebishwa kikamilifu!');
        await logAdminAction('edit_document', editingDoc.id, docTitle, `Updated document metadata details in library.`);
      } else {
        // Create new document metadata
        const newId = await saveDocumentMetadata({
          title: docTitle,
          description: docDescription,
          category: docCategory,
          tags: tags,
          driveUrl: docDriveUrl,
          fileId: docFileId || `custom-${Date.now()}`,
          uploadedBy: userProfile?.uid || 'admin',
          uploadedByName: userProfile?.name || 'Msimamizi Lupanulla',
          year: parsedYear,
          status: docStatus,
          // New properties mapping
          educationLevel: docEducationLevel,
          classLevel: docClassLevel,
          subject: docSubject,
          documentType: docCategory,
          region: docRegion,
          thumbnailUrl: docThumbnailUrl,
          type: docCategory
        } as any);
        
        // Auto-approve newly created doc if status is set to approved
        if (docStatus !== 'pending') {
          await updateDocument(newId, { status: docStatus });
        }
        alert('Nyaraka mpya imehifadhiwa kikamilifu!');
        await logAdminAction('create_document', newId, docTitle, `Added new document directly to system library.`);
      }

      // Close Form and Reload Docs
      setIsDocFormOpen(false);
      setEditingDoc(null);
      const docs = await fetchDocuments();
      docs.sort((a, b) => b.createdAt - a.createdAt);
      setAllDocs(docs);
    } catch (err: any) {
      console.error('Error saving document:', err);
      alert('Imeshindikana kuhifadhi nyaraka: ' + (err.message || err));
    } finally {
      setIsDocSaving(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    const clean = newSubject.trim();
    if (libConfig.subjects.includes(clean)) {
      alert('Somo hili tayari lipo.');
      return;
    }
    const updated = {
      ...libConfig,
      subjects: [...libConfig.subjects, clean].sort()
    };
    await saveLibraryConfig(updated);
    setLibConfig(updated);
    setNewSubject('');
  };

  const handleRemoveSubject = async (sub: string) => {
    const updated = {
      ...libConfig,
      subjects: libConfig.subjects.filter(s => s !== sub)
    };
    await saveLibraryConfig(updated);
    setLibConfig(updated);
  };

  const handleAddClass = async () => {
    if (!newClass.trim()) return;
    const clean = newClass.trim();
    if (libConfig.classes.includes(clean)) {
      alert('Darasa hili tayari lipo.');
      return;
    }
    const updated = {
      ...libConfig,
      classes: [...libConfig.classes, clean]
    };
    await saveLibraryConfig(updated);
    setLibConfig(updated);
    setNewClass('');
  };

  const handleRemoveClass = async (cls: string) => {
    const updated = {
      ...libConfig,
      classes: libConfig.classes.filter(c => c !== cls)
    };
    await saveLibraryConfig(updated);
    setLibConfig(updated);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const clean = newCategory.trim();
    if (libConfig.categories.includes(clean)) {
      alert('Aina hii tayari ipo.');
      return;
    }
    const updated = {
      ...libConfig,
      categories: [...libConfig.categories, clean]
    };
    await saveLibraryConfig(updated);
    setLibConfig(updated);
    setNewCategory('');
  };

  const handleRemoveCategory = async (cat: string) => {
    const updated = {
      ...libConfig,
      categories: libConfig.categories.filter(c => c !== cat)
    };
    await saveLibraryConfig(updated);
    setLibConfig(updated);
  };

  const handleRoleChange = async (userId: string, newRole: any) => {
    if (freshRole !== 'super_admin') {
      alert('Hitilafu: Ni Super Admin pekee anayeruhusiwa kubadilisha haki au majukumu ya watumiaji.');
      return;
    }
    try {
      const u = allUsers.find(usr => usr.uid === userId);
      await updateUserProfile(userId, { role: newRole });
      setAllUsers(allUsers.map(usr => usr.uid === userId ? { ...usr, role: newRole } : usr));
      await logAdminAction('update_role', userId, u?.name || 'Unknown User', `Updated user role to "${newRole}"`);
      alert('Haki na jukumu (Role) la mtumiaji limesasishwa.');
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleSubscriptionChange = async (userId: string, newSub: 'free' | 'premium') => {
    if (freshRole !== 'super_admin') {
      alert('Hitilafu: Ni Super Admin pekee anayeruhusiwa kubadilisha kiwango cha uanachama cha watumiaji.');
      return;
    }
    try {
      const u = allUsers.find(usr => usr.uid === userId);
      await updateUserProfile(userId, { subscription: newSub });
      setAllUsers(allUsers.map(usr => usr.uid === userId ? { ...usr, subscription: newSub } : usr));
      await logAdminAction('update_subscription', userId, u?.name || 'Unknown User', `Updated user subscription level to "${newSub}"`);
      alert('Kiwango cha uanachama (Subscription) kimesasishwa.');
    } catch (err) {
      console.error('Failed to update subscription:', err);
    }
  };

  const getFormatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // --- NEW: Dashboard Stats Helpers (Recharts Support) ---
  const getChartData = () => {
    const swahiliMonths = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const dataPoints = [];

    // Prepopulate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      dataPoints.push({
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        name: `${swahiliMonths[d.getMonth()]} ${d.getFullYear()}`,
        uploads: 0,
        registrations: 0,
        cumulativeUsers: 0,
      });
    }

    // Populate uploads
    allDocs.forEach((doc) => {
      if (doc.createdAt) {
        const date = new Date(doc.createdAt);
        const point = dataPoints.find(p => p.monthIndex === date.getMonth() && p.year === date.getFullYear());
        if (point) {
          point.uploads += 1;
        }
      }
    });

    // Populate registrations
    allUsers.forEach((usr) => {
      if (usr.createdAt) {
        const date = new Date(usr.createdAt);
        const point = dataPoints.find(p => p.monthIndex === date.getMonth() && p.year === date.getFullYear());
        if (point) {
          point.registrations += 1;
        }
      }
    });

    // Compute cumulative user growth
    const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
    let initialCount = allUsers.filter(usr => !usr.createdAt || usr.createdAt < windowStart).length;

    dataPoints.forEach((point) => {
      initialCount += point.registrations;
      point.cumulativeUsers = initialCount;
    });

    // Fallback/Demo Data: If there is no data in database, inject realistic trend values
    const hasRealUploads = dataPoints.some(p => p.uploads > 0);
    if (!hasRealUploads) {
      const demoUploads = [14, 22, 19, 35, 41, allDocs.length || 48];
      const demoRegs = [6, 12, 18, 15, 28, allUsers.length || 32];
      let demoCum = 85;

      dataPoints.forEach((point, idx) => {
        point.uploads = demoUploads[idx];
        point.registrations = demoRegs[idx];
        demoCum += point.registrations;
        point.cumulativeUsers = demoCum;
      });
    }

    return dataPoints;
  };

  const getSubjectBreakdown = () => {
    const swahiliSubjects: { [key: string]: string } = {
      'Mathematics': 'Hisabati',
      'Physics': 'Fizikia',
      'Chemistry': 'Kemia',
      'Biology': 'Biolojia',
      'Geography': 'Jiografia',
      'History': 'Historia',
      'English': 'Kiingereza',
      'Kiswahili': 'Kiswahili',
      'Civics': 'Uraia',
    };

    const counts: { [key: string]: number } = {};
    allDocs.forEach((doc) => {
      const sub = (doc as any).subject || 'Mathematics';
      const label = swahiliSubjects[sub] || sub;
      counts[label] = (counts[label] || 0) + 1;
    });

    const data = Object.keys(counts).map(key => ({
      subject: key,
      Nyaraka: counts[key]
    }));

    data.sort((a, b) => b.Nyaraka - a.Nyaraka);
    const topData = data.slice(0, 6);

    if (topData.length === 0) {
      return [
        { subject: 'Hisabati', Nyaraka: 12 },
        { subject: 'Fizikia', Nyaraka: 8 },
        { subject: 'Kemia', Nyaraka: 7 },
        { subject: 'Biolojia', Nyaraka: 9 },
        { subject: 'Jiografia', Nyaraka: 5 },
        { subject: 'Kiswahili', Nyaraka: 11 },
      ];
    }
    return topData;
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setAdminAuthError('Tafadhali jaza barua pepe na nenosiri lako.');
      return;
    }
    setAdminAuthLoading(true);
    setAdminAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail.trim(), adminPassword);
      const freshProfile = await fetchUserProfile(userCredential.user.uid);
      if (freshProfile?.role === 'admin' || freshProfile?.role === 'super_admin') {
        setFreshRole(freshProfile.role);
        setAdminAuthError(null);
      } else {
        setAdminAuthError('Umeingia kikamilifu, lakini akaunti hii haina mamlaka ya msimamizi. Hakikisha unatumia akaunti iliyosajiliwa kama Admin.');
      }
    } catch (err: any) {
      console.error('Direct admin login error:', err);
      let errorMsg = 'Barua pepe au nenosiri si sahihi. Tafadhali jaribu tena.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'Mtumiaji huyu hajapatikana.';
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = 'Nenosiri si sahihi.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Barua pepe si sahihi.';
      }
      setAdminAuthError(errorMsg);
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminLogoutAndRetry = async () => {
    try {
      await auth.signOut();
      setFreshRole(null);
      setAdminEmail('');
      setAdminPassword('');
      setAdminAuthError(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin' && freshRole !== 'admin' && freshRole !== 'super_admin') {
    return (
      <div className="max-w-md mx-auto mt-12 animate-fade-in space-y-6">
        {/* Standalone Admin Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-white relative overflow-hidden">
          {/* Subtle gradient light indicator */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
              <ShieldAlert size={32} />
            </div>
            <h2 className="font-sans font-black text-2xl uppercase tracking-wider text-rose-500">Msimamizi Pekee</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">ScribdShare Admin Portal</p>
          </div>

          <p className="text-xs text-slate-300 text-center leading-relaxed font-semibold">
            Huu ni ukurasa maalum wa wasimamizi (Admin Panel) unaojitegemea. Tafadhali ingiza barua pepe na nenosiri lako la usimamizi ili kuendelea.
          </p>

          {adminAuthError && (
            <div className="bg-rose-950/40 border border-rose-900 rounded-2xl p-4 text-xs text-rose-300 font-semibold flex gap-2.5 items-start">
              <XCircle size={16} className="shrink-0 mt-0.5" />
              <p>{adminAuthError}</p>
            </div>
          )}

          {auth.currentUser ? (
            /* Logged in but not admin/super_admin */
            <div className="space-y-4">
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl text-xs space-y-1">
                <p className="text-slate-400 font-semibold">Akaunti iliyoingia kwa sasa:</p>
                <p className="font-bold text-white truncate">{auth.currentUser.email}</p>
                <p className="text-[10px] text-amber-500 font-extrabold uppercase mt-1">Haina Haki za Admin</p>
              </div>
              <button
                onClick={handleAdminLogoutAndRetry}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700"
              >
                Ingia na Akaunti Nyingine
              </button>
            </div>
          ) : (
            /* Direct Admin Login Form */
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  Barua Pepe ya Admin
                </label>
                <input
                  type="email"
                  required
                  placeholder="lupanulla.co.tz@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold text-white placeholder-slate-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Lock size={12} className="text-slate-400" />
                  Nenosiri la Siri
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold text-white placeholder-slate-600 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black text-xs py-3.5 rounded-xl transition-all uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {adminAuthLoading ? 'Inathibitisha...' : 'Kuingia kama Msimamizi'}
              </button>
            </form>
          )}

          <div className="border-t border-slate-850 pt-4 text-center">
            <button
              onClick={() => onNavigate('portal')}
              className="text-slate-400 hover:text-white font-bold text-xs transition-colors"
            >
              &larr; Rudi kwenye Maktaba Kuu
            </button>
          </div>
        </div>

        {/* Dynamic Support/Contact Badge */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-1">
          <p className="text-[10px] text-slate-500 font-semibold">
            Unahitaji msaada wa kiufundi au umesahau nenosiri lako la usimamizi?
          </p>
          <p className="text-xs font-bold text-slate-700">
            Wasiliana na msaada: <a href="mailto:lupanulla.co.tz@hotmail.com" className="text-rose-600 hover:underline">lupanulla.co.tz@hotmail.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-view" className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-sans font-extrabold text-gray-900 flex items-center gap-2">
              <ShieldAlert size={28} className="text-rose-600" />
              ScribdShare Admin Console
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Msimamizi: {userProfile.name} ({freshRole === 'super_admin' ? 'Super Admin' : 'Admin'}) • Idhinisha faili, dhibiti watumiaji, na tazama shajara za matendo.
            </p>
          </div>
          {freshRole === 'super_admin' && (
            <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-widest text-rose-650 bg-rose-50 border border-rose-100 rounded-full px-3 py-1 flex items-center gap-1">
              <Crown size={12} className="text-rose-500 animate-pulse" />
              Super Admin Mode Enabled
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'approvals'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock size={16} />
          Uhakiki wa Faili
          {pendingDocs.length > 0 && (
            <span className="bg-amber-400 text-amber-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              {pendingDocs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileCheck size={16} />
          Nyaraka Zote
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users size={16} />
          Kusimamia Watumiaji
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BarChart3 size={16} />
          Uchambuzi (Analytics)
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'verification'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Award size={16} />
          Uhakiki &amp; Vyeti
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'news'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Newspaper size={16} />
          Kusimamia Habari
          {dbNews.filter(n => n.status === 'pending').length > 0 && (
            <span className="bg-amber-400 text-amber-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              {dbNews.filter(n => n.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'resources'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Library size={16} />
          Uhakiki wa Vyanzo
          {dbResources.filter(r => !r.isVerified).length > 0 && (
            <span className="bg-amber-400 text-amber-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              {dbResources.filter(r => !r.isVerified).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'videos'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tv size={16} />
          Kusimamia Video
        </button>
        <button
          onClick={() => setActiveTab('adsense')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'adsense'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <DollarSign size={16} />
          Google AdSense
        </button>
        <button
          onClick={() => setActiveTab('activity_logs')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'activity_logs'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock size={16} />
          Shajara za Matendo (Audit Logs)
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag size={16} />
          Duka la Vitabu (Bookstore)
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MessageSquare size={16} />
          Maoni ya Watumiaji
          {dbFeedbacks.filter(f => f.status === 'new').length > 0 && (
            <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              {dbFeedbacks.filter(f => f.status === 'new').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Cpu size={16} />
          Huduma za Nje (Integrations)
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400">Inapakia rasilimali...</p>
        </div>
      ) : (
        /* Content rendering depending on current tab */
        <div className="space-y-6">
          
          {/* TAB 1: FILE APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-sans font-extrabold text-gray-900">Inasubiri Idhini</h2>
              {pendingDocs.length === 0 ? (
                <div className="text-center py-16 text-gray-400 space-y-2">
                  <CheckCircle size={32} className="mx-auto text-emerald-500" />
                  <p className="text-sm font-bold">Kazi yote imekamilika!</p>
                  <p className="text-xs">Hakuna nyaraka mpya zinazosubiri kufanyiwa mapitio kwa sasa.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50 rounded-lg">
                      <tr>
                        <th scope="col" className="px-4 py-3">Nyaraka</th>
                        <th scope="col" className="px-4 py-3">Kundi</th>
                        <th scope="col" className="px-4 py-3">Mwandishi</th>
                        <th scope="col" className="px-4 py-3">Tarehe ya Kupakiwa</th>
                        <th scope="col" className="px-4 py-3 text-right">Vitendo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex flex-col cursor-pointer" onClick={() => onNavigate('reader', doc.id)}>
                              <p className="font-extrabold text-gray-800 hover:text-indigo-600 hover:underline">{doc.title}</p>
                              <p className="text-[10px] text-gray-400 line-clamp-1">{doc.description || 'No description provided'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                              {doc.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-gray-600">{doc.uploadedByName}</td>
                          <td className="px-4 py-4 text-xs font-semibold text-gray-500">{getFormatDate(doc.createdAt)}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprove(doc.id)}
                                disabled={actioningId === doc.id}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-all flex items-center gap-0.5"
                              >
                                <CheckCircle size={12} />
                                Idhinisha
                              </button>
                              <button
                                onClick={() => handleReject(doc.id)}
                                disabled={actioningId === doc.id}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition-all flex items-center gap-0.5"
                              >
                                <XCircle size={12} />
                                Kataa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="text-lg font-sans font-extrabold text-gray-900">Catalog ya Nyaraka Zote</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Ongeza, hariri au futa notisi, karatasi za mitihani, na vitabu kutoka Maktaba Kuu.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConfigManager(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-xl transition-all shadow-sm"
                  >
                    <Sliders size={14} />
                    Dhibiti Mipangilio
                  </button>
                  <button
                    onClick={() => {
                      setEditingDoc(null);
                      setDocTitle('');
                      setDocDescription('');
                      setDocCategory('Notes');
                      setDocTagsInput('');
                      setDocDriveUrl('');
                      setDocFileId('');
                      setDocThumbnailUrl('');
                      setDocSubject(libConfig.subjects[0] || 'Mathematics');
                      setDocEducationLevel('O-Level');
                      setDocClassLevel(libConfig.classes[0] || 'Form 1');
                      setDocYear(2026);
                      setDocRegion('');
                      setDocStatus('approved');
                      setIsDocFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                  >
                    <PlusCircle size={14} />
                    Ongeza Nyaraka Mpya
                  </button>
                </div>
              </div>

              <UploadGuideWidget />

              {/* Filtering and search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Tafuta nyaraka kwa jina, somo, kundi, au maelezo..."
                  value={adminDocSearch}
                  onChange={(e) => setAdminDocSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:border-indigo-500 rounded-2xl outline-none transition-all shadow-inner font-semibold"
                />
              </div>

              {/* Document table catalog */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-4 py-3.5">Kichwa na Habari</th>
                      <th scope="col" className="px-4 py-3.5">Somo & Kidato</th>
                      <th scope="col" className="px-4 py-3.5">Category</th>
                      <th scope="col" className="px-4 py-3.5">Uandishi</th>
                      <th scope="col" className="px-4 py-3.5">Views</th>
                      <th scope="col" className="px-4 py-3.5">Hali</th>
                      <th scope="col" className="px-4 py-3.5 text-right">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allDocs.filter(d => 
                      d.title.toLowerCase().includes(adminDocSearch.toLowerCase()) ||
                      (d.description || '').toLowerCase().includes(adminDocSearch.toLowerCase()) ||
                      (d.category || '').toLowerCase().includes(adminDocSearch.toLowerCase()) ||
                      ((d as any).subject || '').toLowerCase().includes(adminDocSearch.toLowerCase())
                    ).map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col cursor-pointer" onClick={() => onNavigate('reader', doc.id)}>
                            <p className="font-extrabold text-gray-800 hover:text-indigo-600 hover:underline">{doc.title}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {doc.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700">{(doc as any).subject || 'Mathematics'}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{(doc as any).classLevel || 'Form 1'} ({(doc as any).educationLevel || 'O-Level'})</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">{doc.uploadedByName}</td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-700">{doc.views.toLocaleString()}</td>
                        <td className="px-4 py-4 text-xs font-bold">
                          {doc.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">Approved</span>
                          ) : doc.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5">Pending</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-0.5">Rejected</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditDoc(doc)}
                              className="p-1.5 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-all"
                              title="Hariri Taarifa"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id, doc.fileId, doc.title)}
                              disabled={actioningId === doc.id}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                              title="Futa Nyaraka"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DOCUMENT FORM MODAL */}
              {isDocFormOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in animate-duration-150">
                  <div className="bg-white border border-gray-100 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
                    <div className="flex justify-between items-center bg-indigo-600 px-6 py-4 text-white">
                      <h3 className="font-sans font-extrabold text-base">
                        {editingDoc ? 'Hariri Maelezo ya Nyaraka' : 'Pakia Nyaraka Mpya Maktaba'}
                      </h3>
                      <button onClick={() => setIsDocFormOpen(false)} className="text-white/85 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveDocument} className="p-6 overflow-y-auto max-h-[70vh] space-y-4 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-gray-600">Jina la Nyaraka (Title) *</label>
                          <input
                            type="text"
                            required
                            placeholder="Mfano: Physics Form 1 Topic 1 - Introduction to Physics"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-gray-600">Maelezo Mafupi (Description)</label>
                          <textarea
                            rows={3}
                            placeholder="Maelezo kuhusu notisi, mtihani au kitabu hiki..."
                            value={docDescription}
                            onChange={(e) => setDocDescription(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Aina ya Nyaraka (Category) *</label>
                          <select
                            value={docCategory}
                            onChange={(e) => setDocCategory(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800 bg-white"
                          >
                            {libConfig.categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Somo (Subject) *</label>
                          <select
                            value={docSubject}
                            onChange={(e) => setDocSubject(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800 bg-white"
                          >
                            {libConfig.subjects.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Ngazi ya Elimu (Education Level) *</label>
                          <select
                            value={docEducationLevel}
                            onChange={(e) => setDocEducationLevel(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800 bg-white"
                          >
                            <option value="Primary">Primary (Shule ya Msingi)</option>
                            <option value="O-Level">O-Level (Kidato cha 1-4)</option>
                            <option value="A-Level">A-Level (Kidato cha 5-6)</option>
                            <option value="University">University & College</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Darasa/Kidato (Class Level) *</label>
                          <select
                            value={docClassLevel}
                            onChange={(e) => setDocClassLevel(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800 bg-white"
                          >
                            {libConfig.classes.map(cls => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Mwaka (Year)</label>
                          <input
                            type="number"
                            value={docYear}
                            onChange={(e) => setDocYear(Number(e.target.value) || 2026)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Mkoa/Lafudhi (Region)</label>
                          <input
                            type="text"
                            placeholder="Mfano: Dar es Salaam, Arusha..."
                            value={docRegion}
                            onChange={(e) => setDocRegion(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-gray-600">Google Drive / File URL *</label>
                          <input
                            type="url"
                            required
                            placeholder="https://drive.google.com/... au kiungo mbadala cha faili"
                            value={docDriveUrl}
                            onChange={(e) => setDocDriveUrl(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Unique File ID (Optional)</label>
                          <input
                            type="text"
                            placeholder="Inazalishwa kiotomatiki isipojazwa"
                            value={docFileId}
                            onChange={(e) => setDocFileId(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Picha ya Kifuniko (Thumbnail URL)</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={docThumbnailUrl}
                            onChange={(e) => setDocThumbnailUrl(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Tags / Keywords (Separated by commas)</label>
                          <input
                            type="text"
                            placeholder="physics, form1, necta"
                            value={docTagsInput}
                            onChange={(e) => setDocTagsInput(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Hali ya Nyaraka (Status)</label>
                          <select
                            value={docStatus}
                            onChange={(e) => setDocStatus(e.target.value as any)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800 bg-white"
                          >
                            <option value="approved">Approved & Published (Live)</option>
                            <option value="pending">Pending Review</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={() => setIsDocFormOpen(false)}
                          className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                        >
                          Ghairi
                        </button>
                        <button
                          type="submit"
                          disabled={isDocSaving}
                          className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
                        >
                          {isDocSaving ? 'Inahifadhi...' : 'Hifadhi Nyaraka'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* CONFIGURATION MANAGER MODAL */}
              {showConfigManager && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in animate-duration-150">
                  <div className="bg-white border border-gray-100 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
                    <div className="flex justify-between items-center bg-slate-950 px-6 py-4 text-white">
                      <h3 className="font-sans font-extrabold text-sm tracking-wider uppercase">
                        Sanidi Masomo, Madarasa na Kundi za Maktaba
                      </h3>
                      <button onClick={() => setShowConfigManager(false)} className="text-white/85 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-left">
                      {/* SECTION 1: SUBJECTS */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-1">
                          Masomo ya Masomo ({libConfig.subjects.length})
                        </h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ongeza somo jipya, mfano: Kiswahili"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                            className="flex-grow px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                          <button
                            onClick={handleAddSubject}
                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                          >
                            Ongeza
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {libConfig.subjects.map(sub => (
                            <span key={sub} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/50 rounded-lg pl-2.5 pr-1.5 py-1 text-xs font-bold text-indigo-700">
                              {sub}
                              <button onClick={() => handleRemoveSubject(sub)} className="p-0.5 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 2: CLASSES */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-1">
                          Madarasa na Kidato ({libConfig.classes.length})
                        </h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ongeza darasa au kidato, mfano: Form 5"
                            value={newClass}
                            onChange={(e) => setNewClass(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                            className="flex-grow px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                          <button
                            onClick={handleAddClass}
                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                          >
                            Ongeza
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {libConfig.classes.map(cls => (
                            <span key={cls} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/50 rounded-lg pl-2.5 pr-1.5 py-1 text-xs font-bold text-indigo-700">
                              {cls}
                              <button onClick={() => handleRemoveClass(cls)} className="p-0.5 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 3: CATEGORIES */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-1">
                          Makundi / Categories ({libConfig.categories.length})
                        </h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ongeza kundi la nyaraka, mfano: Vitabu vya Ziada"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            className="flex-grow px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none font-semibold text-gray-800"
                          />
                          <button
                            onClick={handleAddCategory}
                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                          >
                            Ongeza
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {libConfig.categories.map(cat => (
                            <span key={cat} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/50 rounded-lg pl-2.5 pr-1.5 py-1 text-xs font-bold text-indigo-700">
                              {cat}
                              <button onClick={() => handleRemoveCategory(cat)} className="p-0.5 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end bg-slate-50 px-6 py-4 border-t border-slate-100">
                      <button
                        onClick={() => setShowConfigManager(false)}
                        className="px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all shadow-sm"
                      >
                        Kamilisha na Funga
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-50 pb-4">
                <div>
                  <h2 className="text-lg font-sans font-extrabold text-gray-900">Wasajiliwa na Haki zao</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Dhibiti haki na viwango vya uanachama pamoja na kusimamisha watumiaji.</p>
                </div>
                {freshRole !== 'super_admin' && (
                  <span className="text-[10px] font-bold text-amber-650 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1">
                    ⚠️ Udhibiti wa watumiaji unahitaji mamlaka ya Super Admin.
                  </span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Mtumiaji</th>
                      <th scope="col" className="px-4 py-3">Role (Haki)</th>
                      <th scope="col" className="px-4 py-3">Uanachama (Tier)</th>
                      <th scope="col" className="px-4 py-3">Sajili Tarehe</th>
                      <th scope="col" className="px-4 py-3 text-right">Hali na Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-450 italic">
                          No data available yet
                        </td>
                      </tr>
                    ) : (
                      allUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <p className="font-extrabold text-gray-800">{u.name}</p>
                              <p className="text-[10px] text-gray-400">{u.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {u.role === 'super_admin' && u.uid === userProfile?.uid ? (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-md">
                                Super Admin (Wewe)
                              </span>
                            ) : (
                              <select
                                value={u.role}
                                disabled={freshRole !== 'super_admin'}
                                onChange={(e) => handleRoleChange(u.uid, e.target.value as any)}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-1 text-xs text-gray-700 font-semibold cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
                              >
                                <option value="student">Student</option>
                                <option value="author">Author</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={u.subscription}
                              disabled={freshRole !== 'super_admin'}
                              onChange={(e) => handleSubscriptionChange(u.uid, e.target.value as any)}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-1 text-xs text-gray-700 font-semibold cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
                            >
                              <option value="free">Free</option>
                              <option value="premium">Premium</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                            {u.createdAt ? getFormatDate(u.createdAt) : '—'}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.isSuspended ? (
                                <>
                                  <span className="text-[9px] font-black tracking-wider uppercase text-red-600 bg-red-50 border border-red-100 rounded-md px-1.5 py-0.5 cursor-help" title={`Sababu: ${u.suspensionReason}`}>
                                    Suspended
                                  </span>
                                  {freshRole === 'super_admin' && (
                                    <button
                                      onClick={() => handleToggleSuspension(u.uid)}
                                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                                    >
                                      Rejesha
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="text-[9px] font-black tracking-wider uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5">
                                    Active
                                  </span>
                                  {freshRole === 'super_admin' && u.uid !== userProfile?.uid && (
                                    <button
                                      onClick={() => handleToggleSuspension(u.uid)}
                                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                                    >
                                      Zuia
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics widgets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Watumiaji Jumla</p>
                  <p className="text-3xl font-sans font-extrabold text-gray-900">{allUsers.length}</p>
                  <span className="text-[10px] font-semibold text-indigo-600 flex items-center gap-0.5 leading-none">
                    <UserPlus size={10} />
                    Registered users
                  </span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nyaraka Zote</p>
                  <p className="text-3xl font-sans font-extrabold text-gray-900">{allDocs.length}</p>
                  <span className="text-[10px] font-semibold text-gray-400 leading-none">
                    Files on drive catalog
                  </span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jumla ya Views</p>
                  <p className="text-3xl font-sans font-extrabold text-gray-900">
                    {allDocs.reduce((sum, d) => sum + (d.views || 0), 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 leading-none">
                    <Eye size={10} />
                    Overall platform views
                  </span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Tiers</p>
                  <p className="text-3xl font-sans font-extrabold text-amber-500">
                    {allUsers.filter(u => u.subscription === 'premium').length}
                  </p>
                  <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5 leading-none">
                    <Crown size={10} className="fill-amber-50" />
                    Paid members count
                  </span>
                </div>
              </div>

              {/* --- NEW: DASHBOARD STATS SECTION (RECHARTS) --- */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 sm:p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-sans font-extrabold text-slate-900">Takwimu za Maktaba (Dashboard Stats)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Uchambuzi wa shughuli za upakiaji nyaraka, mada za masomo na ukuaji wa jamii yetu katika kipindi cha miezi 6 iliyopita.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CHART 1: USER REGISTRATION & CUMULATIVE GROWTH */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800">Ukuaji wa Watumiaji</h3>
                        <p className="text-[10px] text-slate-400">Jumla ya wanachama waliosajiliwa kwa mwezi</p>
                      </div>
                      <span className="text-[10px] bg-indigo-50 border border-indigo-100 font-extrabold text-indigo-650 rounded-full px-2.5 py-1">
                        Ukuaji wa Jumla
                      </span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={getChartData()}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle" 
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}
                          />
                          <Area 
                            type="monotone" 
                            name="Watumiaji Wapya" 
                            dataKey="registrations" 
                            stroke="#818cf8" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#userGrowthGrad)" 
                          />
                          <Area 
                            type="monotone" 
                            name="Ukuaji wa Kujumlisha" 
                            dataKey="cumulativeUsers" 
                            stroke="#6366f1" 
                            strokeWidth={3.5}
                            fill="none" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 2: DOCUMENT UPLOADS PER MONTH */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800">Kasi ya Upakiaji Nyaraka</h3>
                        <p className="text-[10px] text-slate-400">Idadi ya vitabu, notisi na mitihani iliyoongezwa kwa mwezi</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-100 font-extrabold text-emerald-600 rounded-full px-2.5 py-1">
                        Shughuli ya Maktaba
                      </span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getChartData()}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle" 
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}
                          />
                          <Bar 
                            name="Nyaraka Mpya" 
                            dataKey="uploads" 
                            fill="#10b981" 
                            radius={[6, 6, 0, 0]} 
                            maxBarSize={45}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 3: UPLOADS BY SUBJECT (FULL WIDTH OR IN GRID) */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800">Mchango wa Masomo (Uploads by Subject)</h3>
                        <p className="text-[10px] text-slate-400">Mgawanyiko wa nyaraka zilizopakiwa kulingana na masomo makuu</p>
                      </div>
                      <span className="text-[10px] bg-purple-50 border border-purple-100 font-extrabold text-purple-650 rounded-full px-2.5 py-1">
                        Kundi la Masomo
                      </span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getSubjectBreakdown()}
                          layout="vertical"
                          margin={{ top: 10, right: 15, left: 15, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                          <XAxis 
                            type="number" 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="subject" 
                            stroke="#475569" 
                            fontSize={11} 
                            fontWeight="bold"
                            tickLine={false} 
                            axisLine={false}
                            width={80}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Bar 
                            name="Nyaraka Zilizosajiliwa" 
                            dataKey="Nyaraka" 
                            fill="#8b5cf6" 
                            radius={[0, 6, 6, 0]} 
                            maxBarSize={25}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status breakdown charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hali ya Nyaraka (Document Status Distribution)</h3>
                  
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                        <span>Approved ({allDocs.filter(d => d.status === 'approved').length})</span>
                        <span>
                          {allDocs.length > 0 
                            ? Math.round((allDocs.filter(d => d.status === 'approved').length / allDocs.length) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${allDocs.length > 0 ? (allDocs.filter(d => d.status === 'approved').length / allDocs.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                        <span>Pending Review ({allDocs.filter(d => d.status === 'pending').length})</span>
                        <span>
                          {allDocs.length > 0 
                            ? Math.round((allDocs.filter(d => d.status === 'pending').length / allDocs.length) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className="bg-amber-400 h-full rounded-full" 
                          style={{ width: `${allDocs.length > 0 ? (allDocs.filter(d => d.status === 'pending').length / allDocs.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                        <span>Rejected ({allDocs.filter(d => d.status === 'rejected').length})</span>
                        <span>
                          {allDocs.length > 0 
                            ? Math.round((allDocs.filter(d => d.status === 'rejected').length / allDocs.length) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className="bg-red-500 h-full rounded-full" 
                          style={{ width: `${allDocs.length > 0 ? (allDocs.filter(d => d.status === 'rejected').length / allDocs.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mgawanyiko wa Roles (User Role Distribution)</h3>
                  
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                        <span>Students ({allUsers.filter(u => u.role === 'student').length})</span>
                        <span>
                          {allUsers.length > 0 
                            ? Math.round((allUsers.filter(u => u.role === 'student').length / allUsers.length) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${allUsers.length > 0 ? (allUsers.filter(u => u.role === 'student').length / allUsers.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                        <span>Authors ({allUsers.filter(u => u.role === 'author').length})</span>
                        <span>
                          {allUsers.length > 0 
                            ? Math.round((allUsers.filter(u => u.role === 'author').length / allUsers.length) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className="bg-teal-400 h-full rounded-full" 
                          style={{ width: `${allUsers.length > 0 ? (allUsers.filter(u => u.role === 'author').length / allUsers.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                        <span>Admins ({allUsers.filter(u => u.role === 'admin').length})</span>
                        <span>
                          {allUsers.length > 0 
                            ? Math.round((allUsers.filter(u => u.role === 'admin').length / allUsers.length) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className="bg-rose-500 h-full rounded-full" 
                          style={{ width: `${allUsers.length > 0 ? (allUsers.filter(u => u.role === 'admin').length / allUsers.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACADEMIC VERIFICATION & CERTIFICATE ISSUANCE */}
          {activeTab === 'verification' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Left Column: Management Forms */}
              <div className="space-y-6">
                
                {/* Issue Certificate Form */}
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                      <Award size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans font-extrabold text-gray-900 text-sm sm:text-base">Toa Cheti Kipya cha Ufaulu</h3>
                      <p className="text-xs text-gray-400">Sajili cheti kipya kwenye mfumo ili mwanafunzi aweze kukihakiki</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddCertificateSubmit} className="space-y-3 text-xs text-gray-700">
                    <div>
                      <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Chagua Mtumiaji Aliyesajiliwa</label>
                      <select 
                        value={selectedStudentUid}
                        onChange={(e) => handleSelectStudentChange(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">-- Chagua Mwanafunzi --</option>
                        {allUsers.map(u => (
                          <option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Jina la Mwanafunzi (Custom)</label>
                        <input 
                          type="text"
                          required
                          value={certStudentName}
                          onChange={(e) => setCertStudentName(e.target.value)}
                          placeholder="Mwanafunzi Lupanulla"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Barua Pepe ya Mwanafunzi</label>
                        <input 
                          type="email"
                          value={certStudentEmail}
                          onChange={(e) => setCertStudentEmail(e.target.value)}
                          placeholder="lupanulla.co.tz@gmail.com"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Jina la Kozi/Mafunzo (Course Name)</label>
                      <input 
                        type="text"
                        required
                        value={certCourse}
                        onChange={(e) => setCertCourse(e.target.value)}
                        placeholder="Form 4 Mathematics National Mock Preparation Course"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Somo (Subject)</label>
                        <select 
                          value={certSubject}
                          onChange={(e) => setCertSubject(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="English">English</option>
                          <option value="Geography">Geography</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Alama (Score)</label>
                        <input 
                          type="number"
                          required
                          value={certScore}
                          onChange={(e) => setCertScore(Number(e.target.value))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Daraja (Grade)</label>
                        <input 
                          type="text"
                          required
                          value={certGrade}
                          onChange={(e) => setCertGrade(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Nambari ya Uhakiki (Verification Code)</label>
                        <input 
                          type="text"
                          required
                          value={certCode}
                          onChange={(e) => setCertCode(e.target.value)}
                          placeholder="LUP-MATH-2026-9812"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono tracking-widest uppercase"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleGenerateCertCode(certSubject)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs"
                      >
                        Tengeneza Code
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={certIsSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {certIsSubmitting && <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>}
                      Sajili Cheti kwenye Mfumo 🎓
                    </button>
                  </form>
                </div>

                {/* Issue Exam Result Form */}
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans font-extrabold text-gray-900 text-sm sm:text-base">Sajili Matokeo ya Mtihani (Exam Results)</h3>
                      <p className="text-xs text-gray-400">Pakia matokeo rasmi ya NECTA Mock au Mitihani ya Kila Mwezi</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddExamResultSubmit} className="space-y-3.5 text-xs text-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Mwanafunzi (Student Name)</label>
                        <input 
                          type="text"
                          required
                          value={resStudentName}
                          onChange={(e) => setResStudentName(e.target.value)}
                          placeholder="Mwanafunzi Lupanulla"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Namba ya Mtihani (Candidate Code)</label>
                        <input 
                          type="text"
                          required
                          value={resCandidateCode}
                          onChange={(e) => setResCandidateCode(e.target.value)}
                          placeholder="S0101/0001/2026"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none font-mono tracking-wider uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Aina ya Mtihani</label>
                        <select 
                          value={resExamType}
                          onChange={(e) => setResExamType(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                        >
                          <option value="Mock">Mock Exam</option>
                          <option value="Terminal">Terminal Exam</option>
                          <option value="Necta Prep">Necta Prep</option>
                          <option value="Monthly Test">Monthly Test</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Darasa (Level)</label>
                        <input 
                          type="text"
                          required
                          value={resLevel}
                          onChange={(e) => setResLevel(e.target.value)}
                          placeholder="Form 4"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Mwaka (Year)</label>
                        <input 
                          type="number"
                          required
                          value={resYear}
                          onChange={(e) => setResYear(Number(e.target.value))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Divisheni Kuu</label>
                        <select 
                          value={resDivision}
                          onChange={(e) => setResDivision(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none"
                        >
                          <option value="Division I">Division I</option>
                          <option value="Division II">Division II</option>
                          <option value="Division III">Division III</option>
                          <option value="Division IV">Division IV</option>
                          <option value="Division 0">Division 0</option>
                        </select>
                      </div>
                    </div>

                    {/* Subjects and Grades Builder */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
                      <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span>Mada na Alama (Subjects List)</span>
                        <span className="text-indigo-600">Jumla ya masomo: {resSubjects.length}</span>
                      </h4>

                      {/* Render Current Added Subjects */}
                      {resSubjects.length === 0 ? (
                        <p className="text-slate-400 italic text-[11px] text-center">Hakuna masomo yaliyoongezwa bado.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                          {resSubjects.map((sub, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white border border-slate-200/60 rounded-xl p-2 shadow-sm">
                              <span className="font-extrabold text-[11px] text-slate-700">{sub.subject}</span>
                              <div className="flex items-center gap-3">
                                <span className="bg-indigo-50 text-indigo-700 font-black text-[10px] px-2 py-0.5 rounded-md">Daraja: {sub.grade} ({sub.score}%)</span>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveSubjectRow(idx)}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  Futa
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Subject Row controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/40">
                        <div>
                          <input 
                            type="text"
                            value={resSubjectName}
                            onChange={(e) => setResSubjectName(e.target.value)}
                            placeholder="Basic Mathematics"
                            className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={resSubjectGrade}
                            onChange={(e) => setResSubjectGrade(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-2 py-1.5 bg-white text-xs"
                          >
                            <option value="A">Grade A</option>
                            <option value="B">Grade B</option>
                            <option value="C">Grade C</option>
                            <option value="D">Grade D</option>
                            <option value="F">Grade F</option>
                          </select>
                          <input 
                            type="number"
                            value={resSubjectScore}
                            onChange={(e) => setResSubjectScore(Number(e.target.value))}
                            placeholder="Alama %"
                            className="w-full border border-gray-200 rounded-xl px-2 py-1.5 bg-white text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSubjectRow}
                          className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold rounded-xl py-1.5 transition-all text-[11px] uppercase tracking-wide"
                        >
                          Weka Somo hili
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={resIsSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {resIsSubmitting && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                      Sajili Matokeo Mapya 📝
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column: Registries Lists */}
              <div className="space-y-6">
                
                {/* Certificates Registry */}
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <QrCode size={18} className="text-amber-500" />
                      Daftari la Vyeti Vyote vilivyotolewa
                    </h3>
                    <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      Vyeti: {dbCerts.length}
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 text-gray-400" size={14} />
                    <input 
                      type="text"
                      value={certSearch}
                      onChange={(e) => setCertSearch(e.target.value)}
                      placeholder="Tafuta kwa Jina au Verification Code..."
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs bg-slate-50 focus:outline-none"
                    />
                  </div>

                  {dbCerts.length === 0 ? (
                    <p className="text-gray-400 text-xs italic text-center py-6">Hakuna vyeti vilivyosajiliwa bado.</p>
                  ) : (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {dbCerts.filter(c => 
                        c.studentName.toLowerCase().includes(certSearch.toLowerCase()) || 
                        c.verificationCode.toLowerCase().includes(certSearch.toLowerCase())
                      ).map(c => (
                        <div key={c.id} className="border border-gray-100 rounded-2xl p-3.5 flex justify-between items-start gap-4 hover:border-amber-300 transition-all bg-amber-50/5 text-xs">
                          <div className="space-y-1">
                            <p className="font-sans font-black text-slate-800 uppercase text-[11px] tracking-tight">{c.studentName}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">{c.courseName}</p>
                            <div className="flex gap-2 pt-1 font-mono text-[9px] text-amber-700 font-extrabold uppercase">
                              <span>CODE: {c.verificationCode}</span>
                              <span>•</span>
                              <span>Somo: {c.subject} ({c.score}%)</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteCertificateClick(c.id!, c.verificationCode)}
                            className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                            title="Futa Cheti"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exam Results Registry */}
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <GraduationCap size={18} className="text-indigo-500" />
                      Daftari la Matokeo ya Mitihani
                    </h3>
                    <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      Matokeo: {dbResults.length}
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 text-gray-400" size={14} />
                    <input 
                      type="text"
                      value={resultSearch}
                      onChange={(e) => setResultSearch(e.target.value)}
                      placeholder="Tafuta kwa Candidate Code au Jina..."
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs bg-slate-50 focus:outline-none"
                    />
                  </div>

                  {dbResults.length === 0 ? (
                    <p className="text-gray-400 text-xs italic text-center py-6">Hakuna matokeo yaliyosajiliwa bado.</p>
                  ) : (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {dbResults.filter(r => 
                        r.studentName.toLowerCase().includes(resultSearch.toLowerCase()) || 
                        r.candidateCode.toLowerCase().includes(resultSearch.toLowerCase())
                      ).map(r => (
                        <div key={r.id} className="border border-gray-100 rounded-2xl p-3.5 flex justify-between items-start gap-4 hover:border-indigo-300 transition-all bg-indigo-50/5 text-xs">
                          <div className="space-y-1">
                            <p className="font-sans font-black text-slate-800 uppercase text-[11px] tracking-tight">{r.studentName}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-none">Namba: {r.candidateCode} • {r.examType} ({r.year})</p>
                            <div className="flex gap-2 pt-1.5">
                              <span className="bg-indigo-50 text-indigo-700 font-black text-[9px] px-1.5 py-0.5 rounded-md">{r.division} (GPA: {r.gpa})</span>
                              <span className="text-slate-400 text-[9px] font-medium">Masomo: {r.subjects.map(s => `${s.subject}: ${s.grade}`).join(', ')}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteExamResultClick(r.id!, r.candidateCode)}
                            className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                            title="Futa Matokeo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: GOOGLE ADSENSE INTEGRATION CONTROLLER */}
          {activeTab === 'adsense' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Left Column: Configuration & Simulated Revenue console */}
              <div className="space-y-6">
                
                {/* Configuration Panel */}
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                      <Settings size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans font-extrabold text-gray-900 text-sm sm:text-base">Usanidi wa Google AdSense</h3>
                      <p className="text-xs text-gray-400">Dhibiti nambari ya mchapishaji (AdSense ID) na uwashe matangazo kwenye jukwaa</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAdsenseSettings} className="space-y-4 text-xs text-gray-700">
                    <div>
                      <label className="block text-gray-400 font-extrabold uppercase text-[9px] mb-1">Google Publisher ID (ca-pub-xxxx)</label>
                      <input 
                        type="text"
                        required
                        value={adsensePubId}
                        onChange={(e) => setAdsensePubId(e.target.value)}
                        placeholder="ca-pub-9876543210123456"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs text-gray-800"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                        Nambari hii ya kipekee itatumiwa kuunda na kuunganisha matangazo yote ya `<ins className="adsbygoogle"></ins>` katika kurasa za masomo, maktaba na matokeo.
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-tight">Ruhusu Matangazo ya Moja kwa Moja</span>
                        <p className="text-[10px] text-slate-400">Ruhusu matangazo kuanza kurushwa na kuonekana kwa wasomaji wote</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={adsenseActive}
                        onChange={(e) => setAdsenseActive(e.target.checked)}
                        className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md transition-all"
                    >
                      Hifadhi na Tuma Mabadiliko
                    </button>
                  </form>
                </div>

                {/* Simulated Revenue Console */}
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <TrendingUp size={18} className="text-emerald-500" />
                      Dashibodi ya Mapato (AdSense Reports)
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      Mwezi Huu
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    Tathmini ya mfanano wa moja kwa moja wa utendaji wa matangazo yako tangu kufunguliwa kwa Lupanulla Elimu Hub. Bonyeza kitufe hapa chini ili kufanyia jaribio la kubofya tangazo.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
                      <span className="text-gray-400 uppercase font-extrabold text-[9px] tracking-wider block mb-1">Estimated Earnings</span>
                      <span className="font-mono text-lg sm:text-xl font-black text-emerald-600">${adsenseEarnings.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
                      <span className="text-gray-400 uppercase font-extrabold text-[9px] tracking-wider block mb-1">Ad Impressions</span>
                      <span className="font-mono text-lg sm:text-xl font-black text-indigo-600">{adsenseImpressions.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
                      <span className="text-gray-400 uppercase font-extrabold text-[9px] tracking-wider block mb-1">Ad Clicks</span>
                      <span className="font-mono text-lg sm:text-xl font-black text-amber-600">{adsenseClicks}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
                      <span className="text-gray-400 uppercase font-extrabold text-[9px] tracking-wider block mb-1">Page CTR</span>
                      <span className="font-mono text-lg sm:text-xl font-black text-rose-500">
                        {adsenseImpressions > 0 ? ((adsenseClicks / adsenseImpressions) * 100).toFixed(2) : '0.00'}%
                      </span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleSimulateAdClick}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign size={15} />
                    Fanya Simulizi ya Kubofya Tangazo (Simulate Click)
                  </button>
                </div>

              </div>

              {/* Right Column: Live Layout Preview */}
              <div className="space-y-6">
                
                {/* Live Layout Preview Card */}
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="font-sans font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                      <Megaphone size={18} className="text-indigo-500" />
                      Hakikisho la Matangazo (Ad unit Sandbox Preview)
                    </h3>
                  </div>

                  <p className="text-xs text-gray-400 leading-normal">
                    Hapa ndivyo matangazo ya Google AdSense yanavyojipanga kote kwenye maktaba na kurasa za masomo. Matangazo haya yanalingana na mada za kitaaluma ili kuongeza thamani.
                  </p>

                  <div className="border border-dashed border-gray-300 rounded-3xl p-6 bg-slate-50 space-y-4 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Kitalu cha Google AdSense Active Unit</p>
                      <p className="text-[11px] text-slate-400">
                        Mchapishaji: <span className="font-mono font-bold text-slate-600">{adsensePubId}</span>
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm max-w-sm mx-auto space-y-2 text-left relative overflow-hidden">
                      <div className="absolute top-1.5 right-1.5 bg-indigo-600/10 text-indigo-700 text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Sponsor Ad
                      </div>
                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase">Lupanulla Elimu Premium</span>
                      <h4 className="font-display font-black text-xs text-slate-900 leading-snug">
                        Jiunge na ScribdShare Pro &amp; NECTA Prep Mastery!
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Pata vitabu vyote, majibu ya mitihani ya miaka iliyopita na notes zote bila kikomo leo!
                      </p>
                      <div className="bg-slate-900 text-white font-extrabold text-[9px] py-1.5 rounded-lg text-center uppercase tracking-wide mt-2">
                        Jifunze Sasa hivi
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-400">
                      * Matangazo haya ni salama, yanahifadhi nishati ya macho ya wanafunzi, na hayavurugi usomaji.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: ACTIVITY LOGS */}
          {activeTab === 'activity_logs' && (
            <div className="space-y-6 animate-fade-in">
              {freshRole !== 'super_admin' ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12">
                  <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                    <ShieldAlert size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-extrabold text-gray-900">Ufikiaji Umezuiliwa!</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Ni **Super Admin** pekee mwenye haki ya kutazama shajara za matendo ya mfumo (System Audit Logs) kwa ajili ya usalama wa jukwaa.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all"
                    >
                      Rudi kwenye Uhakiki
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-50 pb-4">
                    <div>
                      <h2 className="text-lg font-sans font-extrabold text-gray-900">Shajara za Matendo (System Audit Logs)</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Rekodi kamili za kiusalama za matendo ya usimamizi wa jukwaa.</p>
                    </div>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1 uppercase tracking-wider">
                      🔒 Super Admin Console
                    </span>
                  </div>

                  {/* Search logs bar */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 text-gray-400" size={14} />
                      <input 
                        type="text"
                        value={resultSearch}
                        onChange={(e) => setResultSearch(e.target.value)}
                        placeholder="Tafuta kwa barua pepe ya msimamizi, jina la mtumiaji au kitendo..."
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs bg-slate-50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="text-center py-12 text-gray-450 italic">
                      No data available yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                          <tr>
                            <th scope="col" className="px-4 py-3">Muda / Tarehe</th>
                            <th scope="col" className="px-4 py-3">Msimamizi</th>
                            <th scope="col" className="px-4 py-3">Kitendo</th>
                            <th scope="col" className="px-4 py-3">Mlengo wa Kitendo</th>
                            <th scope="col" className="px-4 py-3">Maelezo Kamili</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {auditLogs
                            .filter(log => {
                              const q = resultSearch.toLowerCase();
                              return (
                                log.adminEmail.toLowerCase().includes(q) ||
                                log.adminName.toLowerCase().includes(q) ||
                                log.action.toLowerCase().includes(q) ||
                                log.targetName.toLowerCase().includes(q) ||
                                (log.details && log.details.toLowerCase().includes(q))
                              );
                            })
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap font-mono text-gray-400 text-[10px]">
                                  {log.timestamp ? new Date(log.timestamp).toLocaleString('en-GB') : '—'}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-gray-800">{log.adminName}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{log.adminEmail}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    log.action === 'suspend_user' ? 'bg-red-500 text-white' :
                                    log.action === 'unsuspend_user' ? 'bg-slate-900 text-white' :
                                    log.action === 'update_role' ? 'bg-indigo-650 text-white' :
                                    log.action === 'approve_document' ? 'bg-emerald-600 text-white' :
                                    log.action === 'reject_document' ? 'bg-amber-600 text-white' :
                                    log.action === 'delete_document' ? 'bg-gray-700 text-white' :
                                    'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">{log.targetName}</span>
                                    <span className="text-[9px] text-gray-400 font-mono">ID: {log.targetId}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 max-w-xs truncate text-gray-600 font-medium" title={log.details}>
                                  {log.details || '—'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: MODULAR INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-fade-in">
              {freshRole !== 'super_admin' ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12">
                  <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                    <ShieldAlert size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-extrabold text-gray-900">Ufikiaji Umezuiliwa!</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Ni **Super Admin** pekee mwenye haki ya kutazama na kusimamia huduma na funguo za nje (API Keys) kwa ajili ya usalama wa jukwaa.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all"
                    >
                      Rudi kwenye Uhakiki
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveSystemConfig} className="space-y-8">
                  {/* Intro card */}
                  <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                      <Cpu size={240} className="text-indigo-400" />
                    </div>
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-550 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                          Enterprise Modular Integrations
                        </span>
                        {systemConfig?.updatedAt && (
                          <span className="text-[10px] text-indigo-300 font-mono">
                            Ilikasimiwa mwisho: {new Date(systemConfig.updatedAt).toLocaleString('en-GB')} na {systemConfig.updatedBy}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-sans font-black tracking-tight">API &amp; Sanidi za Huduma za Nje</h2>
                      <p className="text-xs text-indigo-200/85 leading-relaxed max-w-2xl">
                        Dhibiti miingiliano yote ya mfumo wa ScribdShare/Lupanulla kuanzia Malipo ya Simu, Stripe, Akili Mnemba (Gemini AI), Mikutano, na Usalama wa WAF. Marekebisho yanahifadhiwa kwenye usimbaji fiche wa Firestore.
                      </p>
                    </div>
                  </div>

                  {/* Sections bento grids */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* SECTION 1: AUTHENTICATION */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Lock size={18} className="text-indigo-600" />
                        <div>
                          <h3 className="text-sm font-sans font-extrabold text-gray-900">Uthibitisho na Usajili (Auth &amp; MFA)</h3>
                          <p className="text-[10px] text-gray-400">Google OAuth &amp; Multi-Factor Authentication</p>
                        </div>
                      </div>
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Google Client ID</label>
                          <input 
                            type="text"
                            value={systemConfig?.oauthGoogleClientId || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, oauthGoogleClientId: e.target.value } : null)}
                            placeholder="e.g. 12345678-abc.apps.googleusercontent.com"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Google Client Secret</label>
                          <input 
                            type="password"
                            value={systemConfig?.oauthGoogleClientSecret || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, oauthGoogleClientSecret: e.target.value } : null)}
                            placeholder="••••••••••••••••••••••••••••••••"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-dashed border-gray-150 mt-1">
                          <div>
                            <p className="font-extrabold text-gray-800">Multi-Factor Authentication (MFA)</p>
                            <p className="text-[10px] text-gray-400 max-w-xs">Lazimisha admins wote kupitia OTP kabla ya kuingia kwenye dashboard.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSystemConfig(prev => prev ? { ...prev, mfaEnabled: !prev.mfaEnabled } : null)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-350 cursor-pointer ${
                              systemConfig?.mfaEnabled ? 'bg-indigo-600 justify-end' : 'bg-gray-200 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: AI INTEGRATION */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Cpu size={18} className="text-violet-600" />
                        <div>
                          <h3 className="text-sm font-sans font-extrabold text-gray-900">Akili Mnemba (Gemini API &amp; Tools)</h3>
                          <p className="text-[10px] text-gray-400">Tafakari ya Kiswahili/English AI Tutor, Quiz, Notes &amp; Essay Marker</p>
                        </div>
                      </div>
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Google Gemini API Key</label>
                          <input 
                            type="password"
                            value={systemConfig?.geminiApiKey || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, geminiApiKey: e.target.value } : null)}
                            placeholder="AIzaSy..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                          <p className="text-[9px] text-gray-450 mt-1 leading-relaxed">
                            Ufunguo huu unatumika kuendesha moduli zote za Kiswahili AI Tutor, jenereta za maswali (Quiz), mukhtasari wa nyaraka (Notes generator), na usahihishaji otomatiki wa insha.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-violet-50/55 border border-violet-100 rounded-2xl space-y-1">
                          <p className="font-extrabold text-violet-950 text-[10px] uppercase tracking-wider">Moduli Zilizoamilishwa:</p>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-violet-850 font-semibold">
                            <span className="flex items-center gap-1">✔ AI Tutor (Kiswahili &amp; EN)</span>
                            <span className="flex items-center gap-1">✔ AI Quiz Generator</span>
                            <span className="flex items-center gap-1">✔ AI Notes Summarizer</span>
                            <span className="flex items-center gap-1">✔ AI Essay Marker</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: PAYMENTS */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 lg:col-span-2">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <DollarSign size={18} className="text-emerald-650" />
                        <div>
                          <h3 className="text-sm font-sans font-extrabold text-gray-900">Ushirikishwaji wa Malipo (Local Mobile Money &amp; Global Gateways)</h3>
                          <p className="text-[10px] text-gray-400">Lipia uanachama wa Premium na ununue nyaraka kwa M-Pesa, Airtel Money, Stripe au PayPal</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                        {/* Vodacom M-Pesa Tanzania */}
                        <div className="bg-slate-50/60 p-4 rounded-2xl border border-gray-100 space-y-3">
                          <p className="font-extrabold text-rose-600 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            Vodacom M-Pesa Tanzania Config
                          </p>
                          <div className="space-y-2.5">
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">M-Pesa Consumer Key</label>
                              <input 
                                type="text"
                                value={systemConfig?.mpesaConsumerKey || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, mpesaConsumerKey: e.target.value } : null)}
                                placeholder="mpesa_consumer_key_mock_123"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">M-Pesa Consumer Secret</label>
                              <input 
                                type="password"
                                value={systemConfig?.mpesaConsumerSecret || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, mpesaConsumerSecret: e.target.value } : null)}
                                placeholder="••••••••••••••••••••"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">M-Pesa Passkey / Lipa na M-Pesa Paybill</label>
                              <input 
                                type="text"
                                value={systemConfig?.mpesaPasskey || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, mpesaPasskey: e.target.value } : null)}
                                placeholder="e.g. bfb279f9aa9e..."
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Airtel Money & Mix by Yas */}
                        <div className="bg-slate-50/60 p-4 rounded-2xl border border-gray-100 space-y-3">
                          <p className="font-extrabold text-red-650 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            Airtel Money &amp; Mix by Yas
                          </p>
                          <div className="space-y-2.5">
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">Airtel Money Client ID</label>
                              <input 
                                type="text"
                                value={systemConfig?.airtelMoneyClientId || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, airtelMoneyClientId: e.target.value } : null)}
                                placeholder="airtel_client_id_..."
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">Airtel Money Client Secret</label>
                              <input 
                                type="password"
                                value={systemConfig?.airtelMoneyClientSecret || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, airtelMoneyClientSecret: e.target.value } : null)}
                                placeholder="••••••••••••••••••••"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">Mix by Yas (Zantel / Halotel API Key)</label>
                              <input 
                                type="text"
                                value={systemConfig?.mixByYasApiKey || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, mixByYasApiKey: e.target.value } : null)}
                                placeholder="yas_key_39182312..."
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-amber-550 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Stripe Global Card Gateway */}
                        <div className="bg-slate-50/60 p-4 rounded-2xl border border-gray-100 space-y-3">
                          <p className="font-extrabold text-indigo-650 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            Stripe Global Card Gateway
                          </p>
                          <div className="space-y-2.5">
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">Stripe Publishable Key (Public)</label>
                              <input 
                                type="text"
                                value={systemConfig?.stripePublicKey || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, stripePublicKey: e.target.value } : null)}
                                placeholder="pk_test_..."
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">Stripe Secret Key (Secret)</label>
                              <input 
                                type="password"
                                value={systemConfig?.stripeSecretKey || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, stripeSecretKey: e.target.value } : null)}
                                placeholder="sk_test_..."
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* PayPal Payment config */}
                        <div className="bg-slate-50/60 p-4 rounded-2xl border border-gray-100 space-y-3">
                          <p className="font-extrabold text-blue-650 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            PayPal Checkout Gateways
                          </p>
                          <div className="space-y-2.5">
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">PayPal Client ID</label>
                              <input 
                                type="text"
                                value={systemConfig?.paypalClientId || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, paypalClientId: e.target.value } : null)}
                                placeholder="paypal_client_id_..."
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-600 font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-650 text-[10px]">PayPal Secret Key</label>
                              <input 
                                type="password"
                                value={systemConfig?.paypalSecretKey || ''}
                                onChange={(e) => setSystemConfig(prev => prev ? { ...prev, paypalSecretKey: e.target.value } : null)}
                                placeholder="••••••••••••••••••••"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-600 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: MEETINGS & ROOMS */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Link size={18} className="text-emerald-600" />
                        <div>
                          <h3 className="text-sm font-sans font-extrabold text-gray-900">Mikutano ya Moja kwa Moja (Google Meet &amp; Zoom)</h3>
                          <p className="text-[10px] text-gray-400">Sanidi viungo kwa ajili ya vipindi vya masomo na majadiliano ya walimu</p>
                        </div>
                      </div>
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Google Meet OAuth Client ID</label>
                          <input 
                            type="text"
                            value={systemConfig?.googleMeetClientId || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, googleMeetClientId: e.target.value } : null)}
                            placeholder="meet_oauth_id_..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Zoom SDK Client ID</label>
                          <input 
                            type="text"
                            value={systemConfig?.zoomClientId || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, zoomClientId: e.target.value } : null)}
                            placeholder="zoom_client_id_..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Zoom Client Secret</label>
                          <input 
                            type="password"
                            value={systemConfig?.zoomClientSecret || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, zoomClientSecret: e.target.value } : null)}
                            placeholder="••••••••••••••••••••••••"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: STORAGE PROVIDERS */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Database size={18} className="text-cyan-650" />
                        <div>
                          <h3 className="text-sm font-sans font-extrabold text-gray-900">Uhifadhi Salama (Supabase &amp; Cloudflare R2)</h3>
                          <p className="text-[10px] text-gray-400">Hifadhi majalada, vitabu, na picha katika kiwango kikubwa salama</p>
                        </div>
                      </div>
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Supabase API URL</label>
                          <input 
                            type="text"
                            value={systemConfig?.supabaseUrl || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, supabaseUrl: e.target.value } : null)}
                            placeholder="https://xyz.supabase.co"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Supabase Service Role Key (Private)</label>
                          <input 
                            type="password"
                            value={systemConfig?.supabaseServiceKey || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, supabaseServiceKey: e.target.value } : null)}
                            placeholder="eyJhbGciOi..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div className="border-t border-gray-50 pt-2 grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold text-gray-650 text-[10px] mb-1">Cloudflare R2 Bucket</label>
                            <input 
                              type="text"
                              value={systemConfig?.cloudflareR2Bucket || ''}
                              onChange={(e) => setSystemConfig(prev => prev ? { ...prev, cloudflareR2Bucket: e.target.value } : null)}
                              placeholder="lup-files-r2"
                              className="w-full border border-gray-200 rounded-xl px-2.5 py-2 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-gray-650 text-[10px] mb-1">R2 Access Key</label>
                            <input 
                              type="text"
                              value={systemConfig?.cloudflareR2AccessKey || ''}
                              onChange={(e) => setSystemConfig(prev => prev ? { ...prev, cloudflareR2AccessKey: e.target.value } : null)}
                              placeholder="r2_access_key_..."
                              className="w-full border border-gray-200 rounded-xl px-2.5 py-2 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6: EMAIL CAMPAIGNS & NOTIFICATIONS */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Mail size={18} className="text-amber-600" />
                        <div>
                          <h3 className="text-sm font-sans font-extrabold text-gray-900">Arifa za Barua Pepe (SMTP Config)</h3>
                          <p className="text-[10px] text-gray-400">Usambazaji wa barua pepe za miamala na kampeni kwa wasajiliwa</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">SMTP Outgoing Server Host</label>
                          <input 
                            type="text"
                            value={systemConfig?.emailSmtpHost || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, emailSmtpHost: e.target.value } : null)}
                            placeholder="smtp.lupanulla.co.tz"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">SMTP Port</label>
                          <input 
                            type="number"
                            value={systemConfig?.emailSmtpPort || 587}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, emailSmtpPort: parseInt(e.target.value) || 587 } : null)}
                            placeholder="587"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">SMTP Authentication User</label>
                          <input 
                            type="text"
                            value={systemConfig?.emailSmtpUser || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, emailSmtpUser: e.target.value } : null)}
                            placeholder="no-reply@lupanulla.co.tz"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">SMTP Password</label>
                          <input 
                            type="password"
                            value={systemConfig?.emailSmtpPass || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, emailSmtpPass: e.target.value } : null)}
                            placeholder="••••••••••••••••••••••••"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 7: SECURITY & ANALYTICS */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Shield size={18} className="text-red-600" />
                        <div>
                          <h3 className="text-sm font-sans font-extrabold text-gray-900">Uchambuzi &amp; Usalama (WAF &amp; SEO Analytics)</h3>
                          <p className="text-[10px] text-gray-400">Google Analytics, Microsoft Clarity, &amp; Cloudflare WAF Shielding</p>
                        </div>
                      </div>
                      <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold text-gray-650 text-[10px] mb-1">Google Analytics G-ID</label>
                            <input 
                              type="text"
                              value={systemConfig?.googleAnalyticsId || ''}
                              onChange={(e) => setSystemConfig(prev => prev ? { ...prev, googleAnalyticsId: e.target.value } : null)}
                              placeholder="G-12345678"
                              className="w-full border border-gray-200 rounded-xl px-2.5 py-2 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-gray-650 text-[10px] mb-1">Clarity ID</label>
                            <input 
                              type="text"
                              value={systemConfig?.clarityId || ''}
                              onChange={(e) => setSystemConfig(prev => prev ? { ...prev, clarityId: e.target.value } : null)}
                              placeholder="clarity_id_mock"
                              className="w-full border border-gray-200 rounded-xl px-2.5 py-2 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Google Search Console Verification Key</label>
                          <input 
                            type="text"
                            value={systemConfig?.googleSearchConsoleId || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, googleSearchConsoleId: e.target.value } : null)}
                            placeholder="g-search-console-verification-key"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Cloudflare WAF Zone ID (Rate Limiting Shield)</label>
                          <input 
                            type="text"
                            value={systemConfig?.cloudflareWafZoneId || ''}
                            onChange={(e) => setSystemConfig(prev => prev ? { ...prev, cloudflareWafZoneId: e.target.value } : null)}
                            placeholder="cloudflare_waf_zone_id"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-indigo-600 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Submission and auditing warnings */}
                  <div className="bg-amber-50 border border-amber-150 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs items-start">
                    <Shield size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-extrabold text-[13px]">Ilani ya Usalama wa Kiwango cha Juu (Auditable Action)</p>
                      <p className="text-[11px] leading-relaxed text-amber-850">
                        Marekebisho yoyote kwenye ukurasa huu yanatathminiwa papo hapo na yataandikwa kwenye **Shajara za Matendo (Audit Logs)** pamoja na IP yako, muda kamili, na jina la mhusika kwa ukaguzi wa kiusalama. Hakikisha funguo zilizowekwa ziko sahihi ili kuepusha usumbufu wa mawasiliano ya nje ya mfumo.
                      </p>
                    </div>
                  </div>

                  {/* Form Submission Button */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Je, una uhakika unataka kuacha mabadiliko haya?")) {
                          setActiveTab('approvals');
                        }
                      }}
                      className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Ghairi
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSavingConfig ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Inasave...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Hifadhi Mipangilio (Save Config)
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}

          {/* TAB: NEWS MANAGEMENT */}
          {activeTab === 'news' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="text-lg font-sans font-extrabold text-gray-900">Usimamizi wa Habari za Tovuti</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Kusanya habari kutoka vyanzo vya elimu Tanzania na zithibitishe hapa kabla ya kuziweka hadharani.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCrawlNewsWithAI}
                    disabled={isCrawling}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-300 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Cpu size={14} className={isCrawling ? "animate-spin" : ""} />
                    {isCrawling ? 'Kukusanya na AI...' : 'Kusanya Habari na AI (Gemini)'}
                  </button>
                  <button
                    onClick={handleOpenAddNews}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    Ongeza kwa Mkono
                  </button>
                </div>
              </div>

              {/* Crawl with AI Loading placeholder */}
              {isCrawling && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center space-y-3 animate-pulse">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto animate-duration-1000"></div>
                  <p className="text-sm font-bold text-gray-700">Gemini AI inakagua na kukusanya habari za elimu Tanzania...</p>
                  <p className="text-xs text-gray-400">Inatafuta matangazo mapya ya NECTA, mabadiliko ya mitaala TIE, na updates za bodi ya mikopo HESLB.</p>
                </div>
              )}

              {/* Temporary Crawled News List (Drafts) */}
              {crawledNews.length > 0 && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-indigo-900 flex items-center gap-1.5">
                      <Cpu size={16} />
                      Habari Zilizogunduliwa na AI (Bado Hazijahifadhiwa)
                    </h3>
                    <button
                      onClick={() => setCrawledNews([])}
                      className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
                    >
                      Futa Orodha Hii
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crawledNews.map((item, index) => (
                      <div key={index} className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Kutoka: {item.source}
                            </span>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
                              >
                                Tovuti <ArrowUpRight size={12} />
                              </a>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-gray-900">{item.title}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{item.content}</p>
                          {item.relevanceExplanation && (
                            <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-2 text-[11px] text-amber-800">
                              <span className="font-extrabold">Umuhimu kwa Lupanulla: </span>
                              {item.relevanceExplanation}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleSaveCrawledNewsItem(item, true)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer"
                          >
                            Hifadhi &amp; Idhinisha
                          </button>
                          <button
                            onClick={() => handleSaveCrawledNewsItem(item, false)}
                            className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-lg transition-all cursor-pointer"
                          >
                            Hifadhi (Draft)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main News Catalog Section */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Tafuta habari kwa kichwa au chanzo..."
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/50 text-sm text-gray-800 border border-gray-200 rounded-xl outline-none font-semibold"
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                      <tr>
                        <th scope="col" className="px-4 py-3">Kichwa cha Habari</th>
                        <th scope="col" className="px-4 py-3">Chanzo</th>
                        <th scope="col" className="px-4 py-3">Muda wa Kusajili</th>
                        <th scope="col" className="px-4 py-3">Hali (Status)</th>
                        <th scope="col" className="px-4 py-3 text-right">Vitendo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dbNews.filter(n => 
                        n.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
                        n.source.toLowerCase().includes(newsSearch.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                            Hakuna habari zilizopatikana kwenye mfumo kwa sasa. Tumia AI crawler juu kukusanya habari mpya!
                          </td>
                        </tr>
                      ) : (
                        dbNews.filter(n => 
                          n.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
                          n.source.toLowerCase().includes(newsSearch.toLowerCase())
                        ).map((news) => (
                          <tr key={news.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex flex-col max-w-md text-left">
                                <span className="font-extrabold text-gray-800">{news.title}</span>
                                {news.relevanceExplanation && (
                                  <span className="text-[10px] text-amber-600 mt-0.5 italic font-bold">{news.relevanceExplanation}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-gray-700 text-left">{news.source}</td>
                            <td className="px-4 py-3 text-xs text-gray-500 text-left">
                              {new Date(news.createdAt).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-left">
                              {news.status === 'approved' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">Approved</span>
                              ) : news.status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5">Pending</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-0.5">Rejected</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {news.status !== 'approved' && (
                                  <button
                                    onClick={() => handleUpdateNewsStatusClick(news.id, news.title, 'approved')}
                                    className="p-1 hover:bg-emerald-50 text-emerald-600 rounded cursor-pointer"
                                    title="Idhinisha (Make Public)"
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                )}
                                {news.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleUpdateNewsStatusClick(news.id, news.title, 'rejected')}
                                    className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                                    title="Kataa (Reject)"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditNews(news)}
                                  className="p-1 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                                  title="Hariri Maelezo"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteNewsClick(news.id, news.title)}
                                  className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                                  title="Futa Kabisa"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MANUAL NEWS ENTRY / EDIT MODAL */}
              {isNewsFormOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in animate-duration-150">
                  <div className="bg-white border border-gray-100 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center bg-indigo-650 px-6 py-4 text-white">
                      <h3 className="font-sans font-extrabold text-base">
                        {editingNews ? 'Hariri Habari za Tovuti' : 'Sajili Habari Mpya'}
                      </h3>
                      <button onClick={() => setIsNewsFormOpen(false)} className="text-white hover:bg-white/10 p-1.5 rounded-full cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleManualNewsSubmit} className="p-6 space-y-4 text-left">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-gray-600">Kichwa cha Habari (Title) *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ingiza kichwa rasmi cha habari"
                          value={newsTitle}
                          onChange={(e) => setNewsTitle(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-800 font-semibold bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Chanzo (Source) *</label>
                          <input
                            type="text"
                            required
                            placeholder="Mfano: NECTA, TIE"
                            value={newsSource}
                            onChange={(e) => setNewsSource(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-800 font-semibold bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Kiungo cha Chanzo (URL - Optional)</label>
                          <input
                            type="url"
                            placeholder="https://tovuti.com/habari"
                            value={newsUrl}
                            onChange={(e) => setNewsUrl(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-800 font-semibold bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-gray-600">Maelezo Kamili ya Habari *</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Andika muhtasari au maelezo kamili ya habari hii..."
                          value={newsContent}
                          onChange={(e) => setNewsContent(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-800 font-semibold bg-white"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-gray-600">Sababu ya Umuhimu kwa Lupanulla (Optional)</label>
                        <input
                          type="text"
                          placeholder="Mfano: Inawasaidia wanafunzi kujiandaa na mitihani ya kitaifa"
                          value={newsRelevance}
                          onChange={(e) => setNewsRelevance(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-800 font-semibold bg-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsNewsFormOpen(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl uppercase hover:bg-slate-50 cursor-pointer"
                        >
                          Ghairi
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl uppercase cursor-pointer"
                        >
                          {editingNews ? 'Hifadhi Mabadiliko' : 'Sajili Habari'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: EDUCATIONAL RESOURCES VERIFICATION */}
          {activeTab === 'resources' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-lg font-sans font-extrabold text-gray-900">Uhakiki wa Vyanzo vya Elimu</h2>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                    Thibitisha na uruhusu viungo na rasilimali mpya zilizopendekezwa na wanafunzi au watumiaji
                  </p>
                </div>
              </div>

              {/* Resources search bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Tafuta rasilimali kwa jina, maelezo, au taasisi..."
                  value={resourcesSearch}
                  onChange={(e) => setResourcesSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/50 text-sm text-gray-800 border border-gray-200 rounded-xl outline-none font-semibold"
                />
              </div>

              {/* Main table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Tovuti / Rasilimali</th>
                      <th scope="col" className="px-4 py-3">Kundi (Category)</th>
                      <th scope="col" className="px-4 py-3">Taasisi Inayosimamia</th>
                      <th scope="col" className="px-4 py-3">Hali (Status)</th>
                      <th scope="col" className="px-4 py-3 text-right">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dbResources.filter(r => 
                      r.title.toLowerCase().includes(resourcesSearch.toLowerCase()) ||
                      r.description.toLowerCase().includes(resourcesSearch.toLowerCase()) ||
                      r.institution?.toLowerCase().includes(resourcesSearch.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                          Hakuna vyanzo vya rasilimali vilivyopatikana kwa sasa.
                        </td>
                      </tr>
                    ) : (
                      dbResources.filter(r => 
                        r.title.toLowerCase().includes(resourcesSearch.toLowerCase()) ||
                        r.description.toLowerCase().includes(resourcesSearch.toLowerCase()) ||
                        r.institution?.toLowerCase().includes(resourcesSearch.toLowerCase())
                      ).map((res) => (
                        <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex flex-col text-left max-w-md">
                              <span className="font-extrabold text-gray-800">{res.title}</span>
                              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-1">{res.description}</p>
                              {res.url && (
                                <a 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 flex items-center gap-0.5"
                                >
                                  {res.url} <ArrowUpRight size={11} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-700 text-left capitalize">
                            {res.category.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 text-left font-semibold">
                            {res.institution || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-left">
                            {res.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">Verified</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5 animate-pulse">Pending Review</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!res.isVerified && (
                                <button
                                  onClick={() => handleVerifyResourceClick(res.id, res.title)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                  title="Thibitisha na fanya kuwa hai"
                                >
                                  <CheckCircle size={13} />
                                  <span>Verify Link</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteResourceClick(res.id, res.title)}
                                className="p-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-all"
                                title="Futa Kiungo hiki"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: VIDEO CLASS MANAGEMENT */}
          {activeTab === 'videos' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-lg font-sans font-extrabold text-gray-900">Kusimamia Madarasa ya Video</h2>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                    Ongeza, hariri, au futa video za masomo kutoka YouTube ili kuonekana kote kwenye jukwaa
                  </p>
                </div>
                <button
                  onClick={handleOpenAddVideo}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                >
                  <Plus size={16} /> Ongeza Video Mpya
                </button>
              </div>

              {/* Videos search bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Tafuta video kwa jina, somo, mwalimu, au maelezo..."
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 text-sm text-gray-800 border border-gray-200 rounded-xl outline-none font-semibold"
                />
              </div>

              {/* Videos Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Picha &amp; Kichwa cha Video</th>
                      <th scope="col" className="px-4 py-3">Somo (Subject)</th>
                      <th scope="col" className="px-4 py-3">Kiwango (Level)</th>
                      <th scope="col" className="px-4 py-3">Mwalimu &amp; Muda</th>
                      <th scope="col" className="px-4 py-3 text-right">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dbVideos.filter(v => 
                      v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
                      (v.subject || '').toLowerCase().includes(videoSearch.toLowerCase()) ||
                      (v.teacher || '').toLowerCase().includes(videoSearch.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-xs text-gray-400 font-medium">
                          Hakuna video zilizopatikana kwenye mfumo kwa sasa.
                        </td>
                      </tr>
                    ) : (
                      dbVideos.filter(v => 
                        v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
                        (v.subject || '').toLowerCase().includes(videoSearch.toLowerCase()) ||
                        (v.teacher || '').toLowerCase().includes(videoSearch.toLowerCase())
                      ).map((video) => (
                        <tr key={video.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={video.thumbnailUrl} 
                                alt={video.title} 
                                className="w-20 h-12 object-cover rounded-lg shadow-sm border border-slate-100 shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex flex-col text-left max-w-md">
                                <span className="font-extrabold text-gray-800 line-clamp-2">{video.title}</span>
                                <span className="text-[10px] text-gray-400 font-mono mt-0.5">YouTube ID: {video.youtubeId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-700 text-left">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md">{video.subject}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-500 text-left">
                            {video.level || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-left">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700">{video.teacher}</span>
                              <span className="text-gray-400 font-medium text-[10px] uppercase">{video.duration} mns</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditVideo(video)}
                                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer transition-all"
                                title="Hariri video hii"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteVideoClick(video.id, video.title)}
                                className="p-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-all"
                                title="Futa video hii"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Video Add/Edit Modal */}
              {isVideoFormOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto">
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={() => setIsVideoFormOpen(false)}></div>
                  <div className="relative bg-white border border-gray-100 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[310] animate-fade-in text-gray-800">
                    <button 
                      onClick={() => setIsVideoFormOpen(false)}
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all z-20 cursor-pointer"
                    >
                      <X size={18} />
                    </button>

                    <div className="p-5 border-b border-gray-100 bg-red-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                        <Tv size={20} />
                      </div>
                      <div>
                        <h3 className="font-sans font-extrabold text-sm text-gray-900 uppercase tracking-tight">
                          {editingVideo ? 'Hariri Video ya Somo' : 'Sajili Video Mpya'}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Uhariri wa video za YouTube kwa ajili ya Lupanulla Video Class
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveVideoSubmit} className="p-6 space-y-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Kichwa cha Video / Mada (Title)</label>
                        <input 
                          type="text" 
                          required
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          placeholder="Mfano: Newton's Laws of Motion - Form 3 Solved Problems" 
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Somo (Subject)</label>
                          <select 
                            value={videoSubject}
                            onChange={(e) => setVideoSubject(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 cursor-pointer"
                          >
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Advanced Mathematics">Advanced Mathematics</option>
                            <option value="Geography">Geography</option>
                            <option value="History">History</option>
                            <option value="English">English</option>
                            <option value="Kiswahili">Kiswahili</option>
                            <option value="Civics">Civics</option>
                          </select>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Ngazi ya Elimu (Level)</label>
                          <select 
                            value={videoLevel}
                            onChange={(e) => setVideoLevel(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 cursor-pointer"
                          >
                            <option value="Primary">Primary</option>
                            <option value="O-Level">O-Level (Form 1-4)</option>
                            <option value="A-Level">A-Level (Form 5-6)</option>
                            <option value="University">Chuo Kikuu</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Jina la Mwalimu</label>
                          <input 
                            type="text" 
                            value={videoTeacher}
                            onChange={(e) => setVideoTeacher(e.target.value)}
                            placeholder="Mwl. Joshua" 
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Muda wa Video (Mins)</label>
                          <input 
                            type="text" 
                            required
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(e.target.value)}
                            placeholder="15:00" 
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Kiungo cha YouTube (YouTube Link)</label>
                        <input 
                          type="url" 
                          required
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..." 
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsVideoFormOpen(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl uppercase hover:bg-slate-50 cursor-pointer"
                        >
                          Ghairi
                        </button>
                        <button 
                          type="submit"
                          disabled={isVideoSaving}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {isVideoSaving ? 'Inahifadhi...' : (editingVideo ? 'Hifadhi Mabadiliko' : 'Sajili Video')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: BOOKSTORE PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-lg font-sans font-extrabold text-gray-900">Usimamizi wa Duka la Vitabu (Bookstore)</h2>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                    Dhibiti vitabu na nyaraka zinazouzwa kwa gharama nafuu kwa wanafunzi Tanzania
                  </p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                >
                  <Plus size={16} /> Ongeza Bidhaa Mpya
                </button>
              </div>

              {/* Products search and filters */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Tafuta bidhaa kwa jina, kundi, au maelezo..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 text-sm text-gray-800 border border-gray-200 rounded-xl outline-none font-semibold"
                />
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Picha &amp; Jina la Bidhaa</th>
                      <th scope="col" className="px-4 py-3">Kundi (Category)</th>
                      <th scope="col" className="px-4 py-3">Bei (Price)</th>
                      <th scope="col" className="px-4 py-3">Kiasi Kilichopo (Stock)</th>
                      <th scope="col" className="px-4 py-3 text-right">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dbProducts.filter(p => 
                      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                      (p.category || '').toLowerCase().includes(productSearch.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-xs text-gray-400 font-medium">
                          Hakuna bidhaa zilizopatikana kwenye mfumo kwa sasa.
                        </td>
                      </tr>
                    ) : (
                      dbProducts.filter(p => 
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        (p.category || '').toLowerCase().includes(productSearch.toLowerCase())
                      ).map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={product.imageUrl || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=60'} 
                                alt={product.name} 
                                className="w-12 h-14 object-cover rounded-lg shadow-sm border border-slate-100 shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex flex-col text-left max-w-md">
                                <span className="font-extrabold text-gray-800 line-clamp-2">{product.name}</span>
                                <span className="text-[10px] text-gray-400 mt-1 line-clamp-1">{product.description || 'Hakuna maelezo'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-700 text-left">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md capitalize">{product.category}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-black text-emerald-600 text-left">
                            {product.price.toLocaleString()} TZS
                          </td>
                          <td className="px-4 py-3 text-xs text-left">
                            {product.stockQuantity <= 5 ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-md font-bold animate-pulse">Inakaribia kuisha ({product.stockQuantity})</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-semibold">Zipopo ({product.stockQuantity})</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(product)}
                                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer transition-all"
                                title="Hariri bidhaa hii"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProductClick(product.id, product.name)}
                                className="p-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-all"
                                title="Futa bidhaa hii"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Product Add/Edit Modal */}
              {isProductFormOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto">
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={() => setIsProductFormOpen(false)}></div>
                  <div className="relative bg-white border border-gray-100 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[310] animate-fade-in text-gray-800">
                    <button 
                      onClick={() => setIsProductFormOpen(false)}
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all z-20 cursor-pointer"
                    >
                      <X size={18} />
                    </button>

                    <div className="p-5 border-b border-gray-100 bg-indigo-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <h3 className="font-sans font-extrabold text-sm text-gray-900 uppercase tracking-tight">
                          {editingProduct ? 'Hariri Bidhaa ya Duka' : 'Sajili Bidhaa Mpya'}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Usimamizi wa duka la vitabu, notisi, na majarida ya Lupanulla
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProductSubmit} className="p-6 space-y-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Jina la Kitabu / Bidhaa</label>
                        <input 
                          type="text" 
                          required
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="Mfano: Notisi Kamili za Fizikia Kidato cha Tatu (TIE 2026)" 
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Maelezo ya Bidhaa</label>
                        <textarea 
                          rows={3}
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          placeholder="Mfano: Notisi hizi zimeandaliwa kwa kuzingatia muhtasari mpya wa somo la Fizikia kwa shule za sekondari Tanzania..." 
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Bei ya Mauzo (TZS)</label>
                          <input 
                            type="number" 
                            required
                            value={productPrice}
                            onChange={(e) => setProductPrice(Number(e.target.value))}
                            placeholder="5000" 
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Kiasi cha Stoku (Stock Quantity)</label>
                          <input 
                            type="number" 
                            required
                            value={productStockQuantity}
                            onChange={(e) => setProductStockQuantity(Number(e.target.value))}
                            placeholder="100" 
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Kundi la Bidhaa (Category)</label>
                          <select 
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 cursor-pointer"
                          >
                            <option value="Notes">Notes</option>
                            <option value="Books">Books</option>
                            <option value="Past Papers">Past Papers</option>
                            <option value="Syllabus">Syllabus</option>
                            <option value="Other">Nyinginezo</option>
                          </select>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Picha ya Bidhaa (URL)</label>
                          <input 
                            type="text" 
                            value={productImageUrl}
                            onChange={(e) => setProductImageUrl(e.target.value)}
                            placeholder="https://..." 
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsProductFormOpen(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl uppercase hover:bg-slate-50 cursor-pointer"
                        >
                          Ghairi
                        </button>
                        <button 
                          type="submit"
                          disabled={isProductSaving}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {isProductSaving ? 'Inahifadhi...' : (editingProduct ? 'Hifadhi Mabadiliko' : 'Sajili Bidhaa')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: USER FEEDBACKS */}
          {activeTab === 'feedback' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              <div className="text-left">
                <h2 className="text-lg font-sans font-extrabold text-gray-900">Maoni na Malalamiko ya Watumiaji (Feedbacks)</h2>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                  Soma na ushughulikie mapendekezo, taarifa za hitilafu, au nyaraka zinazokosekana zilizoripotiwa na wanafunzi
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Tafuta kwa jina, barua pepe, au maudhui..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/50 text-sm text-gray-800 border border-gray-200 rounded-xl outline-none font-semibold"
                  />
                </div>
                <div className="w-full sm:w-48 shrink-0">
                  <select
                    value={feedbackTypeFilter}
                    onChange={(e) => setFeedbackTypeFilter(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 cursor-pointer"
                  >
                    <option value="all">Aina Zote za Maoni</option>
                    <option value="missing_notes">Nyaraka Zinazokosekana</option>
                    <option value="improvement">Mapendekezo ya Kuboresha</option>
                    <option value="bug">Hitilafu / Bugs</option>
                    <option value="other">Mengineyo</option>
                  </select>
                </div>
              </div>

              {/* Feedback cards bento grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbFeedbacks.filter(f => {
                  const matchesSearch = f.userName.toLowerCase().includes(feedbackSearch.toLowerCase()) || 
                                        f.email.toLowerCase().includes(feedbackSearch.toLowerCase()) || 
                                        f.message.toLowerCase().includes(feedbackSearch.toLowerCase());
                  const matchesFilter = feedbackTypeFilter === 'all' || f.type === feedbackTypeFilter;
                  return matchesSearch && matchesFilter;
                }).length === 0 ? (
                  <div className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center text-xs text-gray-400 font-semibold">
                    Hakuna maoni yoyote yaliyopatikana kwa vichujio hivi kwa sasa.
                  </div>
                ) : (
                  dbFeedbacks.filter(f => {
                    const matchesSearch = f.userName.toLowerCase().includes(feedbackSearch.toLowerCase()) || 
                                          f.email.toLowerCase().includes(feedbackSearch.toLowerCase()) || 
                                          f.message.toLowerCase().includes(feedbackSearch.toLowerCase());
                    const matchesFilter = feedbackTypeFilter === 'all' || f.type === feedbackTypeFilter;
                    return matchesSearch && matchesFilter;
                  }).map((item) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col text-left">
                            <span className="font-extrabold text-sm text-gray-900">{item.userName}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{item.email}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                            item.type === 'bug' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            item.type === 'missing_notes' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            item.type === 'improvement' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-slate-50 text-slate-600 border border-slate-100'
                          }`}>
                            {item.type === 'missing_notes' ? 'Nyaraka Zinazokosekana' :
                             item.type === 'bug' ? 'Hitilafu (Bug)' :
                             item.type === 'improvement' ? 'Maboresho' : 'Nyingine'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed text-left whitespace-pre-wrap">{item.message}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(item.createdAt).toLocaleString('en-GB')}
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                            item.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' :
                            item.status === 'reviewed' ? 'bg-sky-50 text-sky-700' :
                            'bg-amber-50 text-amber-700 animate-pulse'
                          }`}>
                            {item.status === 'resolved' ? 'Imetatuliwa' :
                             item.status === 'reviewed' ? 'Inafanyiwa kazi' : 'Mpya'}
                          </span>

                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateFeedbackStatus(item.id!, item.message, e.target.value as any)}
                            className="bg-slate-50 border border-gray-200 text-[11px] font-bold text-gray-700 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-100"
                          >
                            <option value="new">Weka Mpya</option>
                            <option value="reviewed">Weka Kwenye Uhakiki</option>
                            <option value="resolved">Weka Imesuluhishwa</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
