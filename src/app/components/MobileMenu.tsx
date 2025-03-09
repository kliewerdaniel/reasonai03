"use client";

import { useEffect } from 'react';
import Link from 'next/link';

interface NavItem {
  name: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'mobile-menu-backdrop') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      // Prevent scrolling when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="mobile-menu-backdrop"
      className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm transition-opacity"
      aria-labelledby="mobile-menu-heading"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto"
        aria-label="Mobile menu"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 id="mobile-menu-heading" className="font-medium text-blue-600 dark:text-blue-500 text-lg">
            ReasonAI Menu
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  className={`block py-2.5 px-4 rounded-lg text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    item.href === '/' 
                      ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
