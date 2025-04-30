function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-10 text-gray-800 dark:text-white transition-all duration-500">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6">
          🚀 Tailwind CSS Полный Тест
        </h1>

        {/* ✅ Box Test */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition dark:bg-gray-700">
            <h2 className="text-xl font-semibold mb-2">🎨 Цвета</h2>
            <p className="text-blue-600">Синий текст</p>
            <p className="text-red-500 font-bold">Красный жирный</p>
            <p className="text-green-600 underline !text-green-600">
              Зелёный с подчёркиванием
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition dark:bg-gray-700">
            <h2 className="text-xl font-semibold mb-2">📱 Адаптив</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl">
              Размер текста меняется по ширине
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition dark:bg-gray-700 space-y-2">
            <h2 className="text-xl font-semibold">🧩 Hover/Focus</h2>
            <input
              placeholder="Наведи сюда"
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 active:scale-95 transition-transform">
              Кнопка
            </button>
          </div>
        </div>

        {/* ✅ Animation */}
        <div className="text-center pt-10">
          <div className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-full animate-bounce">
            🔁 Анимация bounce
          </div>
        </div>

        {/* ✅ Dark info */}
        <div className="text-center pt-10 text-gray-500 dark:text-gray-400 text-sm">
          Переключи <code>class="dark"</code> на html и перезапусти для тёмной темы 🌙
        </div>
      </div>
    </div>
  );
}

export default App;
