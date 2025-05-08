type PrivacyModalProps = {
    onClose: () => void
}

export default function PrivacyModal({ onClose }: PrivacyModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-black border border-pink-500 rounded-xl max-w-lg w-full p-6 text-white relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                >
                    ×
                </button>

                <h2 className="text-xl font-bold text-pink-400 mb-4">Политика конфиденциальности</h2>

                <div className="text-sm max-h-[60vh] overflow-y-auto pr-2">
                    <p className="mb-4">
                        1. Мы уважаем вашу конфиденциальность и обязуемся защищать персональные данные.
                    </p>
                    <p className="mb-4">
                        2. Собираем только ту информацию, которая необходима для обеспечения работы платформы.
                    </p>
                    <p className="mb-4">
                        3. Ваши данные не передаются третьим лицам, за исключением случаев, предусмотренных законом.
                    </p>
                    <p className="mb-4">
                        4. Вы можете запросить удаление ваших данных, обратившись в поддержку.
                    </p>
                    <p className="mb-4">
                        5. Используем cookies для улучшения пользовательского опыта.
                    </p>
                    <p className="text-xs text-gray-400 mt-6">Последнее обновление: 01.05.2025</p>
                </div>
            </div>
        </div>
    )
}
