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
  Crown
} from 'lucide-react';
import { DocumentMetadata, UserProfile } from '../types';
import { 
  fetchDocuments, 
  updateDocument, 
  deleteDocumentMetadata, 
  fetchAllUsers, 
  updateUserProfile,
  getAccessToken,
  addNotification
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

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadAdminData();
    }
  }, [userProfile, activeTab]);

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
      }
    } catch (err) {
      console.error('Error loading admin dashboard datasets:', err);
    } finally {
      setLoading(false);
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
      alert('Nyaraka imefutwa kwenye mfumo.');
    } catch (err) {
      console.error('Failed to delete catalog item:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'author' | 'admin') => {
    try {
      await updateUserProfile(userId, { role: newRole });
      setAllUsers(allUsers.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      alert('Haki na jukumu (Role) la mtumiaji limesasishwa.');
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleSubscriptionChange = async (userId: string, newSub: 'free' | 'premium') => {
    try {
      await updateUserProfile(userId, { subscription: newSub });
      setAllUsers(allUsers.map(u => u.uid === userId ? { ...u, subscription: newSub } : u));
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

  if (userProfile?.role !== 'admin') {
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
        <h1 className="text-3xl font-sans font-extrabold text-gray-900 flex items-center gap-2">
          <ShieldAlert size={28} className="text-rose-600" />
          ScribdShare Admin Console
        </h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          Msimamizi: {userProfile.name} • Idhinisha faili mpya, dhibiti watumiaji, na tazama uchambuzi wa ufanisi wa jukwaa.
        </p>
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
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BarChart3 size={16} />
          Uchambuzi (Analytics)
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
              <h2 className="text-lg font-sans font-extrabold text-gray-900">Wasajiliwa na Haki zao</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Mtumiaji</th>
                      <th scope="col" className="px-4 py-3">Role (Haki)</th>
                      <th scope="col" className="px-4 py-3">Uanachama (Tier)</th>
                      <th scope="col" className="px-4 py-3">Sajili Tarehe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <p className="font-extrabold text-gray-800">{u.name}</p>
                            <p className="text-[10px] text-gray-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as any)}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-1 text-xs text-gray-700 font-semibold cursor-pointer focus:outline-none"
                          >
                            <option value="student">Student</option>
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={u.subscription}
                            onChange={(e) => handleSubscriptionChange(u.uid, e.target.value as any)}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-1 text-xs text-gray-700 font-semibold cursor-pointer focus:outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                          {u.createdAt ? getFormatDate(u.createdAt) : '—'}
                        </td>
                      </tr>
                    ))}
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

        </div>
      )}
    </div>
  );
}
