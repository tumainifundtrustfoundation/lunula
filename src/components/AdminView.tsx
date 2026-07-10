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
  Shield
} from 'lucide-react';
import { DocumentMetadata, UserProfile, Certificate, ExamResult, AuditLog, SystemConfig } from '../types';
import { 
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
  updateSystemConfig
} from '../firebase';

interface AdminViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function AdminView({
  onNavigate,
  userProfile
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<string>('approvals');
  
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
      if (activeTab === 'approvals') {
        const pDocs = await fetchDocuments({ status: 'pending' });
        pDocs.sort((a, b) => b.createdAt - a.createdAt);
        setPendingDocs(pDocs);
      } else if (activeTab === 'documents') {
        const aDocs = await fetchDocuments();
        aDocs.sort((a, b) => b.createdAt - a.createdAt);
        setAllDocs(aDocs);
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

  if (userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin' && freshRole !== 'admin' && freshRole !== 'super_admin') {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center max-w-md mx-auto space-y-4 shadow-xl mt-12 animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert size={28} />
        </div>
        <h3 className="font-sans font-extrabold text-lg text-gray-900">Ufikiaji Umezuiliwa</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Huna mamlaka ya kuingia kwenye ukurasa wa wasimamizi (Admin Dashboard). Kama wewe ni wasimamizi, hakikisha akaunti yako imeandikishwa na mamlaka stahiki.
        </p>
        <button
          onClick={() => onNavigate('documents')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl transition-all"
        >
          Rudi kwenye Maktaba
        </button>
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
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-sans font-extrabold text-gray-900">Catalog ya Nyaraka Zote</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Kichwa</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Uandishi</th>
                      <th scope="col" className="px-4 py-3">Views</th>
                      <th scope="col" className="px-4 py-3">Hali</th>
                      <th scope="col" className="px-4 py-3 text-right">Futa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col cursor-pointer" onClick={() => onNavigate('reader', doc.id)}>
                            <p className="font-extrabold text-gray-800 hover:text-indigo-600 hover:underline">{doc.title}</p>
                            <p className="text-[10px] text-gray-400">ID: {doc.id}</p>
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
                          <button
                            onClick={() => handleDelete(doc.id, doc.fileId, doc.title)}
                            disabled={actioningId === doc.id}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

        </div>
      )}
    </div>
  );
}
