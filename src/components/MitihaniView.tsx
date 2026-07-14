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
  Printer,
  Clock,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { fetchDocuments, fetchExamResultByCode } from '../firebase';
import { DocumentMetadata, ExamResult } from '../types';
import { GoogleAdSenseUnit } from './MatangazoView';
import ExamTimer from './ExamTimer';

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
  const [sortBy, setSortBy] = useState<string>('subjectYear'); // 'subjectYear', 'newest', 'views', 'alphabetical'
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);

  // --- NEW: Exam Results Check States ---
  const [candidateCode, setCandidateCode] = useState<string>('');
  const [checkingResult, setCheckingResult] = useState<boolean>(false);
  const [checkedResult, setCheckedResult] = useState<ExamResult | null>(null);
  const [resultLookupError, setResultLookupError] = useState<string | null>(null);

  // --- NEW: NECTA Past Papers Library Wizard States & Configuration ---
  const [nectaWizardLevel, setNectaWizardLevel] = useState<string>('f4');
  const [nectaWizardSubject, setNectaWizardSubject] = useState<string>('physics');
  const [nectaWizardYear, setNectaWizardYear] = useState<string>('2023');

  const NECTA_LEVELS = [
    { id: 'std7', name: 'Darasa la 7 (PSLE)', description: 'Mitihani ya Kuhitimu Elimu ya Msingi' },
    { id: 'f2', name: 'Kidato cha 2 (FTSEE)', description: 'Upimaji wa Kitaifa Kidato cha Pili' },
    { id: 'f4', name: 'Kidato cha 4 (CSEE)', description: 'Mtihani wa Kuhitimu Elimu ya Sekondari' },
    { id: 'f6', name: 'Kidato cha 6 (ACSEE)', description: 'Mtihani wa Kidato cha Sita na Vyuo' },
  ];

  const NECTA_SUBJECTS: Record<string, { id: string; name: string }[]> = {
    std7: [
      { id: 'mathematics', name: 'Mathematics (Hisabati)' },
      { id: 'science', name: 'Science & Tech (Sayansi)' },
      { id: 'social-studies', name: 'Social Studies (Maarifa ya Jamii)' },
      { id: 'civic-moral', name: 'Civic & Moral (Uraia na Maadili)' },
      { id: 'english', name: 'English Language (Kiingereza)' },
      { id: 'kiswahili', name: 'Kiswahili' },
    ],
    f2: [
      { id: 'basic-math', name: 'Basic Mathematics' },
      { id: 'physics', name: 'Physics (Fizikia)' },
      { id: 'chemistry', name: 'Chemistry (Kemia)' },
      { id: 'biology', name: 'Biology (Biolojia)' },
      { id: 'geography', name: 'Geography (Jiografia)' },
      { id: 'history', name: 'History (Historia)' },
      { id: 'civics', name: 'Civics (Uraia)' },
      { id: 'english', name: 'English Language' },
      { id: 'kiswahili', name: 'Kiswahili' },
    ],
    f4: [
      { id: 'basic-math', name: 'Basic Mathematics' },
      { id: 'physics', name: 'Physics (Fizikia)' },
      { id: 'chemistry', name: 'Chemistry (Kemia)' },
      { id: 'biology', name: 'Biology (Biolojia)' },
      { id: 'geography', name: 'Geography (Jiografia)' },
      { id: 'history', name: 'History (Historia)' },
      { id: 'civics', name: 'Civics (Uraia)' },
      { id: 'english', name: 'English Language' },
      { id: 'kiswahili', name: 'Kiswahili' },
      { id: 'commerce', name: 'Commerce (Biashara)' },
      { id: 'bookkeeping', name: 'Book-keeping' },
    ],
    f6: [
      { id: 'physics', name: 'Physics (Fizikia)' },
      { id: 'chemistry', name: 'Chemistry (Kemia)' },
      { id: 'biology', name: 'Biology (Biolojia)' },
      { id: 'adv-math', name: 'Advanced Mathematics' },
      { id: 'geography', name: 'Geography (Jiografia)' },
      { id: 'history', name: 'History (Historia)' },
      { id: 'english', name: 'English Language' },
      { id: 'kiswahili', name: 'Kiswahili' },
      { id: 'general-studies', name: 'General Studies' },
    ],
  };

  const NECTA_YEARS = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'];

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
    },
    {
      id: 'mock-bio-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Biology 1',
      description: 'Official regional mock examination paper for Biology 1. Features high-quality questions on physiology, classification, genetics, ecology, and evolution aligned with the latest NECTA syllabus.',
      category: 'Science & Technology',
      tags: ['Biology', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-4',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1, // 1 day ago
      views: 1845,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 210,
      accent: 'border-green-400'
    },
    {
      id: 'uvinza-math-f1-2026',
      title: 'Uvinza District Council - Form One Terminal Joint Examination, May 2026 - Mathematics',
      description: 'Joint terminal examination for Form One students in Uvinza District. Covers branches of mathematics, fractions, weight, and profit calculations.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Form One', 'Terminal', 'Uvinza', '2026'],
      fileId: 'uvinza-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 45,
      status: 'approved',
      paperNo: 'Terminal',
      year: 2026,
      type: 'Terminal',
      sizeKB: 320,
      accent: 'border-cyan-500'
    },
    {
      id: 'chamwino-math-f1-2026',
      title: 'Chamwino District - Form One Terminal Examination - Basic Mathematics, May 2026',
      description: 'Standard terminal assessment for Form One candidates in Chamwino. Focuses on basic operations, rational numbers, and mathematical definitions.',
      category: 'Mathematics',
      tags: ['Basic Mathematics', 'Form One', 'Terminal', 'Chamwino', '2026'],
      fileId: 'chamwino-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 67,
      status: 'approved',
      paperNo: 'Terminal',
      year: 2026,
      type: 'Terminal',
      sizeKB: 290,
      accent: 'border-indigo-500'
    },
    {
      id: 'busega-math-f1-2026',
      title: 'Busega District Council - Form One Terminal Examination - Mathematics, May 2026',
      description: 'Regional terminal evaluation for Busega district. Includes significant figures, decimals, and algebraic simplifications.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Form One', 'Terminal', 'Busega', '2026'],
      fileId: 'busega-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 89,
      status: 'approved',
      paperNo: 'Terminal',
      year: 2026,
      type: 'Terminal',
      sizeKB: 310,
      accent: 'border-emerald-500'
    },
    {
      id: 'tulia-math-f1-2026',
      title: 'Dr. Tulia Ackson Secondary School - Form One Opening Examination, July 2026',
      description: 'Opening assessment for new Form One students. Covers branches of mathematics, rational numbers, and variable expressions.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Form One', 'Opening', 'Dr. Tulia Ackson', '2026'],
      fileId: 'tulia-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 110,
      status: 'approved',
      paperNo: 'Opening',
      year: 2026,
      type: 'Terminal',
      sizeKB: 275,
      accent: 'border-amber-600'
    },
    {
      id: 'mock-geo-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Geography',
      description: 'Official regional mock examination paper for Geography. Contains Section A (Multiple choice & matching), Section B (Map extract of Liwale 280/4 & statistical data representation), and Section C (consequences of manufacturing, poverty vs environmental degradation, and tourism).',
      category: 'Geography & Environment',
      tags: ['Geography', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-5',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.1,
      views: 1420,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 320,
      accent: 'border-cyan-400'
    },
    {
      id: 'mock-chem-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Chemistry 1',
      description: 'Official regional mock examination paper for Chemistry 1. Includes detailed questions on laboratory safety, organic compounds, electrochemistry, and chemical reactions.',
      category: 'Science & Technology',
      tags: ['Chemistry', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-6',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.2,
      views: 1680,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 285,
      accent: 'border-rose-400'
    },
    {
      id: 'mock-math-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Basic Mathematics',
      description: 'Official regional mock examination paper for Basic Mathematics. Covers algebra, set theory, vectors, coordinate geometry, trigonometry, and statistics.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-7',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.3,
      views: 2150,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 340,
      accent: 'border-amber-400'
    },
    {
      id: 'mock-pe-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Physical Education',
      description: 'Official regional mock examination paper for Physical Education. Examines gymnastics, swimming stroke order, relay zones, and sports injuries.',
      category: 'Physical Education & Sports',
      tags: ['Physical Education', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-8',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.4,
      views: 920,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 210,
      accent: 'border-purple-400'
    },
    {
      id: 'mock-phy-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Physics 1',
      description: 'Official regional mock examination paper for Physics 1. Features high-fidelity questions on mechanics, thermal physics, sound, magnetism, electronics, and waves.',
      category: 'Science & Technology',
      tags: ['Physics', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-9',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.5,
      views: 1950,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 310,
      accent: 'border-indigo-400'
    },
    {
      id: 'mock-chem2-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Chemistry 2 (Actual Practical)',
      description: 'Official regional mock practical examination paper for Chemistry 2. Consists of Question 1 (Volumetric analysis of Sodium Hydroxide contaminating a drinking water source) and Question 2 (Chemical kinetics of Sodium Thiosulphate and Hydrochloric acid reaction at different temperatures).',
      category: 'Science & Technology',
      tags: ['Chemistry', 'Practical', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-10',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.55,
      views: 1250,
      status: 'approved',
      paperNo: 'Paper 2',
      year: 2026,
      type: 'Mock',
      sizeKB: 290,
      accent: 'border-emerald-500'
    },
    {
      id: 'chem-practical-handout',
      title: 'Chemistry Practical Solutions - IV (Subject Handout)',
      description: 'A comprehensive chemistry practical guide prepared by Sir. Donny Company. Contains detailed volumetric analysis, rate of chemical reactions & equilibrium, qualitative analysis, balanced equations, tables of results, and calculation steps.',
      category: 'Science & Technology',
      tags: ['Chemistry', 'Practical', 'Handout', 'Guide', 'Form IV', 'NECTA'],
      fileId: 'sample-drive-id-chem-handout',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Sir. Donny',
      createdAt: Date.now() - 3600000 * 24 * 0.5,
      views: 2450,
      status: 'approved',
      paperNo: 'Practical Guide',
      year: 2026,
      type: 'Handout',
      sizeKB: 412,
      accent: 'border-cyan-500'
    },
    {
      id: 'mock-chinese-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Chinese Language',
      description: 'Official regional mock examination paper for Chinese Language. Covers Pinyin, character translation, comprehension reading, matching patterns, and short composition writing topics.',
      category: 'Languages & Linguistics',
      tags: ['Chinese', 'Mock', 'Morogoro', '2026', 'Form IV', 'Language'],
      fileId: 'sample-drive-id-11',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.6,
      views: 840,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 320,
      accent: 'border-red-500'
    },
    {
      id: 'mock-civics-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Civics',
      description: 'Official regional mock examination paper for Civics. Evaluates human rights, courtship systems, cultural practices, local government roles, globalization effects, and reproductive education.',
      category: 'History & Humanities',
      tags: ['Civics', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-12',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.65,
      views: 1100,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 195,
      accent: 'border-blue-500'
    },
    {
      id: 'mock-commerce-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Commerce',
      description: 'Official regional mock examination paper for Commerce. Includes calculations on stock turnover, cost of goods sold, gross profit markup, business risk management, partnership categories, and taxation systems.',
      category: 'Business & Economics',
      tags: ['Commerce', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-13',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.7,
      views: 950,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 230,
      accent: 'border-amber-500'
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

  const getDocSubject = (doc: DocumentMetadata) => {
    if (doc.subject) return doc.subject;
    // Look through standard subjects
    const subjects = [
      'Mathematics', 'Basic Mathematics', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 
      'History', 'Geography', 'Civics', 'English', 'Kiswahili', 'Commerce', 'Bookkeeping', 'Physical Education', 'Chinese'
    ];
    for (const s of subjects) {
      if (
        doc.title.toLowerCase().includes(s.toLowerCase()) || 
        doc.tags.some(t => t.toLowerCase() === s.toLowerCase() || t.toLowerCase().includes(s.toLowerCase()))
      ) {
        // Normalize names
        if (s.toLowerCase().includes('math')) return 'Mathematics (Hisabati)';
        if (s.toLowerCase().includes('phy')) return 'Physics (Fizikia)';
        if (s.toLowerCase().includes('chem')) return 'Chemistry (Kemia)';
        if (s.toLowerCase().includes('bio')) return 'Biology (Biolojia)';
        if (s.toLowerCase().includes('hist')) return 'History (Historia)';
        if (s.toLowerCase().includes('geo')) return 'Geography (Jiografia)';
        if (s.toLowerCase().includes('civ')) return 'Civics (Uraia)';
        if (s.toLowerCase().includes('eng')) return 'English Language';
        if (s.toLowerCase().includes('kisw')) return 'Kiswahili';
        if (s.toLowerCase().includes('comm')) return 'Commerce (Biashara)';
        if (s.toLowerCase().includes('book')) return 'Book-keeping';
        return s;
      }
    }
    return doc.category || 'Masomo Mengine';
  };

  // Sort application
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'subjectYear') {
      const subA = getDocSubject(a);
      const subB = getDocSubject(b);
      const subCompare = subA.localeCompare(subB);
      if (subCompare !== 0) return subCompare;
      
      const yrA = a.year || (a.tags.includes('2023') ? 2023 : a.tags.includes('2022') ? 2022 : a.tags.includes('2024') ? 2024 : 2026);
      const yrB = b.year || (b.tags.includes('2023') ? 2023 : b.tags.includes('2022') ? 2022 : b.tags.includes('2024') ? 2024 : 2026);
      return yrB - yrA; // Newer year first
    } else if (sortBy === 'newest') {
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
    <div id="mitihani-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 relative">
      {/* Exam Timer Floating Widget */}
      {showTimer && <ExamTimer onClose={() => setShowTimer(false)} />}
      
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
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button 
              onClick={() => setShowTimer(!showTimer)}
              className={`font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md ${
                showTimer 
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Clock size={16} /> 
              {showTimer ? 'Funga Kipima Muda' : 'Kipima Muda (Timer)'}
            </button>

            <button 
              onClick={() => onNavigate('upload')}
              className="bg-white text-slate-900 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus size={16} /> Pakia Mtihani Mpya
            </button>
          </div>
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

        <div className="flex flex-wrap gap-2 items-center text-[10px] text-slate-400 font-bold">
          <span>Namba za majaribio ya haraka (Mifano):</span>
          <button
            type="button"
            onClick={() => setCandidateCode('S0101/0001/2026')}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md border border-slate-200 font-mono transition-colors cursor-pointer"
          >
            S0101/0001/2026
          </button>
          <button
            type="button"
            onClick={() => setCandidateCode('S0101/0002/2026')}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md border border-slate-200 font-mono transition-colors cursor-pointer"
          >
            S0101/0002/2026
          </button>
        </div>

        {/* Info Block */}
        <div className="bg-indigo-50/45 border border-indigo-100 rounded-2xl p-4 max-w-xl text-xs space-y-1.5 text-indigo-950 font-medium">
          <p className="font-extrabold uppercase text-[10px] text-indigo-700 tracking-wider">Matokeo yanayopatikana sasa:</p>
          <ul className="list-disc list-inside space-y-0.5 text-indigo-900 font-semibold">
            <li>Form IV NECTA Mock Examinations (2026)</li>
            <li>Form IV NECTA Terminal (2026)</li>
          </ul>
        </div>

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
                  {checkedResult.subjects.map((sub, idx) => {
                    const g = sub.grade.trim().toUpperCase();
                    const badgeClass = g === 'A' ? 'bg-green-100 text-green-800 border-green-200' :
                                       g === 'B' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                       g === 'C' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                       g === 'D' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                       'bg-rose-100 text-rose-800 border-rose-200';
                    return (
                      <div key={idx} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/50">
                        <span className="font-bold text-slate-700">{sub.subject}</span>
                        <div className="flex gap-12 font-mono items-center">
                          <span className="text-slate-500 w-8 text-right font-bold">{sub.score}%</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border text-center w-24 ${badgeClass}`}>
                            Grade {sub.grade}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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

      {/* ── NEW: Maktaba Kuu ya Past Papers za NECTA (TETEA Direct) ── */}
      <section id="necta-past-papers-center" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-cyan-500/15 text-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-400/30">
              <BookOpen size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-black text-white text-base uppercase tracking-tight">Kituo Kikuu cha Past Papers za NECTA (Maktaba ya Taifa)</h2>
              <p className="text-xs text-slate-300">Pata mitihani yote ya kitaifa (NECTA) kwa miaka yote, masomo yote, na ngazi zote za elimu papo hapo!</p>
            </div>
          </div>
          <span className="self-start sm:self-auto bg-cyan-500/10 text-cyan-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            TETEA Integration Active
          </span>
        </div>

        {/* Wizard step selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Step 1: Select Level */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Hatua ya 1: Chagua Ngazi ya Elimu</span>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {NECTA_LEVELS.map((lvl) => {
                const isActive = nectaWizardLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setNectaWizardLevel(lvl.id);
                      // Default to the first subject of that level to keep state valid
                      const subs = NECTA_SUBJECTS[lvl.id] || [];
                      if (subs.length > 0) {
                        setNectaWizardSubject(subs[0].id);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/45 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs uppercase">{lvl.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{lvl.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Subject */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Hatua ya 2: Chagua Somo</span>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {(NECTA_SUBJECTS[nectaWizardLevel] || []).map((sub) => {
                const isActive = nectaWizardSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setNectaWizardSubject(sub.id)}
                    className={`text-center p-2.5 rounded-xl border text-xs font-bold transition-all line-clamp-2 min-h-[46px] flex items-center justify-center cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow' 
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/30'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Select Year */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Hatua ya 3: Chagua Mwaka wa Mtihani</span>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {NECTA_YEARS.map((yr) => {
                const isActive = nectaWizardYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setNectaWizardYear(yr)}
                    className={`py-2 px-1 rounded-lg border text-[11px] font-mono font-bold transition-all text-center cursor-pointer ${
                      isActive 
                        ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md font-black' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/30'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Selected past paper detail card */}
        {nectaWizardLevel && nectaWizardSubject && nectaWizardYear && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 animate-fade-in mt-2">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded">
                  NECTA NATIONAL EXAM
                </span>
                <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded">
                  MWAKA {nectaWizardYear}
                </span>
              </div>
              <h3 className="font-sans font-black text-white text-base sm:text-lg leading-tight">
                NECTA {NECTA_SUBJECTS[nectaWizardLevel]?.find(s => s.id === nectaWizardSubject)?.name || nectaWizardSubject} - {NECTA_LEVELS.find(l => l.id === nectaWizardLevel)?.name || nectaWizardLevel} Past Paper ({nectaWizardYear})
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Huu ni mtihani rasmi wa taifa wa NECTA uliotahiniwa mwaka wa {nectaWizardYear}. Unaweza kusoma mtandaoni kupitia PDF viewer yetu mahiri au kupakua PDF rasmi bure kwa ajili ya kujisomea offline.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch gap-3 shrink-0 justify-center">
              <button
                type="button"
                onClick={() => {
                  const docId = `necta-${nectaWizardLevel}-${nectaWizardSubject}-${nectaWizardYear}`;
                  onNavigate('reader', docId);
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
              >
                <Eye size={15} />
                Soma Mtandaoni
              </button>

              <button
                type="button"
                onClick={() => {
                  // Direct PDF URL download on TETEA
                  const maktabaLevel = nectaWizardLevel === 'std7' ? 'psle' :
                                       nectaWizardLevel === 'std4' ? 'sf' :
                                       nectaWizardLevel === 'f2' ? 'ftsee' :
                                       nectaWizardLevel === 'f4' ? 'csee' : 'acsee';
                  const maktabaSubject = nectaWizardSubject === 'basic-math' ? 'basic-math' :
                                         nectaWizardSubject === 'adv-math' ? 'adv-math' :
                                         nectaWizardSubject === 'kiswahili' ? 'kiswahili' :
                                         nectaWizardSubject === 'english' ? 'english' : nectaWizardSubject;
                  let fileSubject = nectaWizardSubject === 'basic-math' ? 'Basic-Mathematics' :
                                    nectaWizardSubject === 'adv-math' ? 'Advanced-Mathematics' :
                                    nectaWizardSubject === 'kiswahili' ? 'Kiswahili' :
                                    nectaWizardSubject === 'english' ? 'English-Language' :
                                    nectaWizardSubject === 'science' ? 'Science-and-Technology' :
                                    nectaWizardSubject === 'social-studies' ? 'Social-Studies' :
                                    nectaWizardSubject === 'civic-moral' ? 'Civic-and-Moral-Education' :
                                    nectaWizardSubject === 'mathematics' ? 'Mathematics' :
                                    nectaWizardSubject.charAt(0).toUpperCase() + nectaWizardSubject.slice(1);
                  let paperSuffix = '';
                  if (nectaWizardLevel === 'f4' || nectaWizardLevel === 'f6') {
                    if (!['basic-math', 'civics', 'kiswahili', 'bookkeeping'].includes(nectaWizardSubject)) {
                      paperSuffix = '-1';
                    }
                  }
                  const directUrl = `https://maktaba.tetea.org/past-papers/${maktabaLevel}/${maktabaSubject}/${fileSubject}${paperSuffix}-${nectaWizardYear}.pdf`;
                  window.open(directUrl, '_blank');
                  alert('📥 Upakuaji umeanza! Faili linapakuliwa kutoka Maktaba ya TETEA sasa hivi.');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
              >
                <Download size={15} />
                Pakua PDF (TETEA Direct)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTimer(true);
                  alert(`⏱️ Kipima muda kimeanzishwa! Una dakika 180 (Masaa 3) kufanya mtihani wa NECTA ${nectaWizardYear}. Unaweza kuona saa inayorudi nyuma juu ya skrini yako sasa.`);
                }}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
              >
                <Clock size={15} />
                Zoezi la Saa (Timer)
              </button>
            </div>
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
              <option value="subjectYear">Somo na Mwaka (A-Z, 2026-2010)</option>
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
          sortBy === 'subjectYear' ? (
            <div className="space-y-10">
              {Object.entries(
                sortedDocs.reduce((acc, doc) => {
                  const sub = getDocSubject(doc);
                  if (!acc[sub]) acc[sub] = [];
                  acc[sub].push(doc);
                  return acc;
                }, {} as Record<string, DocumentMetadata[]>)
              ).map(([subject, docs]) => (
                <div key={subject} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <BookOpen size={18} className="text-cyan-600" />
                    <h3 className="font-display font-extrabold text-slate-950 text-base uppercase tracking-tight">
                      {subject} <span className="text-slate-400 font-mono text-xs font-normal">({docs.length} {docs.length === 1 ? 'mtihani' : 'mitihani'})</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map((doc) => {
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
                </div>
              ))}
            </div>
          ) : (
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
          )
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

      {/* ── Footer Copyright ── */}
      <footer className="pt-10 pb-6 border-t border-slate-200 text-center space-y-2">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
          © 2026 Lupanulla Foundation. Haki miliki zote zimehifadhiwa na kulindwa.
        </p>
        <p className="text-[9px] text-slate-300 italic max-w-md mx-auto">
          Maudhui haya ya mitihani yanatolewa kwa madhumuni ya kitaaluma pekee kusaidia wanafunzi wa Kitanzania katika maandalizi yao ya mitihani.
        </p>
      </footer>
    </div>
  );
}
