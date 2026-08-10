import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Send, Image, MoreVertical, 
  CheckCheck, ChevronLeft, MapPin, Building, ArrowRight
} from 'lucide-react';

export default function ChatsPage() {
  const { conversations, sendMessage, userRole } = useAppStore();
  const [activeConvoId, setActiveConvoId] = useState(conversations[0]?.id || null);
  const [inputText, setInputText] = useState("");
  const [mockImgFile, setMockImgFile] = useState(null);

  const messagesEndRef = useRef(null);

  // Retrieve active conversation
  const activeConvo = conversations.find(c => c.id === activeConvoId);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages, activeConvo?.typing]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !mockImgFile) return;

    if (activeConvoId) {
      // Send text or image mock
      sendMessage(activeConvoId, inputText || "Sent an attachment image.");
      setInputText("");
      setMockImgFile(null);
    }
  };

  const triggerMockImageShare = () => {
    // Simulate attaching an image (e.g. screenshot of property or document)
    setMockImgFile("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80");
    setInputText("Sharing property layout screenshot.");
  };

  return (
    <div className="w-full flex h-[calc(100vh-64px)] bg-slate-50 border-t border-slate-200">
      
      {/* 1. Left Sidebar: Conversations List */}
      <div className={`w-full md:w-80 border-r border-slate-200 bg-white flex flex-col ${activeConvoId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display font-extrabold text-slate-800 text-base flex items-center gap-1.5">
            <MessageSquare className="h-5 w-5 text-primary" />
            Chats
          </h2>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
            Active
          </span>
        </div>

        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold">
              No conversations started yet.
            </div>
          ) : (
            conversations.map(convo => {
              const lastMsg = convo.messages[convo.messages.length - 1];
              const isActive = convo.id === activeConvoId;
              
              return (
                <div 
                  key={convo.id}
                  onClick={() => setActiveConvoId(convo.id)}
                  className={`p-4 cursor-pointer transition flex gap-3 items-center ${
                    isActive ? 'bg-blue-50/40 border-l-4 border-primary' : 'hover:bg-slate-50'
                  }`}
                >
                  <img 
                    src={convo.ownerAvatar} 
                    alt={convo.ownerName} 
                    className="h-10 w-10 rounded-full bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{convo.ownerName}</h4>
                      {lastMsg && (
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-slate-400 font-semibold truncate leading-tight">
                      {convo.propertyName}
                    </p>
                    
                    {convo.typing ? (
                      <span className="text-[10px] text-orange-500 font-bold animate-pulse mt-1 block">typing...</span>
                    ) : (
                      lastMsg && (
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-1">
                          {lastMsg.sender === 'user' ? 'You: ' : ''}{lastMsg.text}
                        </p>
                      )
                    )}
                  </div>
                  
                  {convo.unreadCount > 0 && !isActive && (
                    <span className="h-4 w-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right Pane: Messaging Sandbox */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${!activeConvoId ? 'hidden md:flex' : 'flex'}`}>
        {activeConvo ? (
          <>
            {/* Active chat header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConvoId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 md:hidden transition mr-1"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <img 
                  src={activeConvo.ownerAvatar} 
                  alt={activeConvo.ownerName} 
                  className="h-10 w-10 rounded-full border border-slate-200"
                />
                <div className="text-left">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-slate-800">{activeConvo.ownerName}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold capitalize flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 inline-block animate-ping"></span>
                    Online
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Property context card */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 text-left flex justify-between items-center gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <img 
                  src={activeConvo.propertyImage} 
                  alt={activeConvo.propertyName}
                  className="h-11 w-16 rounded-lg object-cover border border-slate-200 shrink-0" 
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-800 truncate">{activeConvo.propertyName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Referencing this listing</p>
                </div>
              </div>
              <Link 
                to={`/property/${activeConvo.propertyId}`}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800 transition uppercase tracking-wider shrink-0"
              >
                View
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeConvo.messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm text-left leading-relaxed ${
                      isUser 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'
                    }`}>
                      <p className="font-semibold">{msg.text}</p>
                      
                      {/* Image attachments rendering */}
                      {msg.text.includes("screenshot") && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-slate-100 max-h-40 bg-slate-900">
                          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" alt="Attachment" className="object-cover h-full w-full" />
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[9px] opacity-75">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isUser && <CheckCheck className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator bubble */}
              {activeConvo.typing && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white rounded-2xl rounded-tl-none p-3.5 border border-slate-200 text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span>{activeConvo.ownerName} is typing</span>
                    <span className="flex space-x-0.5">
                      <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input keyboard toolbar */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0">
              
              <button
                type="button"
                onClick={triggerMockImageShare}
                className={`p-3 rounded-xl border transition ${
                  mockImgFile ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Mock Share Image Layout"
              >
                <Image className="h-4.5 w-4.5" />
              </button>

              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to the property owner..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
              />

              <button
                type="submit"
                className="p-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md transition shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>

            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 space-y-3">
            <MessageSquare className="h-12 w-12 text-slate-300 animate-pulse-slow" />
            <h3 className="font-display font-bold text-slate-800 text-sm">Select a Conversation</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs text-center">
              Click on an inbox item from the left sidebar to send message templates or view property context reference cards.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
