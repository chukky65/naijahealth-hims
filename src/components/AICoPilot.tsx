import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, X, MessageSquare, Send, Minimize2, Loader2, FileText, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const AICoPilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your AI Medical Co-Pilot. I can help analyze patient data, cross-reference drug interactions, or suggest triage priorities. How can I assist you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      let aiResponseText = "I've analyzed the request. Based on the current patient context and clinical guidelines, I recommend reviewing the latest lab results before prescribing the medication. Would you like me to pull up the recent Hemoglobin and WBC counts?";
      
      const lowerInput = newUserMsg.text.toLowerCase();
      if (lowerInput.includes('malaria')) {
        aiResponseText = "Given the symptoms described, malaria is highly probable. I recommend ordering a Rapid Diagnostic Test (RDT) and a thick blood smear. Do you want me to draft the lab requisition?";
      } else if (lowerInput.includes('interaction')) {
        aiResponseText = "Checking interactions... There is a moderate interaction between Artemether-Lumefantrine and the patient's current hypertension medication (Amlodipine), which could cause QT prolongation. Consider monitoring an ECG if both are prescribed.";
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText
      };
      
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-28 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all z-50 flex items-center justify-center group"
          aria-label="Open AI Co-Pilot"
        >
          <BrainCircuit className="w-6 h-6 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-28 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200" style={{ maxHeight: 'calc(100vh - 100px)', height: '600px' }}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Medical Co-Pilot</h3>
                <div className="flex items-center gap-1.5 text-xs text-indigo-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Online & Ready
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" aria-label="Minimize">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex overflow-x-auto gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 hide-scrollbar shrink-0">
            <button onClick={() => setInputValue('Check drug interactions')} className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              Drug Interactions
            </button>
            <button onClick={() => setInputValue('Summarize patient history')} className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              Summarize History
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="relative flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the Co-Pilot anything..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 min-h-[44px]"
                rows={1}
                style={{ height: 'auto' }}
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                AI can make mistakes. Verify clinical decisions.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
