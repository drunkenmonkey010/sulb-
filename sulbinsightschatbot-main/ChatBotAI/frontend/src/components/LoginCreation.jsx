import { useState } from 'react'
import { LogIn, Mail, Lock, User } from 'lucide-react'

export default function LoginCreation({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    setIsLoading(true)

    try {
      // Call backend authentication endpoint
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/signin'
      const payload = mode === 'signup' 
        ? { email, password, name }
        : { email, password }

      console.log(`[${mode}] Sending to ${endpoint}:`, payload)

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log(`[${mode}] Response status:`, response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[${mode}] HTTP Error ${response.status}:`, errorText)
        setError(`Server error ${response.status}: ${errorText.substring(0, 100)}`)
        setIsLoading(false)
        return
      }
      
      const data = await response.json()
      console.log(`[${mode}] Response data:`, data)

      if (data && typeof data.success === 'boolean' && data.success === true) {
        // Auth successful - pass to parent
        const userData = {
          email,
          name: data.name || name || email.split('@')[0],
          mode
        }
        console.log('[login] Success! User data:', userData)
        onLogin(userData)
      } else {
        // Auth failed - show error from backend
        const errorMsg = data?.message || 'Authentication failed'
        console.log('[error] Auth failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('[error] Exception:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setName('')
    setConfirmPassword('')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/images/iris-logo.png" 
            alt="IRIS Logo" 
            className="h-48 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">
          Welcome to SULB Insights AI
        </h1>
        {/* Subtitle */}
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-6">
          Secured & Unsecured Loan Business Analytics Assistant
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <User size={16} className="inline mr-2" />
                Full Name
              </label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent transition-colors"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Password Field */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              <Lock size={16} className="inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <Lock size={16} className="inline mr-2" />
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent transition-colors"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
              </>
            )}
          </button>

          {/* Toggle Mode */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
              className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline transition-colors disabled:text-gray-400 dark:disabled:text-gray-600"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-6">
            Secure analytics for loan portfolio management
          </p>
        </form>
      </div>
    </div>
  )
}
