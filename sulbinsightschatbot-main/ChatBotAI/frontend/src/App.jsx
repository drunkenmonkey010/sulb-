import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ChatInput from './components/ChatInput'
import LoginCreation from './components/LoginCreation'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  // Chat state
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [currentChatTemp, setCurrentChatTemp] = useState(null) // Temp chat before first message
  const [loading, setLoading] = useState(false)

  // Load user and chat history from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsLoggedIn(true)
        
        // Load chat history for this user
        const userChatKey = `chatHistory_${userData.email}`
        if (localStorage.getItem(userChatKey)) {
          const history = JSON.parse(localStorage.getItem(userChatKey))
          setChatHistory(history)
          
          // Load the last chat if available
          if (history.length > 0) {
            const lastChat = history[0]
            setCurrentChatId(lastChat.id)
            setMessages(lastChat.messages || [])
          }
        }
      } catch (e) {
        console.error('Failed to load user data:', e)
      }
    }
  }, [])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (user && chatHistory.length > 0) {
      const userChatKey = `chatHistory_${user.email}`
      localStorage.setItem(userChatKey, JSON.stringify(chatHistory))
    }
  }, [chatHistory, user])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    // Save user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData))
    
    // Load THIS user's chat history
    const userChatKey = `chatHistory_${userData.email}`
    if (localStorage.getItem(userChatKey)) {
      const userHistory = JSON.parse(localStorage.getItem(userChatKey))
      setChatHistory(userHistory)
      
      // Load the last chat if available
      if (userHistory.length > 0) {
        const lastChat = userHistory[0]
        setCurrentChatId(lastChat.id)
        setMessages(lastChat.messages || [])
      }
    } else {
      setChatHistory([])
      setCurrentChatId(null)
      setMessages([])
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setChatHistory([])
    setCurrentChatId(null)
    setMessages([])
    setCurrentChatTemp(null)
    // Clear current user but keep chat history (per-user)
    localStorage.removeItem('currentUser')
  }

  const handleNewChat = () => {
    setCurrentChatTemp(null)
    setMessages([])
    setCurrentChatId(null)  // ← ADD THIS LINE
  }

  const handleSendMessage = async (query) => {
    // Create or get current chat
    let chatId = currentChatId
    let isFirstMessage = !currentChatId

    if (isFirstMessage) {
      chatId = Date.now()
      setCurrentChatId(chatId)
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      // Call backend API
      const response = await fetch('http://localhost:8000/api/v1/chat/generate_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      })

      const data = await response.json()
      console.log("data",data);
      

      // // Add AI response
      // const aiMessage = {
      //   id: Date.now() + 1,
      //   type: 'ai',
      //   content: data.text,
      //   chart: data.chart,
      //   table: data.table,
      //   download_url: data.download_url,
      //   timestamp: new Date()
      // }
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',

        // ✅ Correct text
        content: data.execution_results?.data_story || data.text_answer,

        // ✅ Chart (Plotly JSON)
        chart: data.execution_results?.plotly_json,

        // ✅ Table
        table: data.execution_results?.final_df,

        // ❌ Not present in response
        download_url: null,

        // ✅ Optional: related questions
        related_questions: data.execution_results?.related_questions || [],

        timestamp: new Date()
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)

      // Only save to history on first message
      if (isFirstMessage) {
        const newChat = {
          id: chatId,
          title: query.substring(0, 40) + (query.length > 40 ? '...' : ''),
          timestamp: new Date(),
          messages: finalMessages
        }
        setChatHistory([newChat, ...chatHistory])
      } else {
        // Update existing chat
        setChatHistory(
          chatHistory.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  title: query.substring(0, 40) + (query.length > 40 ? '...' : ''),
                  messages: finalMessages,
                  timestamp: new Date()
                }
              : chat
          )
        )
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Error: ${error.message}.Sorry try again.check your query and try again.`,
        timestamp: new Date()
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectQuery = (query) => {
    handleSendMessage(query)
  }

  const handleDeleteChat = (chatId) => {
    const filtered = chatHistory.filter(chat => chat.id !== chatId)
    setChatHistory(filtered)
    if (currentChatId === chatId) {
      const nextChat = filtered[0]
      if (nextChat) {
        setCurrentChatId(nextChat.id)
        setMessages(nextChat.messages)
      } else {
        setCurrentChatId(null)
        setMessages([])
      }
    }
  }

  const handleLoadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
    }
  }

  return (
    <ThemeProvider>
      <>
        {!isLoggedIn ? (
          <LoginCreation onLogin={handleLogin} />
        ) : (
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar
              chatHistory={chatHistory}
              currentChatId={currentChatId}
              onNewChat={handleNewChat}
              onLoadChat={handleLoadChat}
              onDeleteChat={handleDeleteChat}
              user={user}
              onLogout={handleLogout}
            />
            <div className="flex-1 flex flex-col ml-64">
              <Header user={user} onLogout={handleLogout} />
              <ChatArea 
                messages={messages} 
                loading={loading}
                onSelectQuery={handleSelectQuery}
              />
              <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
            </div>
          </div>
      )}
      </>
    </ThemeProvider>
  )
}
