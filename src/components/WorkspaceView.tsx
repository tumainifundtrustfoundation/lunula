import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Library, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  GraduationCap, 
  ClipboardCheck,
  RefreshCw,
  Clock,
  Search
} from 'lucide-react';
import { WorkspaceCourse, WorkspaceFile, WorkspaceForm } from '../types';

export default function WorkspaceView() {
  const [courses, setCourses] = useState<WorkspaceCourse[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [forms, setForms] = useState<WorkspaceForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'classroom' | 'drive' | 'forms'>('classroom');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real scenario, we'd probably want to fetch these in parallel or based on active tab
      const [coursesRes, filesRes, formsRes] = await Promise.all([
        fetch('/api/workspace/courses'),
        fetch('/api/workspace/files'),
        fetch('/api/workspace/forms')
      ]);

      if (!coursesRes.ok || !filesRes.ok || !formsRes.ok) {
        throw new Error('Failed to fetch workspace data. Please make sure you are logged in.');
      }

      const coursesData = await coursesRes.json();
      const filesData = await filesRes.json();
      const formsData = await formsRes.json();

      setCourses(coursesData.courses || []);
      setFiles(filesData.files || []);
      setForms(formsData.files || []); // Forms are fetched from files.list in our API
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Maktaba ya Google</h1>
          <p className="text-slate-500">Unganisha masomo yako kutoka Google Classroom na Drive</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Inapakia...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'classroom', label: 'Classroom', icon: GraduationCap },
          { id: 'drive', label: 'Google Drive', icon: Library },
          { id: 'forms', label: 'Quizzes/Forms', icon: ClipboardCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-cyan-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center">
            <p className="font-bold">Hitilafu!</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'classroom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? courses.map((course) => (
                  <div key={course.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{course.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.section || course.descriptionHeading || 'Hakuna maelezo'}</p>
                    <a 
                      href={course.alternateLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700"
                    >
                      Fungua Classroom <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )) : (
                  <EmptyState message="Hujajiunga na kozi yoyote kwenye Google Classroom." />
                )}
              </div>
            )}

            {activeTab === 'drive' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.length > 0 ? files.map((file) => (
                  <div key={file.id} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all flex gap-4">
                    <div className="shrink-0 w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                      {file.thumbnailLink ? (
                        <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-slate-900 line-clamp-2 text-sm mb-1">{file.name}</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          {file.mimeType.split('.').pop()}
                        </p>
                      </div>
                      <a 
                        href={file.webViewLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-cyan-600 flex items-center gap-1 hover:underline"
                      >
                        Tazama Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )) : (
                  <EmptyState message="Hakuna mafaili yaliyopatikana kwenye Google Drive yako." />
                )}
              </div>
            )}

            {activeTab === 'forms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.length > 0 ? forms.map((form) => (
                  <div key={form.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-4 line-clamp-2">{form.name}</h3>
                    <a 
                      href={form.webViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors"
                    >
                      Anza Maswali <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )) : (
                  <EmptyState message="Hakuna fomu (quizzes) zilizopatikana." />
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-20 text-center space-y-4">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
        <Search className="w-10 h-10" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
