"use client"
import { useState } from 'react';
import { QuestionMarkCircleIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#392828] px-10 py-3 bg-[#1E1717] text-white">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white rounded-full mr-3"></div>
        <h1 className="text-xl font-bold hidden lg:block">Audio Recorder</h1>
      </div>
      <nav className={`lg:flex ${isMenuOpen ? 'max-h-screen' : 'max-h-0'} overflow-hidden lg:overflow-visible lg:max-h-none transition-max-height duration-500 ease-in-out z-30 lg:z-0`}>
        <ul className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
          <li><a href="#" className="hover:text-gray-300">Home</a></li>
          <li><a href="#" className="hover:text-gray-300">Features</a></li>
          <li><a href="#" className="hover:text-gray-300">Pricing</a></li>
          <li><a href="#" className="hover:text-gray-300">Examples</a></li>
          <li><a href="#" className="hover:text-gray-300">Docs</a></li>
        </ul>
      </nav>
      <div className="flex items-center space-x-4">
        <QuestionMarkCircleIcon  className="w-6 h-6 hidden lg:block" />
        <Cog6ToothIcon className="w-6 h-6 hidden lg:block" />
        <div className="w-8 h-8 bg-gray-300 rounded-full hidden lg:block"></div>
        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
}