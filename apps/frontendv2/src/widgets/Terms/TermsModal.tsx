type TermsModalProps = {
    onClose: () => void
}

export default function TermsModal({ onClose }: TermsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-black border border-pink-500 rounded-xl max-w-lg w-full p-6 text-white relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                >
                    ×
                </button>

                <h2 className="text-xl font-bold text-pink-400 mb-4">Условия использования</h2>

                <div className="text-sm max-h-[60vh] overflow-y-auto pr-2">
                    <p className="mb-4">
                        1. Платформа предназначена для игры в покер в развлекательных целях. Все игроки должны быть старше 18 лет.
                    </p>
                    <p className="mb-4">
                        2. Пользователь обязуется не использовать мультиаккаунты и не нарушать правила честной игры. В случае нарушений аккаунт может быть заблокирован.
                    </p>
                    <p className="mb-4">
                        3. Все виртуальные фишки не имеют реальной денежной стоимости и не подлежат возврату.
                    </p>
                    <p className="mb-4">
                        4. Администрация не несёт ответственности за перебои в работе сервиса, вызванные техническими причинами.
                    </p>
                    <p className="mb-4">
                        5. Платформа оставляет за собой право изменять данные условия без предварительного уведомления.
                    </p>
                    <p className="text-xs text-gray-400 mt-6">Последнее обновление: 01.05.2025</p>
                </div>
            </div>
        </div>
    )
}
