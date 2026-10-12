import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChevronDown,
  TrendingUp,
  GraduationCap,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  actionLinks?: { label: string; action: string }[];
}

export const StudentChatbot: React.FC = () => {
  const { student, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const studentName = student?.name || user?.name || 'Aman';
  const firstName = studentName.split(' ')[0] || 'Aman';

  const defaultMessages: ChatMessage[] = [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello ${firstName}! 👋 I am your Cubit AI Academic Assistant. I'm here to help you track your Digital Progress Card, suggest how to improve your scores, and answer any test questions!`,
      time: 'Just now',
    },
    {
      id: 'welcome-2',
      sender: 'ai',
      text: `Your current average score is 78% (Rank #12 in your batch). How can I help you today?`,
      time: 'Just now',
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);

  // Quick suggestion prompts
  const suggestions = [
    { icon: Sparkles, text: 'What is the 24/7 AI Doubt Solver?' },
    { icon: TrendingUp, text: 'How can I improve my marks to 85%?' },
    { icon: Lightbulb, text: 'Where are my weak topics in Knowledge Radar?' },
    { icon: Calendar, text: 'When is my next mock exam?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // AI Response generator with personalized academic intelligence
  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('doubt') || q.includes('tutor') || q.includes('question') || q.includes('solve')) {
      return `🤖 Need help with a tough problem? Head over to the 'AI Doubt Solver' in your sidebar! You can paste any equation, upload textbook photos, and get step-by-step mathematical proofs 24/7.`;
    }

    if (q.includes('radar') || q.includes('weak') || q.includes('gap') || q.includes('vulnerability')) {
      return `🎯 Your Knowledge Gap Radar is live! It highlights that you are leaking marks in Organic Reaction Mechanisms (42%) and Calculus (48%). Sealing these two gaps will boost your score by estimated +12.2%!`;
    }

    if (q.includes('summarize') || q.includes('lecture') || q.includes('video') || q.includes('notes')) {
      return `⚡ Use the Lecture Summarizer! Paste YouTube links or upload audio recordings to get 2-minute executive summaries, clickable timestamps, and instant retention quizzes.`;
    }

    if (q.includes('improve') || q.includes('score') || q.includes('marks') || q.includes('increase')) {
      return `To improve your score from 78% to the Excellent Tier (85%+):\n\n1. 🎯 Focus Priority: Your lowest scored subject is 'General Studies' (68%) and 'Maths' (72%).\n2. ⏱️ 30-Min Daily Practice: Practicing 20 previous years' MCQs in English and General Studies will gain you an estimated +7% in your next mock.\n3. 🏆 Rank Impact: A 7% boost will advance you from Rank #12 straight into the Batch Top 5!`;
    }

    if (q.includes('next exam') || q.includes('mock') || q.includes('date') || q.includes('schedule') || q.includes('when')) {
      return `📅 Upcoming Exam Details:\n\n• Exam: Next Mock Test - SSC Mission 2026\n• Date & Time: Oct 12, 2026 at 10:00 AM\n• Subjects Covered: English Comprehension, Reasoning & Quantitative Aptitude\n• Duration: 60 minutes\n\nMake sure to arrive or log in 10 minutes early!`;
    }

    if (q.includes('rank') || q.includes('position') || q.includes('standing')) {
      return `🏆 Your Academic Standing:\n\n• Current Batch Rank: #12 (in Batch A)\n• Total Exams Attempted: 6 tests\n• Highest Recorded Score: 96% (Mock Test 03 - English)\n• Batch Average: 72% (You are performing +6% above batch average! 🎉)`;
    }

    if (q.includes('tips') || q.includes('general studies') || q.includes('study') || q.includes('help')) {
      return `💡 Expert Study Strategies for ${firstName}:\n\n1. Active Recall: Don't just re-read notes; test yourself with rapid flashcards.\n2. Mistake Log: Keep a notebook of questions you missed in Mock Test 01 & 02 to review before Oct 12.\n3. Time Management: Spend max 1 minute per General Studies question so you have ample time for Maths calculations.`;
    }

    if (q.includes('spreadsheet') || q.includes('sheet') || q.includes('excel')) {
      return `🔒 Your scorecard is securely synchronized from verified academic evaluation records. Teachers update and review the records in the Super Admin system, and your verified progress reflects here automatically!`;
    }

    return `I understand you asked about "${query}". Your academic metrics are on a strong upward trajectory! Would you like detailed tips to prepare for your Oct 12 Mock Test, or an analysis of your highest scoring subjects?`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateAIResponse(text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Helpful callout pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#091438] border border-[#1b2c60] text-slate-200 text-xs px-3.5 py-2 rounded-full shadow-2xl animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Ask AI: How to improve marks?</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#ff9800] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(255,152,0,0.4)] hover:scale-105 active:scale-95 transition-all group"
            title="Open Cubit AI Academic Assistant"
          >
            <Bot className="w-7 h-7 group-hover:rotate-6 transition-transform" />
          </button>
        </div>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#070e28] border border-[#1b2e63] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a1642] to-[#0d1d57] border-b border-[#1b2e63] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#ff9800] text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Cubit AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400">Digital Progress & Study Mentor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar bg-[#050b20]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-[#0f255c] border border-blue-500/30 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-md'
                      : 'bg-[#0a1740] border border-[#182a5c] text-slate-200 whitespace-pre-line'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 font-mono ${
                      msg.sender === 'user' ? 'text-orange-200 text-right' : 'text-slate-500'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-2">
                <Bot className="w-4 h-4 text-brand-orange animate-spin" />
                <span className="italic">Cubit AI is analyzing your progress...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-4 py-2 bg-[#07112f] border-t border-[#13224d] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.text)}
                  className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d1d52] hover:bg-[#12286b] border border-[#1d3478] text-[11px] text-slate-300 hover:text-white transition flex-shrink-0"
                >
                  <Icon className="w-3 h-3 text-brand-orange" />
                  <span>{s.text}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Input Field */}
          <div className="p-3 bg-[#081338] border-t border-[#162758]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about marks, exams, improvement..."
                className="flex-1 bg-[#060c24] border border-[#172754] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange/60 transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#ff9800] disabled:opacity-40 text-white flex items-center justify-center transition shadow-md flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentChatbot;
