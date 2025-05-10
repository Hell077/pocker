import Card from './Card'

const PlayerCards = () => {
  const cards = ['🂡', '🂱']

  return (
    <div className="flex gap-2 mt-2">
      {cards.map((symbol, idx) => (
        <Card key={idx} symbol={symbol} />
      ))}
    </div>
  )
}

export default PlayerCards
