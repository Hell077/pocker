import { FC } from "react";

const App: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 animate-pulse">🚀 Tailwind UI Showcase</h1>
        <p className="text-lg text-gray-300">Styled using Tailwind CSS</p>
      </header>

      <main className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 border-b border-white/30 pb-2">📋 Styled Table</h2>
          <table className="w-full table-auto border-collapse border border-white/20 text-sm">
            <thead>
            <tr className="bg-white/10">
              <th className="border border-white/20 px-4 py-2">Name</th>
              <th className="border border-white/20 px-4 py-2">Age</th>
              <th className="border border-white/20 px-4 py-2">Status</th>
            </tr>
            </thead>
            <tbody>
            <tr className="hover:bg-white/5 transition">
              <td className="border border-white/20 px-4 py-2">Alice</td>
              <td className="border border-white/20 px-4 py-2">25</td>
              <td className="border border-white/20 px-4 py-2 text-green-400">Active</td>
            </tr>
            <tr className="hover:bg-white/5 transition">
              <td className="border border-white/20 px-4 py-2">Bob</td>
              <td className="border border-white/20 px-4 py-2">30</td>
              <td className="border border-white/20 px-4 py-2 text-yellow-300">Pending</td>
            </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 border-b border-white/30 pb-2">🎨 Buttons & Effects</h2>
          <div className="flex gap-4 flex-wrap">
            <button className="bg-indigo-500 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow transition">Primary</button>
            <button className="bg-green-500 hover:bg-green-700 px-4 py-2 rounded-lg shadow transition">Success</button>
            <button className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded-lg shadow transition">Danger</button>
            <button className="bg-yellow-400 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg shadow transition">Warning</button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b border-white/30 pb-2">📦 Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/10 p-4 rounded-lg shadow hover:scale-105 transition">
                <h3 className="text-xl font-bold mb-2">Card #{n}</h3>
                <p className="text-sm text-gray-300">This is a simple card with some text content and hover effect.</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-gray-400 text-sm">
        © 2025 Tailwind Template Example
      </footer>
    </div>
  );
};

export default App;
