"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { marked } from "marked";
import "../../styles/RetroChatStyles.css";

interface Model {
  name: string;
  modified_at: string;
  size: number;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "reasoning";
  content: string;
  timestamp: Date;
}

interface LogMessage {
  type: "log";
  message: string;
}

interface ResultMessage {
  type: "result";
  content: string;
}

type StreamMessage = LogMessage | ResultMessage;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("mistral");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch("/api/models");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          setModels(data.models);
          // Set the first model as default if available
          if (data.models.length > 0) {
            setSelectedModel(data.models[0].name);
          }
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, []);
  
  // Generate unique ID for messages
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Add user message to chat
    setMessages(prev => [...prev, { 
      id: generateId(),
      role: "user", 
      content: userMessage,
      timestamp: new Date()
    }]);
    
    // Clear previous logs
    setLogs([]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call the agent API
      const response = await fetch("/api/run-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          goal: userMessage,
          model: selectedModel 
        }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let result = "";
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk
        const chunk = decoder.decode(value);
        
        // Split by lines and process each JSON message
        chunk.split("\n").forEach(line => {
          if (!line.trim()) return;
          
          try {
            const message = JSON.parse(line) as StreamMessage;
            
            if (message.type === "log") {
              // Add reasoning messages directly to the chat
              if (message.message.startsWith('🤔 Reasoning:')) {
                const reasoningText = message.message.replace('🤔 Reasoning:', '').trim();
                setMessages(prev => [...prev, { 
                  id: generateId(),
                  role: "reasoning", 
                  content: reasoningText,
                  timestamp: new Date()
                }]);
              } else if (message.message.startsWith('📝 Step')) {
                // Add step messages as reasoning as well
                setMessages(prev => [...prev, { 
                  id: generateId(),
                  role: "reasoning", 
                  content: message.message,
                  timestamp: new Date()
                }]);
              } 
              
              // Still keep track of all logs
              setLogs(prev => [...prev, message.message]);
            } else if (message.type === "result") {
              result = message.content;
            }
          } catch (e) {
            console.error("Error parsing streaming message:", e);
          }
        });
      }
      
      // Add final assistant message to chat
      if (result) {
        setMessages(prev => [...prev, { 
          id: generateId(),
          role: "assistant", 
          content: result,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error("Error calling agent:", error);
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : "Unknown error"}`]);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        id: generateId(),
        role: "assistant", 
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Handle scroll to show back-to-bottom button when necessary
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button when scrolled up more than 200px from bottom
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to bottom of messages when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, logs.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format timestamp for accessibility
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full retro-chat-container retro-scanlines">
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto py-4 px-3 md:px-6 space-y-4 scroll-smooth bg-gray-900"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="text-center py-10 retro-welcome-container">
            <div className="retro-welcome-content p-8">
              <h2 
                className="text-2xl font-semibold text-gray-100 mb-3 retro-glitch-text" 
                data-text="ReasonAI Assistant"
              >
                ReasonAI Assistant
              </h2>
              <p className="text-gray-300 max-w-md mx-auto text-base">
                Ask me anything that requires reasoning and analysis.
              </p>
              <div className="mt-8 grid gap-6 max-w-lg mx-auto sm:grid-cols-2">
                <div className="p-4 bg-opacity-20 bg-black rounded-xl shadow-sm retro-neon-pink-border">
                  <h3 className="font-medium text-gray-300 mb-2">Example Questions</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="cursor-pointer hover:text-gray-100" onClick={() => setInput("What are the implications of quantum computing on cryptography?")}>
                      What are the implications of quantum computing on cryptography?
                    </li>
                    <li className="cursor-pointer hover:text-gray-100" onClick={() => setInput("How might climate change impact global food security?")}>
                      How might climate change impact global food security?
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-opacity-20 bg-black rounded-xl shadow-sm retro-neon-green-border">
                  <h3 className="font-medium text-gray-300 mb-2">Capabilities</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>Complex problem analysis</li>
                    <li>Step-by-step reasoning</li>
                    <li>Detailed explanations</li>
                    <li>Logical argumentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`group flex items-start ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar/Icon for assistant or reasoning */}
              {message.role === "assistant" && (
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 retro-avatar">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M12 2a8 8 0 0 0-8 8c0 4.4 8 12 8 12s8-7.6 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Thinking Icon for reasoning messages */}
              {message.role === "reasoning" && (
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 retro-reasoning-avatar">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className={`relative max-w-[85%] md:max-w-[75%] ${message.role === "user" ? "ml-10" : "mr-10"}`}>
                {/* Role label for screen readers only */}
                <span className="sr-only">
                  {message.role === "user" ? "You" : message.role === "assistant" ? "Assistant" : "Reasoning"}
                </span>
                
                <div
                  className={`px-4 py-3 rounded-xl shadow-sm ${
                    message.role === "user"
                      ? "retro-user-message text-white"
                      : message.role === "reasoning"
                        ? "retro-reasoning-message text-gray-200"
                        : "retro-assistant-message text-gray-200"
                  }`}
                >
                  {/* Label for reasoning messages */}
                  {message.role === "reasoning" && (
                    <div className="text-xs uppercase tracking-wide text-gray-300 font-semibold mb-1">
                      Reasoning:
                    </div>
                  )}
                  
                  <div 
                    className="prose dark:prose-invert prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ 
                      __html: marked(message.content, {
                        breaks: true,
                        gfm: true
                      }) as string 
                    }}
                  />
                </div>
                
                {/* Timestamp - visible on hover/focus */}
                <div 
                  className={`absolute bottom-0 ${
                    message.role === "user" ? "right-full mr-2" : "left-full ml-2"
                  } opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity text-xs text-gray-400 whitespace-nowrap`}
                  aria-hidden="true"
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {/* Avatar for user - right side */}
              {message.role === "user" && (
                <div className="flex-shrink-0 ml-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 retro-user-avatar">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Processing Indicator - only show when no messages are being processed yet */}
        {isLoading && logs.length === 0 && (
          <div className="flex items-start mt-4">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 retro-avatar">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M12 2a8 8 0 0 0-8 8c0 4.4 8 12 8 12s8-7.6 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>
            <div className="px-4 py-3 rounded-xl retro-assistant-message shadow-sm">
              <div className="flex space-x-2 retro-loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" aria-hidden="true" />
      </div>

      {/* Scroll to bottom button - appears when scrolled up */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-2 text-white rounded-full shadow-lg z-20 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-opacity opacity-90 hover:opacity-100 retro-scroll-button"
          aria-label="Scroll to bottom"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}

      {/* Input Area - Enhanced */}
      <div className="border-t border-gray-800 p-3 sm:p-4 relative z-20 shadow-md retro-input-area">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Model Selector */}
          <div className="mb-3 flex items-center">
            <label htmlFor="model-selector" className="text-sm font-medium text-gray-300 mr-3">
              Model:
            </label>
            <div className="relative flex-1 max-w-xs">
              <select
                id="model-selector"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-gray-700 
                          focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent 
                          bg-gray-800 text-gray-100 shadow-sm appearance-none retro-select"
                disabled={isLoadingModels || isLoading}
              >
                {isLoadingModels ? (
                  <option>Loading models...</option>
                ) : models.length === 0 ? (
                  <option value="mistral">mistral (default)</option>
                ) : (
                  models.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <label htmlFor="message-input" className="sr-only">Type your message</label>
          <div className="flex items-end space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <textarea
                id="message-input"
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base shadow-sm resize-none min-h-[52px] max-h-[120px] retro-textarea"
                placeholder="Ask me anything..."
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                aria-describedby="message-input-hint"
              />
              <div id="message-input-hint" className="sr-only">
                Press Enter to send your message. Use Shift+Enter for a new line.
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 p-3 sm:p-3.5 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm retro-submit-button"
              aria-label="Send message"
            >
              <FaPaperPlane className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 text-right">
            Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
