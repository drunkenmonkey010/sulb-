import React from 'react'
import Message from './Message'
import WelcomeScreen from './WelcomeScreen'

const ChatArea = ({ messages, loading, onSelectQuery }) => {
  const messagesEndRef = React.useRef(null)
  // console.log("messages",messages);
  

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          <WelcomeScreen onSelectQuery={onSelectQuery} />
        ) : (
          <div className="flex flex-col gap-4 px-4 py-8">
            {messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatArea
