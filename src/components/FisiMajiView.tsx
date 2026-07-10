import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Trash, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  Compass, 
  HelpCircle,
  CheckCircle,
  ArrowRight,
  User,
  Lightbulb,
  CornerDownLeft,
  Crown
} from 'lucide-react';
import { addNotification } from '../firebase';
import PremiumLock from './PremiumLock';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FisiMajiViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function FisiMajiView({ onNavigate, userProfile }: FisiMajiViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'any' | 'primary' | 'olevel' | 'alevel'>('olevel');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested prompt templates matching Tanzanian curriculum
  const suggestions = [
    {
      title: 'Solves Equation',
      text: 'Nisaidie kutatua na kuelewa swali la quadratic equation: 2x^2 + 5x - 3 = 0',
      icon: '📐'
    },
    {
      title: 'Explains Physics',
      text: 'Elezea tofauti kati ya Distance na Displacement kwa mifano rahisi ya sekondari.',
      icon: '⚡'
    },
    {
      title: 'Necta History',
      text: 'Je, ni mbinu gani zilizotumiwa na wakoloni kuingiza uchumi wa kikoloni nchini Tanganyika?',
      icon: '📜'
    },
    {
      title: 'TIE Swahili',
      text: 'Fupisha dhamana kuu na wahusika wa kitabu cha "Mstahiki Meya" kwa muhtasari.',
      icon: '✍️'
    }
  ];

  useEffect(() => {
    // Load chat history from localstorage if present
    const stored = localStorage.getItem('lupa_ai_chat');
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      // Seed initial greeting
      const greetName = userProfile?.name || 'Mwanafunzi';
      setMessages([
        {
          role: 'assistant',
          content: `Habari gani, **${greetName}**! Mimi ni **Lupanulla AI**, msaidizi wako asilia wa masomo kutoka Lupanulla Foundation. 🇹🇿\n\nNimebobea kwenye mtaala wa **TIE na NECTA** kuanzia Shule ya Msingi hadi Kidato cha Sita. Unaweza kuniuliza maswali ya Hisabati, Fizikia, Kemia, Historia, au usaidizi wa kupanga ratiba ya mitihani. \n\n_Nitakusaidiaje kufikia ufaulu wa kiwango cha juu leo?_`
        }
      ]);
    }
  }, [userProfile]);

  useEffect(() => {
    // Scroll smoothly to bottom on new messages
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveChatHistory = (updated: Message[]) => {
    setMessages(updated);
    localStorage.setItem('lupa_ai_chat', JSON.stringify(updated));
  };

  const handleClearChat = () => {
    const greetName = userProfile?.name || 'Mwanafunzi';
    const reset: Message[] = [
      {
        role: 'assistant',
        content: `Habari gani, **${greetName}**! Mimi ni **Lupanulla AI**, msaidizi wako asilia wa masomo kutoka Lupanulla Foundation. 🇹🇿\n\nNimebobea kwenye mtaala wa **TIE na NECTA** kuanzia Shule ya Msingi hadi Kidato cha Sita. Unaweza kuniuliza maswali ya Hisabati, Fizikia, Kemia, Historia, au usaidizi wa kupanga ratiba ya mitihani. \n\n_Nitakusaidiaje kufikia ufaulu wa kiwango cha juu leo?_`
      }
    ];
    saveChatHistory(reset);
    setError(null);
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    setError(null);
    const userMsg: Message = { role: 'user', content: promptText };
    const updatedMessages = [...messages, userMsg];
    saveChatHistory(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build systemic instructions based on class levels selected
      let systemPrompt = `Wewe ni Lupanulla AI, Msaidizi wa Kujifunza wa Lupanulla Elimu Hub nchini Tanzania. 
Mada yako kuu ni kusaidia wanafunzi wa Kitanzania kujiandaa na mitihani yao ya kitaifa ya NECTA na majaribio mengine ya shule. 
Unajua kikamilifu mtaala wa TIE (Tanzania Institute of Education). `;

      if (selectedLevel === 'primary') {
        systemPrompt += `Mwanafunzi huyu ni wa ngazi ya Elimu ya Msingi (Primary School - Darasa la 5 hadi la 7). Tafadhali tumia lugha rahisi sana ya Kiswahili, toa mifano inayofaa kiwango cha umri wake na ueleze dhana kwa upendo. `;
      } else if (selectedLevel === 'olevel') {
        systemPrompt += `Mwanafunzi huyu ni wa ngazi ya Elimu ya Sekondari (Ordinary Level - Kidato cha 1 hadi cha 4). Eleza nadharia kwa kutumia mifano ya mtaala wa NECTA CSEE, taja masomo na mada husika na andika hatua za hisabati kwa usahihi wa kipekee. `;
      } else if (selectedLevel === 'alevel') {
        systemPrompt += `Mwanafunzi huyu ni wa ngazi ya Elimu ya Sekondari ya Juu (Advanced Level - Kidato cha 5 na 6). Toa majibu yenye mantiki na ushahidi wa kitaaluma wa hali ya juu (kiwango cha ACSEE). Tumia mifano mizuri na taja sayansi, hesabu au uchambuzi wa makala kwa kiingereza au kiswahili safi inavyohitajika. `;
      }

      systemPrompt += `\nUnapaswa kuwa mkarimu, kutoa majibu kwa kutumia markdown (kama orodha, vichwa vya habari, maandishi ya herufi nzito) ili kusaidia wanafunzi kusoma kwa urahisi. Kamwe usiongee kuhusu OpenAI au makampuni mengine, sema unatokana na Lupanulla Foundation. Jibu kwa Swahili safi ikiwezekana, au Kiingereza kwa mada za kiufundi (kama Sayansi/Hisabati). Toa miongozo na formula kila mwanafunzi anapoomba hesabu.`;

      // Dispatch request to Express backend proxy (/api/claude.php endpoint)
      const res = await fetch('/api/claude.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: updatedMessages
        })
      });

      if (!res.ok) {
        let errMsg = `Hitilafu ya seva (Seva imerudisha: ${res.status})`;
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          } else if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.message || data.error);
      }

      const assistantMsg: Message = { role: 'assistant', content: data.reply };
      saveChatHistory([...updatedMessages, assistantMsg]);

      // Add a notification in Firestore for this user about the response
      if (userProfile?.uid) {
        addNotification({
          userId: userProfile.uid,
          title: 'Lupanulla AI amejibu! 🤖',
          message: `${data.reply.substring(0, 80)}${data.reply.length > 80 ? '...' : ''}`,
          type: 'ai_response',
          link: 'fisimaji'
        }).catch(err => console.warn('Failed to add response notification:', err));
      }

    } catch (err: any) {
      console.error('Chat AI failure:', err);
      setError(err.message || 'Imeshindwa kuwasiliana na Lupanulla AI. Hakikisha upo mtandaoni au jaribu tena baadae.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSendPrompt(text);
  };

  return (
    <div id="fisimaji-view" className="space-y-6 animate-fade-in text-slate-800 bg-slate-50 flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      
      {/* Top Banner and Configuration selectors */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-800 to-indigo-950 p-4 sm:p-5 rounded-3xl text-white shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 border border-cyan-500/10 flex-shrink-0">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 bg-cyan-500/20 text-cyan-300 rounded-xl flex items-center justify-center border border-cyan-400/20 shadow-inner">
            <Bot size={22} className="stroke-[2] animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <h1 className="font-display font-extrabold text-base sm:text-lg uppercase">Lupanulla AI</h1>
              <span className="bg-purple-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">SMART TUTOR</span>
            </div>
            <p className="text-slate-300 text-[10px] sm:text-xs">
              Msaidizi binafsi wa masomo aliyezoezwa mtaala wa NECTA &amp; TIE.
            </p>
          </div>
        </div>

        {/* Level Filter and Premium status configuration tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setSelectedLevel('primary')}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all uppercase ${selectedLevel === 'primary' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Msingi
            </button>
            <button 
              onClick={() => setSelectedLevel('olevel')}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all uppercase ${selectedLevel === 'olevel' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              O-Level
            </button>
            <button 
              onClick={() => setSelectedLevel('alevel')}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all uppercase ${selectedLevel === 'alevel' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              A-Level
            </button>
          </div>

          {userProfile?.subscription === 'premium' ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/35 text-[10px] font-extrabold uppercase tracking-wider">
              <Crown size={11} className="animate-pulse text-amber-300" />
              Premium AI Active
            </div>
          ) : (
            <button
              onClick={() => onNavigate('premium')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer animate-pulse"
            >
              <Crown size={11} />
              Upgrade Premium
            </button>
          )}
        </div>
      </section>

      {/* Main Chat Conversation box with sidebar suggestions */}
      <PremiumLock 
        userProfile={userProfile} 
        onNavigate={onNavigate}
        title="Msaidizi wa Elimu Lupanulla AI"
        description="Lupanulla AI ni kipengele cha Premium tu. Jiunge sasa ili uweze kuuliza maswali bila kikomo, kupata ufafanuzi wa hatua kwa hatua wa mtaala mzima wa TIE na NECTA!"
      >
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          
          {/* Left Column: Chat log */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between min-h-0 relative">
            
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={handleClearChat}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Futa Maongezi"
              >
                <Trash size={16} />
              </button>
            </div>

            {/* Messages Flow Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4">
              {messages.map((msg, i) => {
                const isAi = msg.role === 'assistant';
                return (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${isAi ? '' : 'ml-auto flex-row-reverse'}`}>
                    {/* Avatar wrapper */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                      isAi ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isAi ? <Bot size={16} /> : <User size={16} />}
                    </div>

                    <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAi 
                        ? 'bg-slate-50 border border-slate-150 text-slate-800' 
                        : 'bg-cyan-600 text-white shadow-md'
                    }`}>
                      {/* Render message with linebreaks & simple markdown formatting */}
                      <div className="space-y-2 whitespace-pre-wrap">
                        {msg.content.split('\n\n').map((para, idx) => {
                          // Very simple parser for Bold **text**
                          let formatted = para;
                          const boldRegex = /\*\*(.*?)\*\*/g;
                          let match;
                          const segments = [];
                          let lastIndex = 0;
                          while ((match = boldRegex.exec(para)) !== null) {
                            if (match.index > lastIndex) {
                              segments.push(para.substring(lastIndex, match.index));
                            }
                            segments.push(<strong key={match.index} className="font-extrabold">{match[1]}</strong>);
                            lastIndex = boldRegex.lastIndex;
                          }
                          if (lastIndex < para.length) {
                            segments.push(para.substring(lastIndex));
                          }

                          return (
                            <p key={idx}>
                              {segments.length > 0 ? segments : para}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Simulated Typist loader */}
              {loading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl px-4 py-3 text-slate-500 text-xs font-semibold flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    <span>Lupanulla AI anaandika...</span>
                  </div>
                </div>
              )}

              {/* Error alerts */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex gap-2 text-xs text-red-700 font-semibold items-center">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Form input bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(input);
              }} 
              className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5"
            >
              <input 
                type="text" 
                required
                disabled={loading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Uliza chochote hapa (Hesabu, Fizikia, Kemia, Historia, n.k)..." 
                className="flex-grow bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-200 text-slate-950 disabled:text-slate-400 p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </form>

          </div>

          {/* Right Column: Suggested templates (Desktop sidebar) */}
          <div className="lg:col-span-1 hidden lg:block space-y-4 overflow-y-auto">
            <h3 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-widest block">Mifano ya Kuanza</h3>
            <div className="space-y-3">
              {suggestions.map((sug, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSuggestionClick(sug.text)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-cyan-400 hover:shadow-sm transition-all cursor-pointer space-y-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{sug.icon}</span>
                    <h4 className="font-bold text-slate-900 text-xs">{sug.title}</h4>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 font-semibold">
                    &quot;{sug.text}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </PremiumLock>

    </div>
  );
}
