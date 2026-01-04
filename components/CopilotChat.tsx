
import React, { useState, useRef, useEffect } from 'react';
import { chatWithCopilot } from '../services/gemini';
import { ChatMessage } from '../types';
import { MOCK_ASSETS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STORAGE_KEY = 'docpilot_chat_history';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your Asset Manager Copilot. Once you've uploaded your portfolio data in the Dashboard, I can provide detailed analysis and performance trends..",
  timestamp: new Date()
};

// Improved helper to render markdown-like tables and formatted text
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const tableRegex = /(\|(?:[^\n|]+\|)+\n\|(?:[\s\-\:\|]+\|)+\n(?:\|(?:[^\n|]+\|)+\n*)+)/g;
  
  const parts = content.split(tableRegex);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.trim().startsWith('|') && part.includes('\n|')) {
          const lines = part.trim().split('\n');
          if (lines.length < 3) return <div key={index}>{part}</div>;

          const header = lines[0].split('|').filter(c => c.trim()).map(c => {
            // Remove markdown asterisks from headers
            return c.trim().replace(/\*\*/g, '').replace(/\*/g, '');
          });

          const rows = lines.slice(2).map(line => 
            line.split('|').filter(c => (c.trim() || line.includes('| |'))).map(c => c.trim())
          ).filter(row => row.length > 0);

          return (
            <div key={index} className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {header.map((h, i) => (
                      <th key={i} className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell, j) => {
                        // Strip markdown asterisks from cell content
                        const cleanCell = cell.replace(/\*\*/g, '').replace(/\*/g, '');
                        const isValue = cleanCell.includes('$') || cleanCell.includes('%') || /^-?\d/.test(cleanCell);
                        
                        return (
                          <td key={j} className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                            {isValue ? (
                              <span className="font-bold text-slate-900">{cleanCell}</span>
                            ) : (
                              cleanCell
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        
        return (
          <div key={index} className="whitespace-pre-wrap leading-relaxed text-sm">
            {part.split('\n').map((line, i) => {
              if (!line.trim()) return <div key={i} className="h-2"></div>;
              
              let formattedLine = line
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/^### (.*$)/g, '<h3 class="text-base font-bold mt-4 mb-2 text-slate-900">$1</h3>')
                .replace(/^## (.*$)/g, '<h2 class="text-lg font-bold mt-5 mb-3 text-slate-900 border-b border-slate-100 pb-1">$1</h2>')
                .replace(/^- (.*$)/g, '<li class="ml-4 list-disc">$1</li>');

              return (
                <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const CopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error("Failed to load chat history from localStorage", e);
      }
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.content }]
      }));
      
      const assetContext = JSON.stringify(MOCK_ASSETS);
      const response = await chatWithCopilot(userMsg.content, history, assetContext);
      
      let dataToAttach = null;
      const lowerQuery = userMsg.content.toLowerCase();
      if (lowerQuery.includes('vanguard')) {
        dataToAttach = MOCK_ASSETS[0].performanceData;
      } else if (lowerQuery.includes('blackrock')) {
        dataToAttach = MOCK_ASSETS[1].performanceData;
      } else if (lowerQuery.includes('manhattan')) {
        dataToAttach = MOCK_ASSETS[2].performanceData;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        data: dataToAttach,
        sources: ['Internal Portfolio API', 'Institutional Risk Engine']
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the data server right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetSession = () => {
    setMessages([{ ...INITIAL_WELCOME_MESSAGE, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Asset Copilot Intelligence</h2>
            <div className="flex items-center mt-0.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Data Feed</span>
            </div>
          </div>
        </div>
        <button 
          onClick={resetSession}
          className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors px-3 py-1.5 rounded-lg border border-slate-100 hover:border-rose-100"
        >
          Reset Session
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-3xl rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-3xl rounded-tl-none shadow-sm'} p-6`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-4">
                   <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600">CP</div>
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Asset Copilot</span>
                </div>
              )}
              
              <div className={msg.role === 'user' ? 'text-white' : 'text-slate-700'}>
                <FormattedMessage content={msg.content} />
              </div>

              {/* Data Visualization inside chat */}
              {msg.data && (
                <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-inner">
                   <div className="flex justify-between items-center mb-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Performance Chart</p>
                     <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">Live Plot</span>
                   </div>
                   <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={msg.data}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}
                          labelStyle={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2563eb" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#1e3a8a' }} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                   </div>
                </div>
              )}

              {msg.sources && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Data Lineage:</span>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="flex items-center bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-200 hover:bg-white transition-colors cursor-help">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {s}
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`text-[10px] mt-4 font-bold ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-300'} flex justify-between`}>
                <span>{msg.timestamp.toLocaleDateString()}</span>
                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-200 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query asset metrics, trends, or historical correlations..."
              className="w-full bg-slate-50 border border-slate-200 rounded-3xl pl-8 pr-20 py-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !inputValue.trim()}
              className="absolute right-3 bg-blue-600 text-white p-3.5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-6">
            <button 
              onClick={() => setInputValue("Show performance table for the Vanguard fund over last 6 months")}
              className="text-[11px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-full border border-slate-200 hover:border-blue-200"
            >
              "Performance Table"
            </button>
            <button 
               onClick={() => setInputValue("Analyze risk trends for BlackRock portfolio")}
              className="text-[11px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-full border border-slate-200 hover:border-blue-200"
            >
              "Risk Analysis"
            </button>
            <button 
              onClick={() => setInputValue("Identify assets with highest quarterly volatility")}
              className="text-[11px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-full border border-slate-200 hover:border-blue-200"
            >
              "Top Volatility"
            </button>
            <button 
              onClick={() => setInputValue("Which assets declined the most this quarter?")}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
            >
              "Worst performers?"
            </button>
            <button 
              onClick={() => setInputValue("Show trends for Vanguard over the last 6 months")}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
            >
              "Vanguard Trends"
            </button>
            <button 
              onClick={() => setInputValue("Analyze risk profile for the Manhattan REIT")}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
            >
              "Manhattan Risk"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopilotChat;
