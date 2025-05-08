import { useState } from 'react'
import { FaTelegramPlane, FaEnvelope } from 'react-icons/fa'
import TermsModal from '@widgets/Terms/TermsModal.tsx'
import PrivacyModal from '@/widgets/Privacy/PrivacyModal.tsx'
import { en } from '@lang/en.ts'
import { ru } from '@lang/ru.ts'

const language = localStorage.getItem('lang') || 'en'
const lang = language === 'ru' ? ru : en


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
                            <h3 className="text-pink-500 font-bold text-sm mb-2 uppercase tracking-wide">{lang.footer.aboutTitle}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                {lang.footer.aboutText}
                            </p>
                        </div>

                        <div className="min-w-[160px] flex-1">
                            <h3 className="text-pink-500 font-bold text-sm mb-2 uppercase tracking-wide">{lang.footer.navigationTitle}</h3>
                            <div className="flex flex-col gap-1">
                                <a href="/lobby" className="hover:text-pink-400 transition text-xs">{lang.footer.navLobby}</a>
                                <button
                                    onClick={() => setOpenTerms(true)}
                                    className="text-left hover:text-pink-400 transition text-xs"
                                >
                                    {lang.footer.navTerms}
                                </button>
                                <button
                                    onClick={() => setOpenPrivacy(true)}
                                    className="text-left hover:text-pink-400 transition text-xs"
                                >
                                    {lang.footer.navPrivacy}
                                </button>
                            </div>
                        </div>

                        {/* Контакты */}
                        <div className="min-w-[180px] flex-1">
                            <h3 className="text-pink-500 font-bold text-sm mb-2 uppercase tracking-wide">{lang.footer.contactsTitle}</h3>
                            <div className="flex flex-col gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-pink-400" />
                                    <span>{lang.footer.contactEmail}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaTelegramPlane className="text-pink-400" />
                                    <span>{lang.footer.contactTelegram}</span>
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
