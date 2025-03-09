"use client";

import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Chat Interface Section */}
      <section id="chat" className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          
          <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-full">
              {/* Chat Interface Header */}
              <div className="p-4 bg-gray-700 dark:bg-gray-800 text-white">
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-5 h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M12 2a8 8 0 0 0-8 8c0 4.4 8 12 8 12s8-7.6 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <h2 className="text-lg font-semibold">ReasonAI Assistant</h2>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="h-[calc(100%-4rem)]">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
