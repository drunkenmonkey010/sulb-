import { Plus, Trash2, MessageCircle, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({
  chatHistory,
  currentChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  user,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-50 shadow-md">
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold transition-all shadow-md"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400"
        />
      </div>

      {/* Chat List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5">
        {filteredChats.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
            {searchQuery ? 'No chats found' : 'No conversations yet'}
          </p>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onLoadChat(chat.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all group ${
                currentChatId === chat.id
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md border border-sky-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent dark:border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 flex items-start gap-2">
                  <MessageCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {chat.title}
                    </h3>
                    <p className={`text-xs mt-0.5 ${
                      currentChatId === chat.id ? 'text-sky-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                    currentChatId === chat.id
                      ? 'hover:bg-red-600 text-white'
                      : 'hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400'
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        {user && (
          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition-colors border border-red-200 dark:border-red-800"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
