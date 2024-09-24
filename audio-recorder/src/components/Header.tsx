import { QuestionMarkCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#392828] px-10 py-3 bg-[#1E1717] text-white">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white rounded-full mr-3"></div>
        <h1 className="text-xl font-bold">Audio Recorder</h1>
      </div>
      <nav>
        <ul className="flex space-x-6">
          <li><a href="#" className="hover:text-gray-300">Home</a></li>
          <li><a href="#" className="hover:text-gray-300">Features</a></li>
          <li><a href="#" className="hover:text-gray-300">Pricing</a></li>
          <li><a href="#" className="hover:text-gray-300">Examples</a></li>
          <li><a href="#" className="hover:text-gray-300">Docs</a></li>
        </ul>
      </nav>
      <div className="flex items-center space-x-4">
        <QuestionMarkCircleIcon className="w-6 h-6" />
        <Cog6ToothIcon className="w-6 h-6" />
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  )
}