import React from 'react' // ✅ добавлено для JSX
import { useState } from 'react'
import PokerHeader from '@/components/header/header'
import PokerFooter from '@/components/footer/footer'

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile')
    const [showModal, setShowModal] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState('')
    const [preview, setPreview] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const user = {
        nickname: 'AcePlayer',
        balance: 1250,
        elo: 1520,
        stats: {
            gamesPlayed: 240,
            wins: 125,
            chipsWon: 200500,
        },
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-white">
            <PokerHeader currentUser={user} onLogout={() => console.log('Logout')} />

            <main className="flex-grow w-full px-4 py-10 max-w-5xl mx-auto">
                <div className="flex gap-4 mb-6">
                    {['profile', 'history', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-md font-semibold transition ${
                                activeTab === tab ? 'bg-pink-500' : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                            onClick={() => setActiveTab(tab as 'profile' | 'history' | 'settings')}
                        >
                            {{ profile: 'Профиль', history: 'История', settings: 'Настройки' }[tab]}
                        </button>
                    ))}
                </div>

                {activeTab === 'profile' && (
                    <div className="bg-black bg-opacity-40 rounded-xl border border-pink-500 p-6 shadow-xl">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-24 h-24 rounded-full border-2 border-pink-500 bg-gray-800" />
                            <div>
                                <h2 className="text-2xl font-bold">{user.nickname}</h2>
                                <p className="text-green-400 font-medium text-sm">Баланс: ${user.balance}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-400">Сыграно игр</p>
                                <p className="text-xl font-bold text-cyan-400">{user.stats.gamesPlayed}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Побед</p>
                                <p className="text-xl font-bold text-cyan-400">{user.stats.wins}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Выиграно фишек</p>
                                <p className="text-xl font-bold text-cyan-400">{user.stats.chipsWon.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <p className="text-sm text-gray-400 mb-1">Рейтинг Elo</p>
                            <div className="bg-gray-800 w-full h-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-full"
                                    style={{ width: `${Math.min(user.elo / 20, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-xs text-gray-400 mt-1">{user.elo}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-black bg-opacity-40 rounded-xl border border-pink-500 p-6 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">История игр</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex justify-between border-b border-gray-700 pb-2">
                                <span>21.04.2025 — Победа</span>
                                <span className="text-green-400">+500</span>
                            </li>
                            <li className="flex justify-between border-b border-gray-700 pb-2">
                                <span>20.04.2025 — Поражение</span>
                                <span className="text-red-400">-200</span>
                            </li>
                            <li className="flex justify-between border-b border-gray-700 pb-2">
                                <span>19.04.2025 — Победа</span>
                                <span className="text-green-400">+1000</span>
                            </li>
                        </ul>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-black bg-opacity-40 rounded-xl border border-pink-500 p-6 shadow-xl max-w-md">
                        <h3 className="text-xl font-bold mb-6">Настройки профиля</h3>
                        <form className="space-y-6">
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">Никнейм</label>
                                <input
                                    type="text"
                                    placeholder="Введите новый ник"
                                    className="w-full p-2 rounded-md bg-black border border-gray-600 mt-1 text-white"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">Аватар</label>
                                <input
                                    type="text"
                                    placeholder="Ссылка на изображение"
                                    className="w-full p-2 rounded-lg bg-black border border-pink-500 focus:ring-2 focus:ring-pink-500 mt-1 text-white placeholder-gray-500"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                />
                                <label className="mt-3 block text-sm text-gray-400">или загрузите своё изображение:</label>
                                <label className="inline-block mt-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg cursor-pointer text-white font-medium shadow-md transition">
                                    Загрузить файл
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {preview && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-24 h-24 rounded-full border-4 border-pink-500 object-cover shadow-md hover:scale-105 transition"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="w-full py-2 bg-pink-500 hover:bg-pink-600 transition rounded-md font-semibold"
                            >
                                Изменить пароль
                            </button>
                        </form>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-gray-900 rounded-xl p-6 border border-pink-500 shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4 text-white text-center">Изменить пароль</h2>

                            <div className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Старый пароль"
                                    className="w-full p-2 rounded-md bg-black border border-gray-600 text-white"
                                />
                                <input
                                    type="password"
                                    placeholder="Новый пароль"
                                    className="w-full p-2 rounded-md bg-black border border-gray-600 text-white"
                                />
                                <input
                                    type="password"
                                    placeholder="Подтвердите новый пароль"
                                    className="w-full p-2 rounded-md bg-black border border-gray-600 text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                                >
                                    Отмена
                                </button>
                                <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md font-semibold">
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <PokerFooter />
        </div>
    )
}
