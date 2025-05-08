import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from '@/hooks/useToast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  balance: number
}

interface AuthContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
  user: User | null
  isAuthenticated: boolean
  logout: () => void
  setUser: (user: User | null) => void
}

type RegisterResponse = {
  message: string
}

type LoginResponse = {
  access_token: string
  refresh_token: string
}


const AuthContext = createContext<AuthContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  user: null,
  isAuthenticated: false,
  logout: () => {},
  setUser: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const { error, success } = useToast()

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    document.cookie = `username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    document.cookie = `userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    document.cookie = `email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    document.cookie = `balance=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    document.cookie = `avatarUrl=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`

    setUser(null)
    window.dispatchEvent(new Event('auth-logout'))
    success('Вы успешно вышли из аккаунта')
  }

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return null

      const { data } = await axios.get<User>(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `${token}`,
        },
      })

      const userData = {
        id: data.id,
        email: data.email,
        username: data.username,
        avatarUrl: data.avatarUrl,
        balance: data.balance,
      }

      localStorage.setItem('user', JSON.stringify(userData))

      document.cookie = `userId=${userData.id}; path=/;`
      document.cookie = `email=${encodeURIComponent(userData.email)}; path=/;`
      if (userData.username) {
        document.cookie = `username=${encodeURIComponent(userData.username)}; path=/;`
      }
      if (userData.avatarUrl) {
        document.cookie = `avatarUrl=${encodeURIComponent(userData.avatarUrl)}; path=/;`
      }
      if (userData.balance !== undefined) {
        document.cookie = `balance=${userData.balance}; path=/;`
      }

      return userData
    } catch {
      error('Сессия истекла. Выполнен выход из аккаунта.')
      logout()
      return null
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      fetchMe().then((me) => me && setUser(me))
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        user,
        isAuthenticated: !!user,
        logout,
        setUser,
      }}
    >
      {children}
      <AuthModal isOpen={isOpen} onClose={closeModal} />
    </AuthContext.Provider>
  )
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const { error, success } = useToast()

  const resetState = useCallback(() => {
    setIsLogin(true)
    setEmail('')
    setUsername('')
    setPassword('')
  }, [])

  useEffect(() => {
    if (!isOpen) resetState()
  }, [isOpen, resetState])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const url = `${API_URL}${isLogin ? '/auth/login' : '/auth/register'}`
    const body = isLogin ? { email, password } : { email, password, username }

    try {
      if (!isLogin) {
        const { data } = await axios.post<RegisterResponse>(url, body)
        if (data.message === 'registered') {
          success('Регистрация прошла успешно!')
          onClose()
          return
        }
      }

      const { data } = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
        email,
        password
      })

      if (!data.access_token || !data.refresh_token) {
        throw new Error('Tokens not received')
      }

      localStorage.setItem('accessToken', data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)

      const me = await axios.get<User>(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `${data.access_token}`,
        },
      })

      const userData = {
        id: me.data.id,
        email: me.data.email,
        username: me.data.username,
        avatarUrl: me.data.avatarUrl,
        balance: me.data.balance,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      document.cookie = `userId=${userData.id}; path=/;`
      document.cookie = `email=${encodeURIComponent(userData.email)}; path=/;`
      if (userData.username) {
        document.cookie = `username=${encodeURIComponent(userData.username)}; path=/;`
      }
      if (userData.avatarUrl) {
        document.cookie = `avatarUrl=${encodeURIComponent(userData.avatarUrl)}; path=/;`
      }
      if (userData.balance !== undefined) {
        document.cookie = `balance=${userData.balance}; path=/;`
      }

      window.dispatchEvent(new Event('auth-updated'))
      onClose()
      success('Успешный вход!')
    } catch (err) {
      let message = 'Unknown error'

      if (typeof err === 'object' && err !== null) {
        const e = err as { message?: string; response?: { data?: { message?: string } } }

        if (e.response?.data?.message) {
          message = e.response.data.message
        } else if (e.message) {
          message = e.message
        }
      }

      error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-white rounded-xl p-8 w-full max-w-md shadow-2xl border border-pink-500 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-pink-500 hover:text-pink-400 text-xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded-md bg-black border border-gray-600 mt-1 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm text-gray-300">Username</label>
              <input
                type="text"
                className="w-full p-2 rounded-md bg-black border border-gray-600 mt-1 text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              className="w-full p-2 rounded-md bg-black border border-gray-600 mt-1 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-pink-500 hover:bg-pink-600 transition rounded-md font-semibold"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? 'No account?' : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-pink-400 hover:underline font-medium"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
