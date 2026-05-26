import { MessageSquare, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Header({ user, onLogout }) {
  const { isDark, toggleTheme } = useTheme()
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 sticky top-0 z-40 shadow-sm">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <img 
          src="/images/iris-logo.png" 
          alt="IRIS Logo" 
          className="h-12 object-contain"
        />
        <span className="text-xl font-bold text-gray-900 dark:text-white">SULB Insights AI</span>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User Info & Theme Toggle & Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={onLogout}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
          <MessageSquare size={16} />
          <span>Chat Interface</span>
        </div>
      </div>
    </header>
  )
}
