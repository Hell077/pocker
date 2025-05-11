
import { useState } from 'react'
import { FaHistory } from 'react-icons/fa'

const mockHistory = [
  { winner: 'Player 1', hand: ['AH', 'KH'], win: 450 },
  { winner: 'Player 3', hand: ['7C', '7H'], win: 320 },
  { winner: 'Player 6', hand: ['10D', 'JD'], win: 650 },
]

export default function HandHistory() {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute top-4 right-4 z-50">
      <button onClick={() => setOpen(!open)} className="text-white hover:text-yellow-400">
        <FaHistory size={24} />
      </button>

      {open && (
        <div className="absolute top-8 right-0 w-64 bg-black bg-opacity-90 text-white p-4 rounded-xl shadow-xl border border-yellow-400">
          <h3 className="text-lg font-bold mb-2">Hand History</h3>
          <ul className="text-sm space-y-2 max-h-48 overflow-y-auto">
            {mockHistory.map((item, idx) => (
              <li key={idx}>
                🏆 <strong>{item.winner}</strong> won <span className="text-green-400">${item.win}</span><br />
                <span className="text-gray-400">[{item.hand.join(', ')}]</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
