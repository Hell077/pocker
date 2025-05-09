const TableBackground = () => {
    return (
        <div className="absolute inset-0 z-0">
            {/* Основной тёмный фон */}
            <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#0a0a0a] absolute inset-0" />

            {/* Центральное свечение (зелёный овал) */}
            <div className="absolute top-1/2 left-1/2 w-[1000px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-900 opacity-30 blur-3xl pointer-events-none" />

            {/* Неоновая рамка — пульсирует */}
            <div className="absolute top-1/2 left-1/2 w-[1000px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-green-400 opacity-25 animate-pulse pointer-events-none" />
        </div>
    )
}

export default TableBackground
