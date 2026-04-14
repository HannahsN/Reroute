import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightCircle } from "lucide-react";

const initialMessage = {
  role: 'bot',
  content: 'Hi there! I\'m Reroute\'s Health AI. How can I help you understand your wellness data today?'
};

function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  
  const activeExchangeRef = useRef(null);
  const inputRef = useRef(null);

  const isCurrentlyStreaming = messages[messages.length - 1]?.isStreaming;

  // --- 1. HOURLY CLEAR LOGIC ---
  useEffect(() => {
    const checkAndClearHistory = () => {
      const lastClear = localStorage.getItem('lastChatClearTime');
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;

      if (!lastClear || (now - parseInt(lastClear)) > ONE_HOUR) {
        // Clear history but keep the initial greeting
        setMessages([initialMessage]);
        localStorage.setItem('chatBotSession', JSON.stringify([initialMessage]));
        localStorage.setItem('lastChatClearTime', now.toString());
        console.log("Chat history cleared (1-hour interval reached).");
      }
    };

    // Check immediately on load
    checkAndClearHistory();

    // Check every minute while the tab is open
    const interval = setInterval(checkAndClearHistory, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. LOAD DATA ---
  useEffect(() => {
    const chatStatus = localStorage.getItem('chatBotSession');
    if (chatStatus) {
      try {
        setMessages(JSON.parse(chatStatus));
      } catch (e) {
        console.error("Could not parse chat history");
      }
    }
  }, []);

  // --- 3. TYPING EFFECT ---
  useEffect(() => {
    const lastMsgIndex = messages.length - 1;
    if (lastMsgIndex < 0) return;
    const lastMsg = messages[lastMsgIndex];

    if (lastMsg.role === 'bot' && lastMsg.isStreaming) {
      if (lastMsg.content.length < lastMsg.fullContent.length) {
        const timeout = setTimeout(() => {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[lastMsgIndex] = {
              ...newMessages[lastMsgIndex],
              content: lastMsg.fullContent.slice(0, lastMsg.content.length + 1)
            };
            return newMessages;
          });
        }, 15); 
        return () => clearTimeout(timeout);
      } else {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], isStreaming: false };
          return newMessages;
        });
      }
    }
  }, [messages]);

  // --- 4. SCROLL & SAVE ---
  useEffect(() => {
    const messagesToSave = messages.map(m => ({
      role: m.role,
      content: m.fullContent || m.content
    }));
    localStorage.setItem('chatBotSession', JSON.stringify(messagesToSave));
    
    if (activeExchangeRef.current) {
      activeExchangeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  // --- 5. AUTO-FOCUS ---
  useEffect(() => {
    if (!isLoading && !isCurrentlyStreaming && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isLoading, isCurrentlyStreaming]);

  const validMessages = messages.filter(msg => (msg.content && msg.content.trim() !== '') || msg.isStreaming);
  const anchorIndex = validMessages.map(m => m.role).lastIndexOf('user');
  const finalAnchorIndex = anchorIndex >= 0 ? anchorIndex : 0;
  
  const historyMessages = validMessages.slice(0, finalAnchorIndex);
  const currentMessages = validMessages.slice(finalAnchorIndex);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // --- PERSISTENT MEMORY LOGIC ---
      // We retrieve memory from a separate key that is NEVER cleared by the hourly wipe
      const userMemory = localStorage.getItem('rerouteUserMemory') || "No specific user details remembered yet.";

      const systemPrompt = `You are a friendly, knowledgeable AI wellness coach for Reroute. 
      IMPORTANT USER MEMORY: ${userMemory}
      Answer naturally and keep responses concise.`;

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages
            .filter(m => !m.isStreaming && m.content.trim() !== '') 
            .map(m => ({ 
                role: m.role === 'bot' ? 'assistant' : 'user', 
                content: m.content 
            }))
      ];
      
      apiMessages.push({ role: 'user', content: input });

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const botMessage = {
        role: 'bot',
        content: '', 
        fullContent: data.reply || "I'm sorry, I couldn't process that.",
        isStreaming: true 
      };
      
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'bot',
        content: '',
        fullContent: 'Connection error. Is the backend running?',
        isStreaming: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto h-[85vh] pt-8">
      <div className="flex-1 overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {historyMessages.length > 0 && (
          <div className="space-y-8 pb-12 border-b border-transparent">
            {historyMessages.map((msg, index) => (
              <div key={`hist-${index}`} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="bg-slate-800 text-slate-100 rounded-[32px] px-8 py-5 max-w-[85%] shadow-sm opacity-60">
                    <p className="text-xl leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="text-slate-400 max-w-[95%] px-4 py-3 opacity-80">
                    <p className="text-xl leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div ref={activeExchangeRef} className="flex flex-col min-h-[80vh] justify-start space-y-8 pt-4">
          {currentMessages.map((msg, index) => (
            <div key={`curr-${index}`} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={msg.role === 'user' ? "bg-slate-800 text-slate-100 rounded-[32px] px-8 py-5 max-w-[85%] shadow-sm" : "text-slate-200 max-w-[95%] px-4 py-3"}>
                <p className="text-xl leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                  {msg.isStreaming && <span className="animate-pulse">|</span>}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex w-full justify-start px-4">
              <div className="flex gap-2 items-center h-8">
                <div className="w-3 h-3 rounded-full bg-slate-500 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-slate-500 animate-pulse delay-75"></div>
                <div className="w-3 h-3 rounded-full bg-slate-500 animate-pulse delay-150"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb-8 pt-2 px-4 w-full bg-transparent">
        <form onSubmit={sendMessage} className="relative w-full">
          <div className="relative bg-slate-800/80 rounded-[36px] focus-within:bg-slate-800 focus-within:ring-1 focus-within:ring-slate-600 transition-all flex items-center px-3 py-2 shadow-lg">
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Reroute AI..."
              className="w-full bg-transparent text-white px-6 py-5 focus:outline-none disabled:opacity-50 placeholder:text-slate-400 text-xl"
              disabled={isLoading || isCurrentlyStreaming} 
            />
            <button
              type="submit"
              disabled={isLoading || input.trim() === '' || isCurrentlyStreaming}
              className="text-slate-400 hover:text-white disabled:text-slate-600 transition-colors p-3 rounded-full shrink-0"
            >
              <ArrowRightCircle className="w-10 h-10" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;