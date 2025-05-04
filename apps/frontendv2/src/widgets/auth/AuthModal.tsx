import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const AuthContext = createContext<{
    isOpen: boolean
    openModal: () => void
    closeModal: () => void
}>({
    isOpen: false,
    openModal: () => void 0,
    closeModal: () => void 0,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false)

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    return (
        <AuthContext.Provider value={{ isOpen, openModal, closeModal }}>
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
    const [nickname, setNickname] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')

    const resetState = useCallback(() => {
        setIsLogin(true)
        setEmail('')
        setNickname('')
        setPassword('')
        setCode('')
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) resetState()
    }, [isOpen, resetState])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLogin) {
            console.log('Login', { email, password })
        } else {
            console.log('Register', { email, nickname, password, code })
        }
        onClose()
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
                <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Register'}</h2>
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
                        <>
                            <div>
                                <label className="text-sm text-gray-300">Nickname</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-md bg-black border border-gray-600 mt-1 text-white"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300">Code</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-md bg-black border border-gray-600 mt-1 text-white"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                            </div>
                        </>
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
                    >
                        {isLogin ? 'Login' : 'Register'}
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
