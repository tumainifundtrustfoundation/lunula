import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Bookmark, 
  Calendar, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Crown,
  CheckCircle2,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { fetchDocuments, fetchExamResultByCode } from '../firebase';
import { DocumentMetadata, ExamResult } from '../types';
import { GoogleAdSenseUnit } from './MatangazoView';

interface MitihaniViewProps {
  onNavigate: (view: string, id?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userProfile: any;
}

export default function MitihaniView({
  onNavigate,
  searchQuery,
  onSearchChange,
  userProfile
}: MitihaniViewProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Advanced Filtering States
  const [selectedType, setSelectedType] = useState<string>(''); // 'NECTA', 'Mock', 'Terminal', 'Majaribio'
  const [selectedLevel, setSelectedLevel] = useState<string>(''); // 'Primary', 'O-Level', 'A-Level'
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest', 'views', 'alphabetical'
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // --- NEW: Exam Results Check States ---
  const [candidateCode, setCandidateCode] = useState<string>('');
  const [checkingResult, setCheckingResult] = useState<boolean>(false);
  const [checkedResult, setCheckedResult] = useState<ExamResult | null>(null);
  const [resultLookupError, setResultLookupError] = useState<string | null>(null);

  // Load active publisher configuration
  const [adsenseActive, setAdsenseActive] = useState<boolean>(() => localStorage.getItem('lup_adsense_active') !== 'false');

  const handleLookupResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckedResult(null);
    setResultLookupError(null);
    
    const code = candidateCode.trim().toUpperCase();
    if (!code) return;

    setCheckingResult(true);
    try {
      const match = await fetchExamResultByCode(code);
      if (match) {
        setCheckedResult(match);
      } else {
        setResultLookupError('Samahani! Hakuna matokeo yaliyopatikana kwa nambari ya mtihani uliyoingiza. Hakikisha namba imesajiliwa na msimamizi.');
      }
    } catch (err) {
      console.error('Error fetching exam result:', err);
      setResultLookupError('Hitilafu imetokea wakati wa kutafuta matokeo. Tafadhali jaribu tena baadae.');
    } finally {
      setCheckingResult(false);
    }
  };

  // Seed documents array if Firebase Firestore is completely empty
  const localSeedDocs: DocumentMetadata[] = [
    {
      id: 'necta-phy-f4-2023',
      title: 'NECTA Physics Form IV (CSEE) 2023 Past Paper',
      description: 'Official national examination paper for Physics paper 1, complete with questions on mechanics, thermal physics, waves, electromagnetism and modern physics.',
      category: 'Science & Technology',
      tags: ['Physics', 'CSEE', 'NECTA', '2023', 'Form IV'],
      fileId: 'sample-drive-id-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 5, // 5 days ago
      views: 1240,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2023,
      type: 'NECTA',
      sizeKB: 245,
      accent: 'border-cyan-400'
    },
    {
      id: 'necta-math-f4-2022',
      title: 'NECTA Basic Mathematics Form IV 2022 Past Paper',
      description: 'Official national mathematics paper 1 for form four secondary school candidates. Covers sets, quadratic equations, geometry, and trigonometry.',
      category: 'Mathematics',
      tags: ['Mathematics', 'CSEE', 'NECTA', '2022', 'Form IV'],
      fileId: 'sample-drive-id-2',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 10, // 10 days ago
      views: 950,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2022,
      type: 'NECTA',
      sizeKB: 180,
      accent: 'border-amber-400'
    },
    {
      id: 'mock-hist-f4-2024',
      title: 'Dar es Salaam Mock History Form IV 2024 Past Paper',
      description: 'Region mock assessment history examination paper 1. Contains great structure aligning with new syllabus updates.',
      category: 'History & Humanities',
      tags: ['History', 'Mock', 'Dar es Salaam', '2024', 'Form IV'],
      fileId: 'sample-drive-id-3',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'author-1',
      uploadedByName: 'Mwl. Kamau',
      createdAt: Date.now() - 3600000 * 24 * 2, // 2 days ago
      views: 310,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2024,
      type: 'Mock',
      sizeKB: 140,
      accent: 'border-purple-400'
    }
  ];

