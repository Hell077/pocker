import { useState } from 'react'
import { FaTelegramPlane, FaEnvelope } from 'react-icons/fa'
import TermsModal from '@widgets/Terms/TermsModal.tsx'
import PrivacyModal from '@/widgets/Privacy/PrivacyModal.tsx'

export default function PokerFooter() {
    const [openTerms, setOpenTerms] = useState(false)
    const [openPrivacy, setOpenPrivacy] = useState(false)

    return (
        <>
            {openTerms && <TermsModal onClose={() => setOpenTerms(false)} />}
            {openPrivacy && <PrivacyModal onClose={() => setOpenPrivacy(false)} />}

            <footer className="w-full bg-black bg-opacity-70 backdrop-blur-md text-white border-t border-pink-500 mt-auto">
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col gap-6 text-sm">
                    <div className="flex flex-wrap justify-between gap-8 text-gray-300">

                        {/* О платформе */}
                        <div className="min-w-[200px] flex-1">
                            <h3 className="text-pink-500 font-bold text-sm mb-2 uppercase tracking-wide">О платформе</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                POCKER — онлайн-платформа для игры в покер с друзьями и соперниками со всего мира.
                            </p>
                        </div>

                        {/* Навигация */}
                        <div className="min-w-[160px] flex-1">
                            <h3 className="text-pink-500 font-bold text-sm mb-2 uppercase tracking-wide">Навигация</h3>
                            <div className="flex flex-col gap-1">
                                <a href="/lobby" className="hover:text-pink-400 transition text-xs">Lobby</a>
                                <button
                                    onClick={() => setOpenTerms(true)}
                                    className="text-left hover:text-pink-400 transition text-xs"
                                >
                                    Условия
                                </button>
                                <button
                                    onClick={() => setOpenPrivacy(true)}
                                    className="text-left hover:text-pink-400 transition text-xs"
                                >
                                    Конфиденциальность
                                </button>
                            </div>
                        </div>

                        {/* Контакты */}
                        <div className="min-w-[180px] flex-1">
                            <h3 className="text-pink-500 font-bold text-sm mb-2 uppercase tracking-wide">Контакты</h3>
                            <div className="flex flex-col gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-pink-400" />
                                    <span>support@pocker.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaTelegramPlane className="text-pink-400" />
                                    <span>@pocker_support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-pink-500 text-center text-gray-500 text-[10px] pt-3">
                        © 2025 Pocker Inc. Все права защищены.
                    </div>
                </div>
            </footer>
        </>
    )
}
