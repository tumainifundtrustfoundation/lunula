import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Eye, 
  Bookmark, 
  Share2, 
  Crown, 
  AlertCircle,
  HelpCircle,
  Lock,
  Compass
} from 'lucide-react';
import { fetchDocuments } from '../firebase';
import { DocumentMetadata } from '../types';

interface ReaderViewProps {
  documentId: string;
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function ReaderView({ documentId, onNavigate, userProfile }: ReaderViewProps) {
  const [doc, setDoc] = useState<DocumentMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Default seeds just in case the active ID matches one of our local seeds
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
      createdAt: Date.now() - 3600000 * 24 * 5,
      views: 1241,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2023,
      type: 'NECTA',
      sizeKB: 245
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
      createdAt: Date.now() - 3600000 * 24 * 10,
      views: 951,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2022,
      type: 'NECTA',
      sizeKB: 180
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
      createdAt: Date.now() - 3600000 * 24 * 2,
      views: 311,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2024,
      type: 'Mock',
      sizeKB: 140
    }
  ];

  useEffect(() => {
    loadDocument();
    
    // Check bookmark status
    const storedBookmarks = localStorage.getItem('lupa_bookmarks');
    if (storedBookmarks) {
      const bookmarked = JSON.parse(storedBookmarks) as string[];
      setIsBookmarked(bookmarked.includes(documentId));
    }
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await fetchDocuments();
      const found = fetched.find(d => d.id === documentId);
      
      if (found) {
        setDoc(found);
      } else {
        // Look in our high-fidelity seeds
        const seed = localSeedDocs.find(d => d.id === documentId);
        if (seed) {
          setDoc(seed);
        } else {
          setError('Nyaraka unayotafuta haikupatikana au imefutwa.');
        }
      }
    } catch (e) {
      console.error(e);
      setError('Mchakato wa kupata nyaraka umeshindwa.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = () => {
    const storedBookmarks = localStorage.getItem('lupa_bookmarks');
    let bookmarked: string[] = storedBookmarks ? JSON.parse(storedBookmarks) : [];
    
    if (isBookmarked) {
      bookmarked = bookmarked.filter(id => id !== documentId);
      setIsBookmarked(false);
    } else {
      bookmarked.push(documentId);
      setIsBookmarked(true);
    }
    
    localStorage.setItem('lupa_bookmarks', JSON.stringify(bookmarked));
  };

  const handleDownload = () => {
    // Premium validation logic
    const isPremium = userProfile?.subscription === 'premium' || userProfile?.role === 'admin';
    if (!isPremium) {
      alert('🔒 KUPAKUA KUMEZUILIWA:\nKupakua faili moja kwa moja ni fursa ya wanachama wa PREMIUM pekee. Tafadhali jiunge na Premium kwenye ukurasa wako wa Akaunti ili kuwezesha kupakua miongozo na mitihani yote!');
      return;
    }

    // If premium, trigger PDF download link directly
    alert('📥 Upakuaji umeanza! Faili lako la PDF linapakuliwa kutoka Google Drive sasa hivi.');
    window.open('https://www.orimi.com/pdf-test.pdf', '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-cyan-600">
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inafungua Karatasi ya Mtihani...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md mx-auto py-16 space-y-4">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-sm uppercase">Hitilafu Imetokea</h3>
        <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">{error || 'Imeshindwa kufungua nyaraka.'}</p>
        <button onClick={() => onNavigate('mitihani')} className="py-2 px-5 bg-slate-900 text-white font-bold text-xs rounded-xl">Rudi Kwenye Maktaba</button>
      </div>
    );
  }

  const isPremium = userProfile?.subscription === 'premium' || userProfile?.role === 'admin';

  return (
    <div id="reader-view" className="space-y-6 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* Upper Navigation Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <button 
          onClick={() => onNavigate('mitihani')}
          className="text-slate-500 hover:text-slate-900 font-bold text-xs flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Rudi Kwenye Maktaba
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border transition-all ${isBookmarked ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-slate-50 border-slate-150 text-slate-400 hover:text-slate-600'}`}
            title="Hifadhi"
          >
            <Bookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
          </button>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Kiungo cha ukurasa huu kimenakiliwa! Unaweza kuwashirikisha rafiki zako.');
            }}
            className="p-2 rounded-xl border bg-slate-50 border-slate-150 text-slate-400 hover:text-slate-600 transition-all"
            title="Shirikisha"
          >
            <Share2 size={15} />
          </button>

          <button 
            onClick={handleDownload}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              isPremium 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
            }`}
          >
            {isPremium ? (
              <>
                <Download size={14} /> Pakua PDF (Bure)
              </>
            ) : (
              <>
                <Lock size={14} /> Pakua (Premium)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Google Drive PDF Frame Viewer */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg relative h-[650px]">
            {/* Embedded interactive Google Drive Viewer iframe proxy */}
            <iframe 
              src={doc.driveUrl}
              className="w-full h-full border-0"
              title={doc.title}
              allowFullScreen
            ></iframe>

            {/* Non-premium download blocker floating panel */}
            {!isPremium && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 w-11/12 max-w-md backdrop-blur-sm z-10 animate-fade-in text-white text-xs">
                <Crown size={22} className="text-amber-400 flex-shrink-0 animate-bounce" />
                <div className="flex-grow space-y-0.5">
                  <p className="font-bold uppercase tracking-wider">Hali ya Msomaji: Bure</p>
                  <p className="text-slate-400 text-[10px] leading-snug font-semibold">Inaruhusiwa kusoma tu. Kupakua kumezuiliwa mpaka ujiunge na Lupanulla Premium.</p>
                </div>
                <button 
                  onClick={() => onNavigate('premium')}
                  className="bg-amber-400 text-amber-950 font-extrabold px-3 py-1.5 rounded-lg flex-shrink-0 text-[10px] uppercase"
                >
                  Premium &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Details and related tags */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] bg-cyan-50 border border-cyan-100 text-cyan-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase block w-fit">
              {doc.type || 'NECTA'} &bull; {doc.year || 2024}
            </span>
            <h2 className="font-display font-extrabold text-slate-950 text-base sm:text-lg leading-tight uppercase">{doc.title}</h2>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">{doc.description}</p>
            
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between"><span>Mada:</span> <span className="font-bold text-slate-950">{doc.category}</span></div>
              <div className="flex justify-between"><span>Ukubwa wa faili:</span> <span className="font-bold text-slate-950">{doc.sizeKB || 150} KB</span></div>
              <div className="flex justify-between"><span>Views:</span> <span className="font-bold text-slate-950">{doc.views + 1} views</span></div>
              <div className="flex justify-between"><span>Mchapishaji:</span> <span className="font-bold text-slate-950">{doc.uploadedByName || 'Lupanulla'}</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase">Lebo za Somo (Tags)</h4>
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map(t => (
                <span key={t} className="text-[10px] bg-slate-50 border border-slate-150 text-slate-500 font-bold px-2 py-0.5 rounded">#{t}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