  useEffect(() => {
    loadDocs();
    const storedBookmarks = localStorage.getItem('lupa_bookmarks');
    if (storedBookmarks) {
      setBookmarkedIds(JSON.parse(storedBookmarks));
    }
  }, []);

  const loadDocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await fetchDocuments({ status: 'approved' });
      
      // Combine fetched documents with our default pre-populated seeds
      // To ensure a full, rich library even if Firestore is currently blank
      const combined = [...fetched];
      
      // Prevent duplicates by ID
      localSeedDocs.forEach(seed => {
        if (!combined.some(d => d.id === seed.id)) {
          combined.push(seed);
        }
      });

      setDocuments(combined);
    } catch (e) {
      console.error(e);
      // Fallback to local seeds on error to protect user experience
      setDocuments(localSeedDocs);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating
    let updated: string[];
    if (bookmarkedIds.includes(docId)) {
      updated = bookmarkedIds.filter(id => id !== docId);
    } else {
      updated = [...bookmarkedIds, docId];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('lupa_bookmarks', JSON.stringify(updated));
  };

  // Filter application
  const filteredDocs = documents.filter((doc) => {
    // Basic global search (Title, Tags, Category, etc.)
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Advanced specific filters
    const docType = doc.type || (doc.tags.some(t => t.toLowerCase() === 'necta') ? 'NECTA' : 'Majaribio');
    const matchesType = !selectedType || docType.toLowerCase() === selectedType.toLowerCase();

    const matchesSubject = !selectedSubject || doc.tags.some(t => t.toLowerCase() === selectedSubject.toLowerCase());

    const docYear = doc.year || (doc.tags.includes('2023') ? 2023 : doc.tags.includes('2022') ? 2022 : 2024);
    const matchesYear = !selectedYear || String(docYear) === selectedYear;

    const isPrimary = doc.tags.some(t => ['primary', 'msingi', 'darasa'].includes(t.toLowerCase()));
    const isAlevel = doc.tags.some(t => ['advanced', 'a-level', 'form v', 'form vi', 'kidato cha tano', 'kidato cha sita'].includes(t.toLowerCase()));
    const isOlevel = !isPrimary && !isAlevel;

    let docLevel = 'O-Level';
    if (isPrimary) docLevel = 'Primary';
    else if (isAlevel) docLevel = 'A-Level';

    const matchesLevel = !selectedLevel || docLevel.toLowerCase() === selectedLevel.toLowerCase();

    return matchesSearch && matchesType && matchesSubject && matchesYear && matchesLevel;
  });

  // Sort application
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.createdAt - a.createdAt;
    } else if (sortBy === 'views') {
      return b.views - a.views;
    } else if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Popular Trending Carousel subset
  const trendingPapers = [...documents]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  return (
    <div id="mitihani-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* ── Banner Section ── */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-800 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden border border-cyan-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider border border-cyan-400/30">
              <TrendingUp size={12} className="text-amber-400" />
              Scribd-Drive File Sharing Integrated
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-none">Past Papers &amp; Mitihani</h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Vinjari maktaba yetu kubwa ya past papers za NECTA, majaribio ya Mock ya mikoa na wilaya, na mitihani ya kawaida ya muhula. Soma mtandaoni na pakua bure!
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate('upload')}
            className="bg-white text-slate-900 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
          >
            <Plus size={16} /> Pakia Mtihani Mpya
          </button>
        </div>
      </section>

      {/* ── NEW: Exam Results Verification & Transcript Portal ── */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Kituo cha Hakiki na Kutazama Matokeo</h2>
              <p className="text-xs text-slate-400">Hakiki matokeo rasmi ya NECTA Mock, Terminal, na majaribio ya shule</p>
            </div>
          </div>
          <span className="self-start sm:self-auto bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100">
            Mfumo wa Uhakiki Umewashwa (Active)
          </span>
        </div>

        <form onSubmit={handleLookupResult} className="max-w-xl space-y-3">
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">Ingiza Namba ya Mtihani (Candidate Code)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  required
                  value={candidateCode}
                  onChange={(e) => setCandidateCode(e.target.value)}
                  placeholder="Mfano: S0101/0001/2026 au LUP-2026-88"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 placeholder-slate-400"
                />
              </div>
              <button 
                type="submit"
                disabled={checkingResult}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap disabled:opacity-75"
              >
                {checkingResult ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Tafuta Matokeo</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Feedback */}
        {resultLookupError && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-xs text-rose-700">
            <AlertCircle className="flex-shrink-0 text-rose-500" size={16} />
            <p className="font-semibold leading-normal">{resultLookupError}</p>
          </div>
        )}

        {/* Verified Result Transcript Card */}
        {checkedResult && (
          <div className="border border-indigo-200 rounded-3xl bg-slate-50 overflow-hidden shadow-md animate-fade-in max-w-2xl">
            {/* Transcript Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 sm:p-6 text-white relative">
              <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 size={10} />
                HAKIKIWA (VERIFIED)
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Ripoti Rasmi ya Maendeleo ya Taaluma</span>
                <h3 className="font-display font-extrabold text-base sm:text-lg leading-tight">{checkedResult.studentName}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-slate-300 pt-1">
                  <span>Candidate No: <strong className="text-white">{checkedResult.candidateCode}</strong></span>
                  <span>•</span>
                  <span>Exam: <strong className="text-white">{checkedResult.examType} ({checkedResult.year})</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-white">{checkedResult.level}</strong></span>
                </div>
              </div>
            </div>

            {/* Transcript Details & Scores */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div>
                  <span className="text-slate-400 block font-extrabold text-[9px] uppercase tracking-wider mb-0.5">Msimamo wa Divisheni</span>
                  <span className="text-slate-800 font-black text-sm sm:text-base uppercase">{checkedResult.division}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-extrabold text-[9px] uppercase tracking-wider mb-0.5">Wastani wa Alama (GPA)</span>
                  <span className="text-indigo-600 font-mono font-black text-sm sm:text-base">{checkedResult.gpa}</span>
                </div>
              </div>

              {/* Subject Table */}
              <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-150 flex justify-between font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  <span>Somo (Subject)</span>
                  <div className="flex gap-8">
                    <span>Alama</span>
                    <span>Daraja (Grade)</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {checkedResult.subjects.map((sub, idx) => (
                    <div key={idx} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/50">
                      <span className="font-bold text-slate-700">{sub.subject}</span>
                      <div className="flex gap-12 font-mono">
                        <span className="text-slate-500 w-8 text-right">{sub.score}%</span>
                        <span className="text-indigo-600 font-black w-8 text-right">Grade {sub.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Footer Disclaimer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-[10px] text-slate-400 leading-normal">
                <p>
                  * Ripoti hii imetolewa na kuhakikiwa kielektroniki kutoka kwenye Hifadhi ya Takwimu ya Lupanulla Elimu Hub. 
                  Hakuna saini ya mkono inayohitajika.
                </p>
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all self-end"
                >
                  <Printer size={12} />
                  Chapa (Print)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic AdSense Integration Area inside Verification section */}
        {adsenseActive && (
          <div className="pt-2">
            <GoogleAdSenseUnit 
              slot="mitihani-results-banner" 
              adFormat="horizontal" 
              className="shadow-sm border-indigo-200 bg-indigo-50/5" 
            />
          </div>
        )}
      </section>

      {/* ── Trending & Popular Past Papers Carousel Slider ── */}
      <section className="space-y-4">
        <h2 className="font-display font-extrabold text-lg text-slate-900 uppercase flex items-center gap-2">
          <TrendingUp size={18} className="text-cyan-600" />
          Mitihani Maarufu Wiki Hii
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingPapers.map((paper) => {
            const docAccent = paper.accent || 'border-cyan-300';
            return (
              <div 
                key={paper.id}
                onClick={() => onNavigate('reader', paper.id)}
                className={`bg-white border-l-4 ${docAccent} border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span className="uppercase">{paper.type || 'NECTA'} &bull; {paper.year || 2023}</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{paper.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-950 text-sm sm:text-base leading-snug line-clamp-2 hover:text-cyan-600 transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                    {paper.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-[10px] text-slate-400 font-bold">
                  <span>{paper.views} views</span>
                  <span className="text-cyan-600 flex items-center gap-1">Fungua Mtihani <ArrowRight size={10} /></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Advanced Search & Filter Workspace ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        
        {/* Row 1: Big Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Tafuta mtihani kwa mada, somo, namba ya past paper, mwaka, au neno lolote..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 pt-1">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aina ya Mtihani</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Aina Zote</option>
              <option value="NECTA">NECTA National</option>
              <option value="Mock">Mock za Mikoa</option>
              <option value="Terminal">Terminal &amp; Exams</option>
              <option value="Majaribio">Majaribio ya Mada</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngazi ya Shule</label>
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Ngazi Zote</option>
              <option value="Primary">Shule ya Msingi</option>
              <option value="O-Level">O-Level (F1-F4)</option>
              <option value="A-Level">A-Level (F5-F6)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Somo (Subject)</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Masomo Yote</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Kiswahili">Kiswahili</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mwaka (Year)</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Miaka Yote</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Panga kwa (Sort)</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="newest">Mpya Zaidi</option>
              <option value="views">Kusomwa Sana (Views)</option>
              <option value="alphabetical">Herufi (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* ── Main Catalog Document Grid ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
          <p>Kupata mitihani {sortedDocs.length} kulingana na vichujio vyako</p>
          <button 
            onClick={() => {
              setSelectedType('');
              setSelectedLevel('');
              setSelectedSubject('');
              setSelectedYear('');
              onSearchChange('');
            }}
            className="text-cyan-600 hover:underline"
          >
            Futa Vichujio Vyote
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-cyan-600">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inasoma Maktaba ya Nyaraka...</p>
          </div>
        ) : sortedDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDocs.map((doc) => {
              const isBookmarked = bookmarkedIds.includes(doc.id);
              const docAccent = doc.accent || 'border-cyan-200';
              const fileKB = doc.sizeKB || 150;
              const typeLabel = doc.type || (doc.tags.includes('NECTA') ? 'NECTA' : 'Mock');
              const isPremium = doc.tags.includes('premium') || doc.tags.includes('PRO');

              return (
                <div 
                  key={doc.id}
                  onClick={() => onNavigate('reader', doc.id)}
                  className={`bg-white border-t-4 ${docAccent} border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-56 hover:scale-[1.01]`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded uppercase">{typeLabel}</span>
                        {isPremium && (
                          <span className="bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Crown size={10} /> PREMIUM
                          </span>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => toggleBookmark(doc.id, e)}
                        className={`p-1.5 rounded-lg border transition-all ${isBookmarked ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'}`}
                      >
                        <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950 text-sm sm:text-base leading-snug line-clamp-2 hover:text-cyan-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mt-1">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-3 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {doc.year || 2024} &bull; {fileKB} KB
                    </span>
                    <span className="text-cyan-600 font-extrabold inline-flex items-center gap-0.5 hover:underline">
                      SOMA SASA &rarr;
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center text-center gap-3 py-16">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-1">
              <FolderOpen size={28} className="stroke-[1.5]" />
            </div>
            <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase">Hakuna Karatasi Iliyopatikana</h3>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed font-medium">
              Sikuweza kupata past papers au mitihani yoyote inayolingana na vichujio vyako vya sasa. Tafadhali jaribu kufuta au kubadilisha masharti ya utafutaji.
            </p>
            <button 
              onClick={() => {
                setSelectedType('');
                setSelectedLevel('');
                setSelectedSubject('');
                setSelectedYear('');
                onSearchChange('');
              }}
              className="mt-2 py-2 px-4 text-xs font-bold bg-slate-950 text-white rounded-xl"
            >
              FUTA VICHUJIO VYOTE
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
