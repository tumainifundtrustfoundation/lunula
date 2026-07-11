import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Search, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Sliders, 
  Maximize2,
  FileText,
  AlertCircle,
  Eye,
  Settings,
  Highlighter,
  Check,
  Sparkles,
  Download,
  Info
} from 'lucide-react';

interface PDFPreviewerProps {
  documentId: string;
  documentTitle: string;
  driveUrl: string;
  category?: string;
  year?: number;
  type?: string;
  onSelectText?: (text: string) => void;
}

interface PageData {
  pageNumber: number;
  title: string;
  content: React.ReactNode;
  rawText: string; // Used for text search feature
}

export default function PDFPreviewer({ 
  documentId, 
  documentTitle, 
  driveUrl, 
  category, 
  year, 
  type,
  onSelectText
}: PDFPreviewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOccurrences, setSearchOccurrences] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'interactive' | 'iframe'>('interactive');
  
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Rotate clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25));
  const handleZoomReset = () => setZoom(100);

  // Reset page when document changes
  useEffect(() => {
    setCurrentPage(1);
    setRotation(0);
    setSearchQuery('');
  }, [documentId]);

  // High-fidelity page content database
  const documentPages = useMemo((): PageData[] => {
    // 1. Morogoro Biology Mock Exam 2026
    if (documentId === 'mock-bio-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & General Info",
          rawText: "PRESIDENT'S OFFICE REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT MOROGORO REGION REGIONAL FORM FOUR MOCK EXAMINATION 2026 BIOLOGY 1 INSTRUCTIONS",
          content: (
            <div className="space-y-6">
              {/* Exam Header */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-cyan-600/10 rounded-xl px-4 inline-block my-2 border border-cyan-500/20">
                  <span className="text-sm font-black text-cyan-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>033/1 BIOLOGY 1</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="border-2 border-slate-900 rounded-2xl p-5 space-y-4 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-300 pb-2">
                  <Info size={14} className="text-slate-700" /> INSTRUCTIONS / MAELEKEZO
                </h3>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2.5 font-medium leading-relaxed">
                  <li>
                    This paper consists of sections <strong>A</strong>, <strong>B</strong> and <strong>C</strong> with a total of eleven (11) questions.
                    <br /><span className="text-slate-500 italic">Karatasi hii ina sehemu A, B na C zenye jumla ya maswali kumi na moja (11).</span>
                  </li>
                  <li>
                    Answer <strong>all</strong> questions in sections A and B and <strong>one (1)</strong> question from section C.
                    <br /><span className="text-slate-500 italic">Jibu maswali yote katika sehemu A na B, na swali moja (1) kutoka sehemu C.</span>
                  </li>
                  <li>
                    Except for diagrams, all writing must be in <strong>blue or black</strong> ink.
                    <br /><span className="text-slate-500 italic">Isipokuwa kwa michoro, majibu yote yaandikwe kwa wino wa bluu au mweusi.</span>
                  </li>
                  <li>
                    Calculators, cellular phones and any unauthorized materials are <strong>not allowed</strong> in the examination room.
                    <br /><span className="text-slate-500 italic">Vikokotoo, simu za mkononi na vifaa visivyoruhusiwa haviruhusiwi ndani ya chumba cha mtihani.</span>
                  </li>
                  <li>
                    Write your <strong>Candidate Number</strong> on every page of your answer booklet(s).
                    <br /><span className="text-slate-500 italic">Andika Namba yako ya Mtihani kwenye kila ukurasa wa kijitabu chako cha majibu.</span>
                  </li>
                </ol>
              </div>

              {/* Lupanulla branding watermark */}
              <div className="pt-24 text-center border-t border-dashed border-slate-200">
                <span className="text-[10px] font-black tracking-widest text-cyan-500/40 uppercase">LUPANULLA SMART STUDY PORTAL</span>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">UKURASA WA 1 KATI YA 4</p>
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section A (Questions 1 - 2)",
          rawText: "SECTION A 16 Marks Lamarckism theory Darwinism theory Creation theory Speciation theory Experimental group Control group Variable group Treatment group Meningococcus sp. Plasmodium falciparum Salmonella typhi Mycobacterium tuberculosis Gametogenesis Maturation stage Growth stage Multiplication stage Fertilization stage Test cross Monohybrid cross Dihybrid cross Recipient blood group O AB Agglutination antibodies a and b antigen O Recipient blood group has no antibody Donor blood has no antigen",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-3">
                <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">033/1 BIOLOGY 1</span>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mt-0.5">SECTION A (16 Marks)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ANSWER ALL QUESTIONS IN THIS SECTION / JIBU MASWALI YOTE SEHEMU HII</p>
              </div>

              {/* Question 1 */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-950">
                  1. For each of the items (i) - (vi), choose the correct answer from among the given alternatives and write its letter in the answer booklet provided. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>

                <div className="space-y-4 pl-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (i) Which of the following theories of evolution states that organisms acquire characteristics during their lifetime in response to their environment and pass them to their offspring?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Lamarckism theory</span>
                      <span>B. Darwinism theory</span>
                      <span>C. Creation theory</span>
                      <span>D. Speciation theory</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (ii) In an experiment, a student set up two groups of plants. Group X was given nitrogen fertilizer while Group Y was not. Which of the following represents Group Y (without fertilizer) in this experiment?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Experimental group</span>
                      <span>B. Control group</span>
                      <span>C. Variable group</span>
                      <span>D. Treatment group</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (iii) A patient was admitted to hospital presenting symptoms of high fever, stiff neck, seizures, and delirium. Clinical tests confirmed that the cerebrospinal fluid contained bacteria. Which of the following organisms was likely responsible?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span className="text-indigo-600 font-bold">A. Meningococcus sp.</span>
                      <span>B. Plasmodium falciparum</span>
                      <span>C. Salmonella typhi</span>
                      <span>D. Mycobacterium tuberculosis</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (iv) Gametogenesis in animals involves stages of cell division and growth. In which stage of gametogenesis do cells undergo rapid mitotic division to increase in number?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Maturation stage</span>
                      <span>B. Growth stage</span>
                      <span className="text-indigo-600 font-bold">C. Multiplication stage</span>
                      <span>D. Fertilization stage</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (v) A geneticist wanted to determine whether a black mouse had a homozygous (BB) or heterozygous (Bb) genotype. She crossed the black mouse with a homozygous recessive brown mouse (bb). What type of cross is this?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Monohybrid cross</span>
                      <span>B. Dihybrid cross</span>
                      <span className="text-indigo-600 font-bold">C. Test cross</span>
                      <span>D. F1 generation cross</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (vi) If a person of blood group O is transfused with blood from a donor of blood group AB, agglutination occurs. This is because:
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span className="text-indigo-600 font-bold">A. Recipient blood has antibodies a and b</span>
                      <span>B. Recipient blood has antigen O</span>
                      <span>C. Recipient blood has no antibody</span>
                      <span>D. Donor blood has no antigen</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 4
              </div>
            </div>
          )
        },
        {
          pageNumber: 3,
          title: "Page 3: Section A Match & Section B (Q3 - Q5)",
          rawText: "SECTION B 54 Marks Spermatogenesis Epididymis Seminiferous tubules Prostate gland Oviduct Fallopian tube Vas deferens Urethra plant classification botanical names instead of local names animal cell solution hypotonic isotonic hypertonic plant cell undergoing plasmolysis",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-3">
                <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">033/1 BIOLOGY 1</span>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mt-0.5">SECTION A &amp; B (Questions 2 - 5)</h3>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-950">
                  2. Match the descriptions of male reproductive system and processes in List A with the corresponding terms in List B by writing the letter of the correct response in your answer booklet. <span className="text-slate-500 font-semibold">(10 Marks)</span>
                </p>

                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-100 font-black text-slate-800 text-[10px] uppercase tracking-wider py-2 border-b border-slate-300">
                    <div className="col-span-7 px-3">List A: Description</div>
                    <div className="col-span-5 px-3 border-l border-slate-300">List B: Structure</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(i) Spermatogenesis occurs under stimulation of follicle stimulating hormone (FSH)</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">A. Epididymis</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(ii) Sperms acquire motility and are stored temporarily</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">B. Seminiferous tubules</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(iii) Secretes alkaline fluid that neutralizes vaginal acidity</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">C. Prostate gland</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(iv) Direct site for fertilization where zygote formation takes place</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">D. Oviduct / Fallopian tube</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700"></div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">E. Vas deferens</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section B Heading */}
              <div className="border-t border-slate-300 pt-4">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION B (54 Marks)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ANSWER ALL QUESTIONS IN THIS SECTION / JIBU MASWALI YOTE</p>
              </div>

              {/* Question 3 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  3. (a) State the three main principles used in modern plant classification. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Give three reasons why modern scientists prefer using botanical names instead of local names. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
              </div>

              {/* Question 4 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  4. (a) Explain what would happen when an animal cell is placed in: <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
                <ol className="list-roman pl-5 font-semibold text-slate-700 space-y-1">
                  <li>Solution I (Hypotonic solution)</li>
                  <li>Solution II (Isotonic solution)</li>
                  <li>Solution III (Hypertonic solution)</li>
                </ol>
                <p className="font-bold text-slate-950 pt-1">
                  (b) Draw a well-labeled diagram of a plant cell undergoing plasmolysis. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
              </div>

              {/* Question 5 */}
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-950">
                  5. (a) Name three excretory products in plants and explain how they are eliminated. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Contrast between excretion in plants and excretion in animals. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
              </div>

              {/* Pagination footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 3 KATI YA 4
              </div>
            </div>
          )
        },
        {
          pageNumber: 4,
          title: "Page 4: Section B & C (Q6 - Q11)",
          rawText: "SECTION C 30 Marks carbohydrate metabolism glycogenesis glycogenolysis DNA and RNA growth development plastic bag pollution Tanzania insect successful evolutionary success palaeontology comparative anatomy embryology evidence supporting evolution",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-3">
                <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">033/1 BIOLOGY 1</span>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mt-0.5">SECTION B (Continued) &amp; SECTION C (30 Marks)</h3>
              </div>

              {/* Question 6 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  6. (a) Describe the role of liver in carbohydrate metabolism, specifically touching on glycogenesis and glycogenolysis. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Explain how insulin regulates blood glucose levels in the human body. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
              </div>

              {/* Question 7 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  7. (a) Outline three differences between DNA and RNA. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Explain how the double helix structure of DNA allows it to replicate itself with high precision. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
              </div>

              {/* Question 8 */}
              <div className="space-y-2 text-xs pb-4 border-b border-slate-200">
                <p className="font-bold text-slate-950">
                  8. (a) Define the terms 'growth' and 'development' as applied in biology. <span className="text-slate-500 font-semibold">(4 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Discuss the environmental factors that influence human growth and development. <span className="text-slate-500 font-semibold">(5 Marks)</span>
                </p>
              </div>

              {/* Section C Heading */}
              <div className="pt-2">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION C (30 Marks)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ANSWER ONE (1) QUESTION FROM THIS SECTION / JIBU SWALI MOJA TU SEHEMU HII</p>
              </div>

              {/* Questions 9, 10, 11 */}
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-950">
                    9. Plastics are a major threat to terrestrial and aquatic ecosystems. Discuss the ecological impacts of plastic bag pollution in Tanzania and suggest four control measures. <span className="text-slate-500 font-semibold">(30 Marks)</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-950">
                    10. Class Insecta is the most successful and diverse group of animals on earth. Explain five physiological and structural reasons that contribute to their outstanding evolutionary success. <span className="text-slate-500 font-semibold">(30 Marks)</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-950">
                    11. "Evolution is a continuous and slow biological process." Discuss the scientific evidence supporting this statement from palaeontology (fossils), comparative anatomy, and comparative embryology. <span className="text-slate-500 font-semibold">(30 Marks)</span>
                  </p>
                </div>
              </div>

              {/* Pagination footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 4 KATI YA 4
              </div>
            </div>
          )
        }
      ];
    }

    // Default template for other documents (e.g., Physics, Maths, History or any other PDF file)
    const titleUpper = documentTitle.toUpperCase();
    const docCategory = category || 'Elimu Hub Study Resource';
    const docYear = year || 2024;
    const docType = type || 'Past Paper';

    return [
      {
        pageNumber: 1,
        title: "Page 1: Instructions & General Info",
        rawText: `LUPANULLA ELIMU HUB EXAM PREVIEW ${titleUpper} INSTRUCTIONS`,
        content: (
          <div className="space-y-6">
            <div className="text-center space-y-2 pb-6 border-b border-slate-300">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
              <p className="text-xs font-black text-slate-700 tracking-wide uppercase">LUPANULLA FOUNDATION STUDY PORTAL</p>
              <div className="py-1 bg-cyan-600/10 rounded-xl px-4 inline-block my-2 border border-cyan-500/20">
                <span className="text-sm font-black text-cyan-800 tracking-wider uppercase">{docCategory}</span>
              </div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{titleUpper}</h2>
              <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                <span>{docType} - {docYear}</span>
                <span>TIME: 3:00 Hours</span>
              </div>
            </div>

            <div className="border-2 border-slate-900 rounded-2xl p-5 space-y-4 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-300 pb-2">
                <Info size={14} className="text-slate-700" /> INSTRUCTIONS / MAELEKEZO
              </h3>
              <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2 font-medium leading-relaxed">
                <li>This document has been compiled and optimized by Lupanulla AI for dynamic browser previews.</li>
                <li>Answer all required academic exercises or exam questions outlined.</li>
                <li>Use the toolbar above to search for keywords, zoom, or toggle comfortable sepia/night reading modes.</li>
                <li>Click the "Download PDF" button to download the full, pristine PDF file from the cloud folder.</li>
              </ol>
            </div>

            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex gap-3 text-xs text-cyan-800 mt-6">
              <Sparkles className="text-cyan-500 flex-shrink-0" size={16} />
              <div className="space-y-1">
                <p className="font-black">💡 NOTISI MAHIRI ZIMEANDALIWA!</p>
                <p className="font-semibold leading-relaxed text-slate-600">
                  Unaweza pia kufungua tab ya pili ya "Notisi Mahiri (Smart Notes)" kupitia tab iliyo juu ili kusoma muhtasari fupi wenye uwezo wa kuweka highlights na maelezo yako ya kibinafsi.
                </p>
              </div>
            </div>

            <div className="pt-20 text-center border-t border-dashed border-slate-200">
              <span className="text-[9px] font-black tracking-widest text-cyan-500/40 uppercase">LUPANULLA ELIMU HUB</span>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">PAGE 1 OF 3</p>
            </div>
          </div>
        )
      },
      {
        pageNumber: 2,
        title: "Page 2: Exam Questions & Core Concepts",
        rawText: `SECTION A COMPULSORY QUESTIONS STUDY CONCEPTS`,
        content: (
          <div className="space-y-6">
            <div className="border-b border-slate-300 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION A (Core Academic Content)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">COMPULSORY QUESTIONS / MASWALI YA LAZIMA</p>
            </div>

            <div className="space-y-6 text-xs text-slate-700 font-semibold leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 1</span>
                <p className="text-slate-900 font-bold">Describe the main theoretical models associated with this topic, specifically detailing: </p>
                <ul className="list-disc pl-5 font-medium space-y-1 text-slate-600">
                  <li>Key definitions and scientific postulates.</li>
                  <li>How this applies in solving practical physics or mathematical problems in Tanzania.</li>
                  <li>Common misconceptions and how to avoid them in national NECTA exams.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 2</span>
                <p className="text-slate-900 font-bold">Contrast and compare the primary systems described in the syllabus. Give clear, labeled diagrams where necessary to illustrate the structural differences.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 3</span>
                <p className="text-slate-900 font-bold">A laboratory experiment was conducted with varying parameters. Discuss the expected results, variables, control mechanisms and graph trends.</p>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
              PAGE 2 OF 3
            </div>
          </div>
        )
      },
      {
        pageNumber: 3,
        title: "Page 3: Extended & Essay Questions",
        rawText: `SECTION B ESSAY QUESTIONS DETAILED SOLUTIONS`,
        content: (
          <div className="space-y-6">
            <div className="border-b border-slate-300 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION B (Extended Essays)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">CHOOSE AND ANSWER ONE QUESTION / JIBU SWALI MOJA TU SEHEMU HII</p>
            </div>

            <div className="space-y-4 text-xs font-semibold leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 4 (ESSAY)</span>
                <p className="text-slate-900 font-bold">Analyze the socio-economic and scientific implications of technological advancements in the Tanzanian community. Formulate five key arguments and justify with realistic case studies.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 5 (ESSAY)</span>
                <p className="text-slate-900 font-bold">Formulate a comprehensive plan for resource management in secondary schools. Address funding, material quality, and student motivation strategies.</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-xs text-amber-800">
              <Info className="text-amber-600 flex-shrink-0" size={16} />
              <p className="font-medium">
                <strong>Msaada wa Lupanulla AI:</strong> Je, unaona ugumu kupata majibu sahihi au kufanya marekebisho (marking scheme) ya karatasi hii? Bonyeza kitufe cha "Tengeneza Flashcards" au fungua "Notisi Mahiri" ili kupata msaada wa haraka sasa.
              </p>
            </div>

            <div className="pt-10 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
              PAGE 3 OF 3
            </div>
          </div>
        )
      }
    ];
  }, [documentId, documentTitle, category, year, type]);

  // Handle Search highlight inside the rawText of pages
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchOccurrences(0);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    let count = 0;
    documentPages.forEach((page) => {
      const text = page.rawText.toLowerCase();
      let pos = text.indexOf(query);
      while (pos !== -1) {
        count++;
        pos = text.indexOf(query, pos + 1);
      }
    });
    setSearchOccurrences(count);
  }, [searchQuery, documentPages]);

  // Capture text selection in the document viewer
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && onSelectText) {
      const selected = selection.toString().trim();
      if (selected.length > 0) {
        onSelectText(selected);
      }
    }
  };

  // Active styles based on theme selection
  const themeClasses = {
    light: 'bg-white text-slate-800 shadow-slate-100 border-slate-200',
    sepia: 'bg-[#fbf0db] text-[#5c4033] shadow-amber-100/30 border-[#eadaa6]',
    dark: 'bg-slate-900 text-slate-100 shadow-slate-950/40 border-slate-800'
  };

  const wrapperThemeClasses = {
    light: 'bg-slate-100/80',
    sepia: 'bg-[#f4ebd0]',
    dark: 'bg-slate-950'
  };

  const renderActivePage = () => {
    const page = documentPages.find(p => p.pageNumber === currentPage);
    if (!page) return <div className="text-center py-10">Page not found</div>;
    return page.content;
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-[740px] relative">
      
      {/* Upper Navigation / Toolbar inside the PDF Reader */}
      <div className="bg-slate-900 text-slate-100 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 z-10">
        
        {/* Left Side: Name and Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center border border-cyan-500/20 shrink-0">
            <BookOpen size={16} />
          </div>
          <div>
            <h4 className="font-sans font-black text-xs text-white max-w-[160px] sm:max-w-[280px] truncate leading-tight uppercase">
              {documentTitle}
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase mt-0.5">
              <span>Smart PDF Previewer</span>
              <span>•</span>
              <span className="text-cyan-400">Ver. 2026 HD</span>
            </div>
          </div>
        </div>

        {/* Middle: Render View Toggle (Interactive vs. direct iframe) */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 border border-slate-700">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'interactive' ? 'bg-cyan-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={12} /> Interactive HD Reader
          </button>
          <button
            onClick={() => setViewMode('iframe')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'iframe' ? 'bg-cyan-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye size={12} /> Direct PDF File
          </button>
        </div>

        {/* Right side: Toolbar Action Buttons */}
        {viewMode === 'interactive' && (
          <div className="flex items-center gap-2">
            
            {/* Sidebar toggle */}
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-lg transition-all border ${
                showSidebar ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-transparent border-transparent text-slate-400 hover:text-white'
              }`}
              title="Toggle Sidebar Pages"
            >
              <FileText size={15} />
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden text-xs">
              <button 
                onClick={handleZoomOut} 
                className="p-2 text-slate-400 hover:text-white border-r border-slate-700 hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <button 
                onClick={handleZoomReset}
                className="px-2 font-mono text-[10px] font-extrabold text-slate-300 hover:text-white"
                title="Reset Zoom to 100%"
              >
                {zoom}%
              </button>
              <button 
                onClick={handleZoomIn} 
                className="p-2 text-slate-400 hover:text-white border-l border-slate-700 hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Rotate */}
            <button 
              onClick={handleRotate}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
              title="Rotate Page Clockwise"
            >
              <RotateCw size={13} />
            </button>

            {/* Themes */}
            <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
              {(['light', 'sepia', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    theme === t 
                      ? 'bg-slate-700 text-cyan-400 shadow-sm font-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Reading Theme: ${t.toUpperCase()}`}
                >
                  {t === 'light' && <Sun size={12} />}
                  {t === 'sepia' && <span className="font-mono text-[9px] font-black uppercase">S</span>}
                  {t === 'dark' && <Moon size={12} />}
                </button>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {viewMode === 'iframe' ? (
          <div className="w-full h-full bg-slate-900 relative">
            <iframe 
              src={driveUrl}
              className="w-full h-full border-0"
              title={documentTitle}
              allowFullScreen
            ></iframe>
            {/* Disclaimer float */}
            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-[10px] font-semibold text-slate-300 max-w-xs shadow-lg backdrop-blur-sm">
              ℹ️ Hali ya Direct Preview: Iframe hii inapakia moja kwa moja kutoka Google Drive. Ikishindwa kuonekana, bofya "Interactive HD Reader" juu ili kutumia toleo letu la haraka na lenye zana za kusomea.
            </div>
          </div>
        ) : (
          <>
            {/* Left Page-List Sidebar */}
            {showSidebar && (
              <div className="w-56 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col p-4 gap-3">
                <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Karatasi &bull; Kurasa {documentPages.length}</span>
                <div className="space-y-2">
                  {documentPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      onClick={() => setCurrentPage(page.pageNumber)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        currentPage === page.pageNumber
                          ? 'bg-cyan-50 border-cyan-400 shadow-sm text-cyan-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className={currentPage === page.pageNumber ? 'text-cyan-600' : 'text-slate-400'} />
                        <span className="text-[10px] font-extrabold uppercase truncate tracking-tight">{page.title}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-semibold mt-1">Ukurasa {page.pageNumber}</div>
                    </div>
                  ))}
                </div>

                {/* Annotation guide info box */}
                <div className="mt-auto bg-cyan-50/50 border border-cyan-100 rounded-xl p-3 text-[10px] font-medium leading-relaxed text-cyan-800 space-y-1">
                  <span className="font-extrabold uppercase text-[9px] tracking-wide block">💡 TIP YA MSOMAJI:</span>
                  <p>Unaweza kuchagua maandishi yoyote ndani ya mtihani kisha bofya <strong>"Highlight"</strong> au <strong>"Annotate"</strong> kwenye upande wa kulia ili kuhifadhi nota zako za kujisomea.</p>
                </div>
              </div>
            )}

            {/* Central Work Space (Document Page Canvas) */}
            <div className={`flex-1 overflow-auto p-6 flex flex-col items-center ${wrapperThemeClasses[theme]} transition-colors duration-300 relative`}>
              
              {/* Floating Inline Search Bar within Viewer */}
              <div className="absolute top-4 right-4 z-10 flex items-center bg-slate-950/90 backdrop-blur-md rounded-xl p-1.5 shadow-xl border border-slate-800 max-w-xs text-white">
                <Search size={14} className="text-slate-400 ml-1.5" />
                <input
                  type="text"
                  placeholder="Tafuta neno kwenye mtihani..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-[10px] px-2 py-1 w-32 focus:w-44 transition-all placeholder-slate-500 text-white"
                />
                {searchQuery && (
                  <div className="flex items-center gap-1 text-[9px] font-mono font-black text-cyan-400 shrink-0 pr-1 border-l border-slate-800 pl-1.5">
                    <span>{searchOccurrences}</span>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* Simulated Paper Sheet */}
              <div 
                ref={pageContainerRef}
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, 
                  transformOrigin: 'top center'
                }}
                className={`w-full max-w-[620px] min-h-[720px] p-8 sm:p-12 rounded-3xl border shadow-xl transition-all duration-300 relative select-text leading-relaxed font-sans ${themeClasses[theme]}`}
              >
                {/* Search overlay indicator if results are found */}
                {searchQuery && searchOccurrences > 0 && (
                  <div className="absolute top-4 left-4 bg-yellow-500/15 border border-yellow-500 text-yellow-800 text-[9px] font-bold px-2 py-1 rounded-md z-10">
                    🔍 {searchOccurrences} matches highlighted
                  </div>
                )}

                {/* Highlight text highlight rendering fallback */}
                <div className="prose prose-slate max-w-none">
                  {renderActivePage()}
                </div>
              </div>

              {/* Spacing padding to account for zoom heights */}
              <div className="h-20 shrink-0" />
            </div>

            {/* Floating Navigation Controls on Document Bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-800 text-white rounded-2xl p-2.5 flex items-center gap-4 shadow-2xl backdrop-blur-md z-10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 transition-all text-slate-300 hover:text-white cursor-pointer"
                title="Ukurasa Uliotangulia"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="font-mono text-xs font-extrabold text-slate-200 tracking-wider">
                PAGE {currentPage} OF {documentPages.length}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(documentPages.length, prev + 1))}
                disabled={currentPage === documentPages.length}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 transition-all text-slate-300 hover:text-white cursor-pointer"
                title="Ukurasa Unaofuata"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
