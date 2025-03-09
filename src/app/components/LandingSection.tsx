"use client";

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingSection() {
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 z-0"></div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] z-0"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col text-center items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              AI-Powered <span className="text-gray-700 dark:text-gray-300">Reasoning</span> Assistant
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl">
              Advanced analytical reasoning for complex questions and deeper understanding.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                href="#chat"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-500/20 font-medium text-lg transition-all transform hover:scale-105"
              >
                Try the Assistant
              </Link>
              
              <button 
                onClick={scrollToFeatures}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 font-medium text-lg transition-all transform hover:scale-105"
              >
                Explore Features
              </button>
            </div>
            
            {/* Visual representation */}
            <div className="relative w-full max-w-4xl h-64 md:h-80 lg:h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20"></div>
              
              <div className="absolute top-0 left-0 w-full p-4 flex items-center border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <div className="mx-auto font-medium text-gray-500 dark:text-gray-400 text-sm">
                  ReasonAI Interface
                </div>
              </div>
              
              <div className="absolute top-16 inset-x-0 bottom-0 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2 rounded-xl bg-gray-700 text-white">
                      <p>How might climate change impact global food security?</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm">
                      <p className="text-sm"><strong>Analyzing impact of climate change on food security...</strong></p>
                      <ul className="mt-2 space-y-1 pl-5 list-disc text-sm">
                        <li>Changing precipitation patterns affect crop yields</li>
                        <li>Rising temperatures impact growing seasons</li>
                        <li>Extreme weather events damage agricultural infrastructure</li>
                        <li>Water scarcity in key agricultural regions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section 
        ref={featuresRef} 
        id="features" 
        className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Reasoning Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI assistant combines analytical thinking with comprehensive knowledge to provide insightful answers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analytical Thinking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Breaks down complex problems through systematic analysis and logical reasoning.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Knowledge Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Combines diverse knowledge domains to provide comprehensive and contextual responses.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Multi-step Reasoning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Follows logical chains of thought to reach well-supported conclusions.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Transparent Process
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Shows its reasoning process step by step, allowing you to follow along.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Adaptive Responses
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tailors answers to your level of expertise, from beginner to advanced.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Critical Evaluation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Evaluates multiple perspectives and helps identify strengths and weaknesses in arguments.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
