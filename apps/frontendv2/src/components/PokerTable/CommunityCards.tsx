import Card from './Card'

interface CommunityCardsProps {
  cards: string[]
}

const CommunityCards = ({ cards }: CommunityCardsProps) => {
  return (
    <div className="flex gap-2">
      {cards.map((symbol, idx) => (
        <Card key={idx} symbol={symbol} />
      ))}
    </div>
  )
}

export default CommunityCards
